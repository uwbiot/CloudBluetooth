package com.example.bluetoothagent;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by wei on 9/17/17.
 */

public class MyBluetoothGattCharacteristic {
    public String uuid;
    public MyBluetoothGattCharacteristic(String uuid)
    {
        this.uuid = uuid;
    }

    public JSONObject toJson() {
        JSONObject object = new JSONObject();
        try {
            object.put("uuid", this.uuid);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object;
    }
}
