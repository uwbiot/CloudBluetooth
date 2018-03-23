package com.example.bluetoothagent;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;

/**
 * Created by wei on 9/15/17.
 */

public class DeviceManager {
    private HashMap<String,BluetoothDevice> btDevice;
    private HashMap<String, BluetoothGattCharacteristic> btCharacteristic;

    public DeviceManager() {
        btDevice = new HashMap<>();
        btCharacteristic = new HashMap<>();
    }

    public void addDevice(String macAddress, BluetoothDevice device) {
        Log.d("DEVICEMANAGER", "Add bluetooth for mac Address " + macAddress);
        btDevice.put(macAddress, device);
    }

    public void addGATTCharacteristic(String uuid, String macAddress, BluetoothGattCharacteristic gattCharacteristic) {
        //Log.d("DEVICEMANAGER", "Add GATT Characteristic " + uuid);
        String key = macAddress + uuid;
        Log.d("DEVICEMANAGER", "Add GATT Characteristic " + key);
        btCharacteristic.put(key, gattCharacteristic);
    }

    public void addListGATTCharacteristic(List<BluetoothGattService> gattServices, String macAddress) {
        for (BluetoothGattService gattService : gattServices) {
            List<BluetoothGattCharacteristic> gattCharacteristics = gattService.getCharacteristics();
            for(BluetoothGattCharacteristic gattCharacteristic: gattCharacteristics) {
                addGATTCharacteristic(gattCharacteristic.getUuid().toString(), macAddress, gattCharacteristic);
            }
        }
    }

    public BluetoothGattCharacteristic getGATTCharacteristic(String uuid, String macAddress) {
        String key = macAddress + uuid;
        if (!btCharacteristic.containsKey(key)) {
            return null;
        }
        return btCharacteristic.get(key);
    }

    public BluetoothDevice getBluetoothDevice(String macAddress) {
        Log.d("DEVICEMANAGER", "Get bluetooth from mac Address " + macAddress);
        return btDevice.get(macAddress);
    }

    public boolean containsDevice(String macAddress) {
        if (btDevice.containsKey(macAddress)) {
            return true;
        }
        return false;
    }

    public void clearAll(){
        btDevice.clear();
        btCharacteristic.clear();
    }

    public void clearAddressMap() {
        btDevice.clear();
    }
}
