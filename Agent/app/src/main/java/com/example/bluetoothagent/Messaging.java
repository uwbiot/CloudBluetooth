package com.example.bluetoothagent;

import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by wei on 9/17/17.
 */

public class Messaging {

    public static String writeDeviceJSON(String name, String address) {
        JSONObject object = new JSONObject();
        try {
            if (name == null || name.equals("")) {
                name = "Unknown";
            }
            object.put("deviceName", name);
            object.put("macAddress", address);
            object.put("agentID", AndroidDeviceUuid.getUuid());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object.toString();
    }

    public static String writeConnectDeviceJSON(String address) {
        JSONObject object = new JSONObject();
        try {
            object.put("agentID", AndroidDeviceUuid.getUuid());
            object.put("macAddress", address);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object.toString();
    }

    public static String writeDataJSON(GATTMessageType type, String value,
                                       String uuid, String macAddress, String requestId) {
        JSONObject object = new JSONObject();
        try {
            object.put("type", type);
            object.put("value", value);
            object.put("uuid", uuid);
            object.put("macAddress", macAddress);
            object.put("agentID", AndroidDeviceUuid.getUuid());
            object.put("requestId", requestId);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object.toString();
    }

    public static String writeDataJSON(GATTMessageType type,
                                       String uuid, String macAddress, String requestId) {
        JSONObject object = new JSONObject();
        try {
            object.put("type", type);
            object.put("uuid", uuid);
            object.put("macAddress", macAddress);
            object.put("agentID", AndroidDeviceUuid.getUuid());
            object.put("requestId", requestId);
            object.put("status", "success");
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object.toString();
    }

    public static String writeServiceJSON(GATTMessageType type, String value,
                                          String macAddress, String requestId) {
        JSONObject object = new JSONObject();
        try {
            object.put("type", type);
            object.put("value", value);
            object.put("agentID", AndroidDeviceUuid.getUuid());
            object.put("macAddress", macAddress);
            object.put("requestId", requestId);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object.toString();
    }

    public static String writeServiceJSON(GATTMessageType type, List<BluetoothGattService> gattServices,
                                          String macAddress, String requestId) {
        JSONObject object = new JSONObject();
        try {
            object.put("type", type);
            object.put("agentID", AndroidDeviceUuid.getUuid());
            object.put("macAddress", macAddress);
            object.put("requestId", requestId);
            JSONArray myBLEServiceList = new JSONArray();
            for (BluetoothGattService gattService : gattServices) {
                List<BluetoothGattCharacteristic> gattCharacteristics =
                        gattService.getCharacteristics();
                ArrayList<MyBluetoothGattCharacteristic> myCharas =
                        new ArrayList<>();
                // Loops through available Characteristics.
                for (BluetoothGattCharacteristic gattCharacteristic : gattCharacteristics){
                    myCharas.add(new MyBluetoothGattCharacteristic(gattCharacteristic.getUuid().toString()));
                }
                MyBluetoothGattService myBLEService = new MyBluetoothGattService(gattService.getUuid().toString(), myCharas);
                myBLEServiceList.put(myBLEService.toJson());
            }
            object.put("services", myBLEServiceList);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object.toString();
    }

}
