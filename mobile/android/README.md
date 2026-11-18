# CardTuck Contacts on Android

The helper receives a single contact from Chrome and opens Android’s new-contact editor. Android asks the user to review and save or discard the entry. The helper requests no Contacts or network permissions.

## Build the APK

Install a JDK (17 or later), [Android SDK Platform 35 and Build Tools 35.0.1](https://developer.android.com/studio/intro/update#sdk-manager), and command-line `zip`. Set `ANDROID_HOME` to the Android SDK path. Use a persistent private signing keystore for public builds and updates.

```sh
export CARDTUCK_ANDROID_KEYSTORE=/absolute/path/to/cardtuck-signing.p12
bash mobile/android/build.sh "$PWD/public/mobile/cardtuck-contacts.apk"
```

The signing tool prompts for the password. For automated builds, provide `CARDTUCK_ANDROID_KEYSTORE_PASSWORD` as a protected environment variable. Keep the same signing key for updates. The APK includes the MIT license and its original copyright notice.

Open the APK on an Android 8.0 or later test phone, then open a saved person in CardTuck in Chrome. Tap **Add to Contacts**, confirm the fields, then save or cancel. Try **Download vCard** with the helper uninstalled. The fallback is available from the same CardTuck screen.
