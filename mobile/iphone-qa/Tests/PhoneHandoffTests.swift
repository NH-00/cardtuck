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

        fixture.buttons["Open CardTuck test in Safari"].tap()
        let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        XCTAssertTrue(safari.wait(for: .runningForeground, timeout: 15), "Safari did not open from the test app.")
        _ = tapIfPresent(safari, "Continue")
        let download = safari.links["Download CardTuck shortcut"]
        XCTAssertTrue(download.waitForExistence(timeout: 25), safari.debugDescription)
        download.tap()
        let firstUseTipClose = safari.buttons.matching(identifier: "xmark.circle.fill").firstMatch
        if firstUseTipClose.waitForExistence(timeout: 4), firstUseTipClose.isHittable {
            firstUseTipClose.tap()
        }
        let confirmDownload = safari.buttons["Download"]
        XCTAssertTrue(confirmDownload.waitForExistence(timeout: 12), safari.debugDescription)
        confirmDownload.tap()

        if !tapIfPresent(safari, "Downloads") {
            let pageMenu = safari.buttons.matching(NSPredicate(
                format: "label IN %@ OR identifier CONTAINS[c] %@",
                ["Page Menu", "Page Settings", "Website Settings"], "PageMenu"
            )).firstMatch
            XCTAssertTrue(pageMenu.exists, safari.debugDescription)
            pageMenu.tap()
            XCTAssertTrue(tapIfPresent(safari, "Downloads", timeout: 8), safari.debugDescription)
        }
        let file = safari.descendants(matching: .any).matching(
            NSPredicate(format: "label BEGINSWITH %@", "CardTuck Add Contact")
        ).firstMatch
        XCTAssertTrue(file.waitForExistence(timeout: 10), safari.debugDescription)
        file.tap()

        let shortcuts = XCUIApplication(bundleIdentifier: "com.apple.shortcuts")
        let openedInShortcuts = shortcuts.wait(for: .runningForeground, timeout: 20)
        XCTAssertTrue(openedInShortcuts, safari.state == .runningForeground ? safari.debugDescription : "Safari did not open the signed file in Shortcuts.")
        _ = tapIfPresent(shortcuts, "Continue")
        XCTAssertTrue(tapIfPresent(shortcuts, "Add Shortcut", timeout: 10), shortcuts.debugDescription)

        safari.activate()
        _ = tapIfPresent(safari, "Done")
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
