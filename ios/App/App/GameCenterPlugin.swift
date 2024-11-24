import Capacitor
import GameKit

@objc(GameCenterPlugin)
public class GameCenterPlugin: CAPPlugin {
    
    var authTicket = ""
    
    @objc func getAuthTicket(_ call: CAPPluginCall) {
        if (!authTicket.isEmpty) {
            call.resolve(["ticket": self.authTicket])
        }
        GKLocalPlayer.local.authenticateHandler = { viewController, error in
            if let viewController = viewController {
                self.bridge?.viewController?.present(viewController, animated: true)
                return
            }
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            if #available(iOS 13.5, *) {
                GKLocalPlayer.local.fetchItems { publicKeyUrl, signature, salt, timestamp, error in
                    if let error = error {
                        call.reject(error.localizedDescription)
                        return
                    }
                    let ticket = AuthTicket(playerId: GKLocalPlayer.local.teamPlayerID, publicKeyUrl: publicKeyUrl, signature: signature, timestamp: timestamp, salt: salt, bundleId: Bundle.main.bundleIdentifier)
                    let json = try! JSONEncoder().encode(ticket)
                    self.authTicket = json.base64EncodedString()
                    call.resolve(["ticket": self.authTicket])
                    
                }
            } else {
                call.reject("Game Center login requires iOS 13.5")
            }
        }
    }
}

struct AuthTicket : Codable {
    var playerId: String
    var publicKeyUrl: URL?
    var signature: Data?
    var timestamp: UInt64
    var salt: Data?
    var bundleId: String?
}
