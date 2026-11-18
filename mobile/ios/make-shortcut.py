"""Build the CardTuck shortcut plist locally. The workflow only opens the compose sheet."""
from pathlib import Path
import plistlib
import sys
import uuid


def action(name, **parameters):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions." + name,
        "WFWorkflowActionParameters": parameters,
    }


def token(attachment):
    return {
        "WFSerializationType": "WFTextTokenString",
        "Value": {"string": "\ufffc", "attachmentsByRange": {"{0, 1}": attachment}},
    }


def output_id(name):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "https://cardtuck.app/shortcut/" + name)).upper()


keys = {
    "firstname": "WFContactFirstName",
    "lastname": "WFContactLastName",
    "company": "WFContactCompany",
    "phone": "WFContactPhoneNumbers",
    "email": "WFContactEmails",
}

shortcut_input = {"WFSerializationType": "WFTextTokenAttachment", "Value": {"Type": "ExtensionInput"}}
workflow = [
    action("comment", WFCommentActionText="CardTuck only passes the selected contact. Tap Done to save it."),
]
editor = {"ShowWhenRun": True}
for field, parameter in keys.items():
    uid = output_id(field)
    workflow.append(
        action(
            "getvalueforkey",
            UUID=uid,
            WFInput=shortcut_input,
            WFGetDictionaryValueType="Value",
            WFDictionaryKey=field,
        )
    )
    editor[parameter] = token({"Type": "ActionOutput", "OutputName": "Dictionary Value", "OutputUUID": uid})

workflow.append(action("addnewcontact", **editor))

shortcut = {
    "WFWorkflowClientVersion": "3036.0.4",
    "WFWorkflowMinimumClientVersion": 900,
    "WFWorkflowMinimumClientVersionString": "900",
    "WFWorkflowHasShortcutInputVariables": True,
    "WFWorkflowImportQuestions": [],
    "WFWorkflowTypes": [],
    "WFWorkflowInputContentItemClasses": ["WFStringContentItem"],
    "WFWorkflowIcon": {"WFWorkflowIconStartColor": 431817727, "WFWorkflowIconGlyphNumber": 59511},
    "WFWorkflowActions": workflow,
}

Path(sys.argv[1]).write_bytes(plistlib.dumps(shortcut, fmt=plistlib.FMT_BINARY))
