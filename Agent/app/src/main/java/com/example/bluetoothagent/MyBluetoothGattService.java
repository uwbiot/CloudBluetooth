package com.example.bluetoothagent;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by wei on 9/17/17.
 */

public class MyBluetoothGattService {
    public String uuid;
    public List<MyBluetoothGattCharacteristic> characters;
    public MyBluetoothGattService(String uuid, List<MyBluetoothGattCharacteristic> characters) {
        this.uuid = uuid;
        this.characters = characters;
    }

    public JSONObject toJson() {
        JSONObject object = new JSONObject();
        try {
            object.put("uuid", uuid);
            JSONArray charas = new JSONArray();
            for(int i = 0; i < this.characters.size(); i++) {
                charas.put(this.characters.get(i).toJson());
            }
            object.put("charas", charas);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object;
    }
}
