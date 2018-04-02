package com.example.bluetoothagent;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;

import java.util.HashMap;

/**
 * Created by wei on 3/29/18.
 */

public class ConnectAction implements BLEAction {
    private String requestId;
    private String macAddress;


    public ConnectAction(String requestId, String macAddress) {
        this.requestId = requestId;
        this.macAddress = macAddress;
    }
    @Override
    public void execute(HashMap<String, BluetoothGatt> gattHashMap) {
    }

    @Override
    public String getRequestId() {
        return this.requestId;
    }

    @Override
    public String getMacAddress() {return this.macAddress;}
}
