#import <Capacitor/Capacitor.h>

CAP_PLUGIN(GameCenterPlugin, "GameCenter",
    CAP_PLUGIN_METHOD(getAuthTicket, CAPPluginReturnPromise);
)
