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
        XCUIApplication().launch()

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

        let shortcuts = XCUIApplication(bundleIdentifier: "com.apple.shortcuts")
        _ = tapIfPresent(files, "Open in Shortcuts")
        _ = tapIfPresent(shortcuts, "Continue")
        XCTAssertTrue(
            tapIfPresent(shortcuts, "Add Shortcut", timeout: 8) || tapIfPresent(files, "Add Shortcut"),
            shortcuts.debugDescription + "\n" + files.debugDescription
        )

        let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        safari.activate()
        _ = tapIfPresent(safari, "Continue")
        let handoff = safari.links["Add to Contacts"]
        XCTAssertTrue(handoff.waitForExistence(timeout: 10), safari.debugDescription)
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
        print("iPhone Safari opened Apple's native contact editor with the expected fields.")
    }
}
