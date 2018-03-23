package com.example.bluetoothagent;

import android.bluetooth.BluetoothGattCharacteristic;

/**
 * Created by wei on 3/18/18.
 */

public class BLEActionFactory {
    public static BLEAction getReadAction(BluetoothGattCharacteristic characteristic,
                                          String requestID, String macAddress) {
        return new ReadAction(characteristic, requestID, macAddress);
    }
    public static BLEAction getWriteAction(BluetoothGattCharacteristic characteristic,
                                           String requestID, String macAddress) {
        return new WriteAction(characteristic, requestID, macAddress);
    }
}
