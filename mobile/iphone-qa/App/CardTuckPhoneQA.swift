import SwiftUI

@main
struct CardTuckPhoneQA: App {
    var body: some Scene {
        WindowGroup {
            Text("CardTuck QA")
                .onAppear {
                    guard let source = Bundle.main.url(forResource: "CardTuck Add Contact", withExtension: "shortcut"),
                          let folder = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
                        return
                    }
                    let target = folder.appendingPathComponent(source.lastPathComponent)
                    if !FileManager.default.fileExists(atPath: target.path) {
                        try? FileManager.default.copyItem(at: source, to: target)
                    }
                }
        }
    }
}
