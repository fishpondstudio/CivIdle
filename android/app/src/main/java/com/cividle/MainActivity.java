package com.cividle;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.openforge.capacitorgameconnect.CapacitorGameConnectPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(CapacitorGameConnectPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
