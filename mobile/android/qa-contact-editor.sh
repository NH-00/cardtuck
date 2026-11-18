#!/usr/bin/env bash
set -euo pipefail

tmp="$(mktemp -d)"
emulator_pid=""
finish() {
  result=$?
  if [[ "$result" != 0 ]]; then
    tail -20 "$tmp/emulator.log" 2>/dev/null || true
    adb -s emulator-5560 logcat -d -s AndroidRuntime 2>/dev/null | tail -35 || true
    if [[ -s "$tmp/editor.xml" ]]; then
      python3 -c 'import sys,xml.etree.ElementTree as E; r=E.parse(sys.argv[1]); print([(n.get("text"),n.get("content-desc")) for n in r.iter("node") if n.get("text") or n.get("content-desc")])' "$tmp/editor.xml" || true
    fi
  fi
  if [[ -n "$emulator_pid" ]]; then kill "$emulator_pid" 2>/dev/null || true; fi
  rm -rf "$tmp"
  exit "$result"
}
trap finish EXIT

emulator -avd CardTuckTest -port 5560 -no-window -no-boot-anim -no-audio -no-snapshot -gpu swiftshader_indirect \
  -camera-back none -camera-front none -no-metrics > "$tmp/emulator.log" 2>&1 &
emulator_pid=$!
droid() { adb -s emulator-5560 "$@"; }

export CARDTUCK_ANDROID_KEYSTORE="$tmp/qa-signing.p12"
export CARDTUCK_ANDROID_KEYSTORE_PASSWORD="$(openssl rand -hex 24)"
keytool -genkeypair -keystore "$CARDTUCK_ANDROID_KEYSTORE" -storepass:env CARDTUCK_ANDROID_KEYSTORE_PASSWORD \
  -keyalg RSA -keysize 2048 -validity 1 -alias cardtuck-qa -dname 'CN=CardTuck emulator test'
bash mobile/android/build.sh "$tmp/cardtuck.apk"
unset CARDTUCK_ANDROID_KEYSTORE_PASSWORD
if "$ANDROID_HOME/build-tools/35.0.1/aapt2" dump permissions "$tmp/cardtuck.apk" | grep 'uses-permission'; then
  printf 'The helper requested an Android permission.\n' >&2
  exit 1
fi

ready=""
for attempt in {1..75}; do
  if ! kill -0 "$emulator_pid" 2>/dev/null; then exit 1; fi
  ready="$(droid shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  if [[ "$ready" = 1 ]]; then break; fi
  sleep 4
done
[[ "$ready" = 1 ]]
printf 'Booted Android %s.\n' "$(droid shell getprop ro.build.version.release | tr -d '\r')"
droid install "$tmp/cardtuck.apk"
droid shell input keyevent KEYCODE_WAKEUP
droid shell wm dismiss-keyguard

intent="$(node --input-type=module - <<'JS'
import { contactHandoffUrl } from './src/lib/contact-handoff.ts';
const sample = {
  name: 'Avery North', firstname: 'Avery', lastname: 'North', company: 'Tidemark Studio',
  email: 'avery@tidemark.example', phone: '+16045550142', title: 'Design Director',
  website: 'https://tidemark.example', address: '42 Main Street'
};
process.stdout.write(contactHandoffUrl('android', sample));
JS
)"
droid shell "am start -W '$intent'"

read_editor() {
  droid shell uiautomator dump --compressed /sdcard/cardtuck-editor.xml >/dev/null 2>&1 &&
    droid exec-out cat /sdcard/cardtuck-editor.xml > "$tmp/editor.xml"
}

editor_found=""
for attempt in {1..12}; do
  if read_editor && grep -q 'avery@tidemark.example' "$tmp/editor.xml"; then editor_found=1; break; fi
  sleep 2
done
[[ "$editor_found" = 1 ]]
tap="$(python3 - "$tmp/editor.xml" <<'PY'
import re
import sys
from xml.etree import ElementTree as ET
nodes = list(ET.parse(sys.argv[1]).iter("node"))
values = " ".join(n.get("text", "") for n in nodes)
assert "Avery" in values and "North" in values
assert "avery@tidemark.example" in values
assert "6045550142" in re.sub(r"\D", "", values)
assert any("contacts" in n.get("package", "") and n.get("package") != "app.cardtuck.contacts" for n in nodes)
for element in nodes:
    if element.get("text", "").strip().lower() == "save" or element.get("content-desc", "").strip().lower() == "save":
        left, top, right, bottom = map(int, re.findall(r"\d+", element.attrib["bounds"]))
        print((left + right) // 2, (top + bottom) // 2)
        break
else:
    raise RuntimeError("The native editor did not show the Save control.")
PY
)"
printf 'Android opened its native prefilled editor with name, phone, email, and Save.\n'
read -r tap_x tap_y <<< "$tap"
droid shell input tap "$tap_x" "$tap_y"
for attempt in {1..10}; do
  if read_editor && grep -q 'Avery North' "$tmp/editor.xml" && ! grep -qi 'text="Save"' "$tmp/editor.xml"; then
    printf 'Android saved and displayed the fictional contact.\n'
    exit 0
  fi
  sleep 2
done
printf 'Tapped Save, but Android did not display the saved contact.\n' >&2
exit 1
