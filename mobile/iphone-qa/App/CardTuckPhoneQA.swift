import SwiftUI

@main
struct CardTuckPhoneQA: App {
    var body: some Scene {
        WindowGroup {
            Button("Open CardTuck test in Safari") {
                UIApplication.shared.open(URL(string: "http://127.0.0.1:8086/")!)
            }
        }
    }
}
