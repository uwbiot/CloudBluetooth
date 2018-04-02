package com.example.bluetoothagent;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.util.Log;

import java.util.HashMap;

/**
 * Created by wei on 3/18/18.
 */

public class ReadAction implements BLEAction {
    private BluetoothGattCharacteristic characteristic;
    private String requestId;
    private String macAddress;

    public ReadAction(BluetoothGattCharacteristic characteristic, String requestId, String macAddress) {
        this.characteristic = characteristic;
        this.requestId = requestId;
        this.macAddress = macAddress;
    }

    @Override
    public void execute(HashMap<String, BluetoothGatt> gattHashMap) {
        if(gattHashMap.containsKey(this.macAddress)) {
            gattHashMap.get(this.macAddress).readCharacteristic(characteristic);
        }
    }

    @Override
    public String getRequestId() {
        return this.requestId;
    }

    @Override
    public String getMacAddress() {return this.macAddress;}
}
