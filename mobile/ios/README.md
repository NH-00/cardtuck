# CardTuck Add Contact for iPhone

The Shortcut opens the system contact editor with the selected person’s name, company, phone, and email. **Show Compose Sheet** stays enabled so the person using CardTuck can review and save the contact. To transfer additional structured fields, use **Download vCard**.

## Build the Shortcut

Use Python 3 and the Shortcuts app on macOS. From the project root:

```sh
python3 mobile/ios/make-shortcut.py "/tmp/CardTuck Add Contact.shortcut"
shortcuts sign --mode anyone --input "/tmp/CardTuck Add Contact.shortcut" \
  --output "$PWD/public/mobile/CardTuck Add Contact.shortcut"
```

On an iPhone, use **One-time setup** in CardTuck and add the Shortcut. Keep the name **CardTuck Add Contact**. Then open a saved fictional contact in Safari, tap **Add to Contacts**, and check the compose sheet. Cancel once to confirm that the contact is not saved. Run again and tap **Done** to confirm an intentional save.
