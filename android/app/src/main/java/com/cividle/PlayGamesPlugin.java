package com.cividle;

import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;

@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {

    private static final String TAG = "PlayGames";

    @Override
    public void load() {
        PlayGamesSdk.initialize(getContext());
    }

    @PluginMethod
    public void requestServerSideAccess(PluginCall call) {
        GamesSignInClient gamesSignInClient = PlayGames.getGamesSignInClient(getActivity());
        gamesSignInClient
                .requestServerSideAccess(call.getString("clientId"), false)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        String serverAuthToken = task.getResult();
                        JSObject ret = new JSObject();
                        ret.put("serverAuthToken", serverAuthToken);
                        call.resolve(ret);
                    } else {
                        call.reject("Failed to get server auth token: " + task.getException().getMessage());
                    }
                });
    }
}
