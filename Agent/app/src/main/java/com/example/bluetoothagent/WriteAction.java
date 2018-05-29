package com.example.bluetoothagent;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;

import java.util.HashMap;

/**
 * Created by wei on 3/18/18.
 */

public class WriteAction implements BLEAction {
    private BluetoothGattCharacteristic characteristic;
    private String requestId;
    private String macAddress;

    public WriteAction(BluetoothGattCharacteristic characteristic, String requestId, String macAddress) {
        this.characteristic = characteristic;
        this.requestId = requestId;
        this.macAddress = macAddress;
    }

    @Override
    public void execute(HashMap<String, BluetoothGatt> gattHashMap) {
        if (gattHashMap.containsKey(this.macAddress)) {
            gattHashMap.get(this.macAddress).writeCharacteristic(characteristic);
        }
    }

    @Override
    public String getRequestId() {
        return this.requestId;
    }

    @Override
    public String getMacAddress() {return this.macAddress;}
}
