package app.cardtuck.contacts;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.ContactsContract;
import android.provider.ContactsContract.CommonDataKinds.Website;
import android.provider.ContactsContract.Intents.Insert;

import org.json.JSONException;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

public final class ContactActivity extends Activity {
    private static final int MAX_PAYLOAD_BYTES = 8192;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Intent incoming = getIntent();
        Uri uri = incoming.getData();

        if (!Intent.ACTION_VIEW.equals(incoming.getAction()) || uri == null
                || !"cardtuck-contacts".equals(uri.getScheme()) || !"add".equals(uri.getHost())) {
            showMessage("Open a saved contact in CardTuck and tap Add to Contacts.");
            return;
        }

        try {
            String payload = incoming.getStringExtra("payload");
            if (payload == null || payload.getBytes(StandardCharsets.UTF_8).length > MAX_PAYLOAD_BYTES) {
                throw new IllegalArgumentException("Invalid contact data");
            }
            Intent editor = newContactIntent(new JSONObject(payload));
            startActivity(editor);
            finish();
        } catch (ActivityNotFoundException error) {
            showMessage("This phone couldn’t open a contact editor. Go back to CardTuck and download the vCard.");
        } catch (JSONException | IllegalArgumentException | android.os.BadParcelableException error) {
            showMessage("This contact couldn’t be opened. Go back to CardTuck and download the vCard.");
        }
    }

    private static Intent newContactIntent(JSONObject contact) {
        String first = field(contact, "firstname");
        String last = field(contact, "lastname");
        String company = field(contact, "company");
        String title = field(contact, "title");
        String email = field(contact, "email");
        String phone = field(contact, "phone");
        String address = field(contact, "address");
        String website = field(contact, "website");
        if ((first + last + company + title + email + phone + address + website).isEmpty()) {
            throw new IllegalArgumentException("Empty contact");
        }

        Intent editor = new Intent(Intent.ACTION_INSERT, ContactsContract.Contacts.CONTENT_URI);
        put(editor, Insert.NAME, (first + " " + last).trim());
        put(editor, Insert.COMPANY, company);
        put(editor, Insert.JOB_TITLE, title);
        put(editor, Insert.EMAIL, email);
        put(editor, Insert.PHONE, phone);
        put(editor, Insert.POSTAL, address);

        if (!website.isEmpty()) {
            ContentValues row = new ContentValues();
            row.put(ContactsContract.Data.MIMETYPE, Website.CONTENT_ITEM_TYPE);
            row.put(Website.URL, website);
            ArrayList<ContentValues> details = new ArrayList<>();
            details.add(row);
            editor.putParcelableArrayListExtra(Insert.DATA, details);
        }
        return editor;
    }

    private static String field(JSONObject contact, String key) {
        Object value = contact.opt(key);
        if (value instanceof String text && text.length() <= 1001) return text.trim();
        return "";
    }

    private static void put(Intent intent, String key, String value) {
        if (!value.isEmpty()) intent.putExtra(key, value);
    }

    private void showMessage(String text) {
        new AlertDialog.Builder(this)
                .setTitle("CardTuck Contacts")
                .setMessage(text)
                .setPositiveButton(android.R.string.ok, (dialog, which) -> finish())
                .setOnCancelListener(dialog -> finish())
                .show();
    }
}
