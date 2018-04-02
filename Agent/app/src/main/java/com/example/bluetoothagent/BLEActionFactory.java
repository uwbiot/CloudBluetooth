package com.example.bluetoothagent;

import android.bluetooth.BluetoothGattCharacteristic;

/**
 * Created by wei on 3/18/18.
 */

public class BLEActionFactory {
    public static BLEAction getReadAction(BluetoothGattCharacteristic characteristic,
                                          String requestId, String macAddress) {
        return new ReadAction(characteristic, requestId, macAddress);
    }

    public static BLEAction getWriteAction(BluetoothGattCharacteristic characteristic,
                                           String requestId, String macAddress) {
        return new WriteAction(characteristic, requestId, macAddress);
    }

}
