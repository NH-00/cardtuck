import XCTest

final class PhoneHandoffTests: XCTestCase {
    private func text(_ app: XCUIApplication, _ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(
            NSPredicate(format: "label == %@ OR value == %@", label, label)
        ).firstMatch
    }

    private func tapIfPresent(_ app: XCUIApplication, _ label: String, timeout: TimeInterval = 2) -> Bool {
        let item = text(app, label)
        guard item.waitForExistence(timeout: timeout), item.isHittable else { return false }
        item.tap()
        return true
    }

    func testSafariOpensPrefilledContactEditor() {
        continueAfterFailure = false
        let fixture = XCUIApplication()
        fixture.launch()

        let shortcuts = XCUIApplication(bundleIdentifier: "com.apple.shortcuts")
        shortcuts.launch()
        _ = tapIfPresent(shortcuts, "Continue", timeout: 5)

        let files = XCUIApplication(bundleIdentifier: "com.apple.DocumentsApp")
        files.launch()
        _ = tapIfPresent(files, "Continue")
        _ = tapIfPresent(files, "Browse")
        XCTAssertTrue(tapIfPresent(files, "On My iPhone", timeout: 8), files.debugDescription)
        XCTAssertTrue(tapIfPresent(files, "CardTuck QA", timeout: 8), files.debugDescription)
        let shortcutFile = files.descendants(matching: .any).matching(
            NSPredicate(format: "label BEGINSWITH %@", "CardTuck Add Contact")
        ).firstMatch
        XCTAssertTrue(shortcutFile.waitForExistence(timeout: 8), files.debugDescription)
        shortcutFile.tap()

        if files.state == .runningForeground {
            print("Files after opening the signed shortcut:\n\(files.debugDescription)")
            _ = tapIfPresent(files, "Open in Shortcuts") || tapIfPresent(files, "Open")
        }
        let importer = shortcuts.state == .runningForeground ? shortcuts : files
        _ = tapIfPresent(importer, "Continue")
        let added = tapIfPresent(importer, "Add Shortcut", timeout: 10)
        if !added {
            for app in [files, shortcuts] where app.state == .runningForeground {
                print(app.debugDescription)
            }
        }
        XCTAssertTrue(added, "The iPhone did not offer Add Shortcut after opening the signed file.")

        fixture.activate()
        fixture.buttons["Open CardTuck test in Safari"].tap()
        let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        _ = tapIfPresent(safari, "Continue")
        let handoff = safari.links["Add to Contacts"]
        XCTAssertTrue(handoff.waitForExistence(timeout: 25), safari.debugDescription)
        handoff.tap()

        let system = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        _ = tapIfPresent(safari, "Open")
        _ = tapIfPresent(system, "Open")
        _ = tapIfPresent(shortcuts, "Allow Once", timeout: 4)
        _ = tapIfPresent(system, "Allow Once")

        XCTAssertTrue(
            text(shortcuts, "New Contact").waitForExistence(timeout: 12) || text(system, "New Contact").exists,
            shortcuts.debugDescription + "\n" + system.debugDescription
        )
        for field in ["Maya", "Chen", "Studio Tidemark", "maya@tidemark.example"] {
            XCTAssertTrue(text(shortcuts, field).exists || text(system, field).exists, "Missing prefilled field: \(field)")
        }
        let phoneNumber = "6045550142"
        let phoneMatches = [shortcuts, system].contains { app in
            app.textFields.allElementsBoundByIndex.contains { field in
                (field.value as? String ?? "").filter(\.isNumber).hasSuffix(phoneNumber)
            }
        }
        XCTAssertTrue(phoneMatches, "Missing the prefilled phone number")
        print("iPhone Safari opened Apple's native contact editor with the expected fields.")
    }
}
