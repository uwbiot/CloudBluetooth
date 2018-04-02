package com.example.bluetoothagent;

import android.bluetooth.BluetoothGatt;

import java.util.HashMap;

/**
 * Created by wei on 3/30/18.
 */

public class DisconnectAction implements BLEAction {
    private String requestId;
    private String macAddress;


    public DisconnectAction(String requestId, String macAddress) {
        this.requestId = requestId;
        this.macAddress = macAddress;
    }
    @Override
    public void execute(HashMap<String, BluetoothGatt> gattHashMap) {

    }

    @Override
    public String getRequestId() {
        return this.requestId;
    }

    @Override
    public String getMacAddress() {return this.macAddress;}
}
