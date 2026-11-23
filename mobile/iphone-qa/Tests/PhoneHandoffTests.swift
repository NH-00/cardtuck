import XCTest

final class PhoneHandoffTests: XCTestCase {
    private func text(_ app: XCUIApplication, _ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(
            NSPredicate(format: "label == %@ OR value == %@", label, label)
        ).firstMatch
    }

    private func openFixtureInSafari() -> XCUIApplication {
        continueAfterFailure = false
        let fixture = XCUIApplication()
        fixture.launch()
        fixture.buttons["Open CardTuck test in Safari"].tap()
        let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        XCTAssertTrue(safari.wait(for: .runningForeground, timeout: 20), "Safari did not open.")
        let newSafariTip = safari.buttons.matching(identifier: "xmark.circle.fill").firstMatch
        if newSafariTip.waitForExistence(timeout: 4), newSafariTip.isHittable {
            newSafariTip.tap()
        }
        return safari
    }

    func testAddToContactsOpensThePrefilledAppleEditor() {
        let safari = openFixtureInSafari()
        let add = safari.links["Add to Contacts"]
        XCTAssertTrue(add.waitForExistence(timeout: 50), safari.debugDescription)
        add.tap()
        let name = text(safari, "Maya Chen")
        XCTAssertTrue(name.waitForExistence(timeout: 20), safari.debugDescription)
        XCTAssertTrue(text(safari, "maya@tidemark.example").exists, safari.debugDescription)
        let create = text(safari, "Create New Contact")
        if !create.isHittable { safari.swipeUp() }
        XCTAssertTrue(create.isHittable, safari.debugDescription)
        create.tap()
        XCTAssertTrue(text(safari, "New Contact").waitForExistence(timeout: 12), safari.debugDescription)
        for field in ["Maya", "Chen", "Studio Tidemark"] {
            XCTAssertTrue(text(safari, field).exists, "Missing prefilled field: \(field)")
        }
        let phonePresent = safari.textFields.allElementsBoundByIndex.contains { field in
            (field.value as? String ?? "").filter(\.isNumber).hasSuffix("6045550142")
        }
        XCTAssertTrue(phonePresent, "The editor did not show the sample phone number.")
    }

    func testDownloadVCardSavesAFileInSafari() {
        let safari = openFixtureInSafari()
        let download = safari.links["Download vCard"]
        XCTAssertTrue(download.waitForExistence(timeout: 50), safari.debugDescription)
        download.tap()
        let confirm = safari.buttons["Download"]
        XCTAssertTrue(confirm.waitForExistence(timeout: 15), safari.debugDescription)
        confirm.tap()
        let menu = safari.buttons.matching(identifier: "PageFormatMenuButton").firstMatch
        XCTAssertTrue(menu.waitForExistence(timeout: 8), safari.debugDescription)
        menu.tap()
        let downloads = text(safari, "Downloads")
        XCTAssertTrue(downloads.waitForExistence(timeout: 8), safari.debugDescription)
        downloads.tap()
        let file = safari.cells.matching(NSPredicate(format: "label CONTAINS[c] %@", "Maya Chen")).firstMatch
        XCTAssertTrue(file.waitForExistence(timeout: 12), safari.debugDescription)
    }
}
