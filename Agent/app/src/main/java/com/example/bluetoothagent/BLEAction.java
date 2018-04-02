package com.example.bluetoothagent;

import android.bluetooth.BluetoothGatt;

import java.util.HashMap;

/**
 * Created by wei on 3/18/18.
 */

public interface BLEAction {
     void execute(HashMap<String, BluetoothGatt> gattHashMap);
     String getRequestId();
     String getMacAddress();
}
