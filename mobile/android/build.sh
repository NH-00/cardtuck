#!/usr/bin/env bash
set -euo pipefail

# Build a sideloadable APK with the owner's existing signing key. No Gradle or paid service is needed.
: "${ANDROID_HOME:?Set ANDROID_HOME to your Android SDK directory}"
: "${CARDTUCK_ANDROID_KEYSTORE:?Set CARDTUCK_ANDROID_KEYSTORE to a persistent APK signing keystore}"
target="${1:?Usage: bash mobile/android/build.sh /absolute/path/to/cardtuck-contacts.apk}"
here="$(cd "$(dirname "$0")" && pwd)"
tools="$ANDROID_HOME/build-tools/35.0.1"
platform="$ANDROID_HOME/platforms/android-35/android.jar"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/classes" "$tmp/dex"

javac --release 17 -classpath "$platform" -d "$tmp/classes" "$here/src/app/cardtuck/contacts/ContactActivity.java"
"$tools/d8" --release --min-api 26 --lib "$platform" --output "$tmp/dex" \
  "$tmp/classes/app/cardtuck/contacts/ContactActivity.class"
"$tools/aapt2" link -I "$platform" --manifest "$here/AndroidManifest.xml" -o "$tmp/unsigned.apk"
zip -q -j "$tmp/unsigned.apk" "$tmp/dex/classes.dex"
"$tools/zipalign" -f 4 "$tmp/unsigned.apk" "$tmp/aligned.apk"

signing=()
if [[ -n "${CARDTUCK_ANDROID_KEYSTORE_PASSWORD:-}" ]]; then
  signing+=(--ks-pass env:CARDTUCK_ANDROID_KEYSTORE_PASSWORD)
fi
"$tools/apksigner" sign --ks "$CARDTUCK_ANDROID_KEYSTORE" "${signing[@]}" --out "$target" "$tmp/aligned.apk"
"$tools/apksigner" verify "$target"
rm -f "$target.idsig"
