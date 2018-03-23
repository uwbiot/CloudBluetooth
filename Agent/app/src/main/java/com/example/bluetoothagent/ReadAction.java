package com.example.bluetoothagent;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.util.Log;

import java.util.HashMap;

/**
 * Created by wei on 3/18/18.
 */

public class ReadAction implements BLEAction{
    private BluetoothGattCharacteristic characteristic;
    private String requestID;
    private String macAddress;

    public ReadAction(BluetoothGattCharacteristic characteristic, String requestID, String macAddress) {
        this.characteristic = characteristic;
        this.requestID = requestID;
        this.macAddress = macAddress;
    }

    @Override
    public void execute(HashMap<String, BluetoothGatt> gattHashMap) {
        if(gattHashMap.containsKey(this.macAddress)) {
            gattHashMap.get(this.macAddress).readCharacteristic(characteristic);
        }
    }
}
