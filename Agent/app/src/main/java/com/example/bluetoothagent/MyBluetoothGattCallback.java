package com.example.bluetoothagent;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothProfile;
import android.util.Log;

import java.util.HashMap;


import static com.example.bluetoothagent.BluetoothLeService.ACTION_GATT_CONNECTED;

/**
 * Created by wei on 2/25/18.
 */

public class MyBluetoothGattCallback extends BluetoothGattCallback {
    private String macAddress;
    MyBluetoothGattCallback(String macAddress) {
        super();
        this.macAddress = macAddress;
    }
}
