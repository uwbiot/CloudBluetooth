package com.example.bluetoothagent;

import android.util.Base64;

import org.json.JSONObject;

/**
 * Created by wei on 3/31/18.
 */

public class ConnectMessage {
    public String macAddress;
    public String requestId;

    public ConnectMessage(String message) {
        try {
            JSONObject json = new JSONObject(message);
            this.macAddress = json.getString("macAddress");
            this.requestId = json.getString("requestId");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
