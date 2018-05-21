package com.example.bluetoothagent;

import android.util.Base64;

import org.json.JSONObject;

/**
 * Created by wei on 9/28/17.
 */

public class DataMessage {
    public enum MessageType {
        READ,
        WRITE
    }
    public MessageType type;
    public String uuid;
    public byte[] bytes;
    public String macAddress;
    public String requestId;

    public DataMessage(String message) {
        try {
            JSONObject json = new JSONObject(message);
            type = MessageType.valueOf(json.getString("messageType"));
            this.uuid = json.getString("uuid");
            this.macAddress = json.getString("macAddress");
            if (!json.isNull("requestId")) {
                this.requestId = json.getString("requestId");
            } else {
                this.requestId = "12";
            }
           // this.bytes = json.getString("bytes").getBytes();
            if(!json.isNull("bytes")) {
                this.bytes = Base64.decode(json.getString("bytes"), Base64.DEFAULT);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
