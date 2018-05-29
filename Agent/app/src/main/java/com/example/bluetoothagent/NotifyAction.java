package com.example.bluetoothagent;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.util.Log;

import java.util.HashMap;
import java.util.UUID;

/**
 * Created by wei on 5/21/18.
 */

public class NotifyAction implements BLEAction {
    private BluetoothGattCharacteristic characteristic;
    private String requestId;
    private String macAddress;

    public NotifyAction(BluetoothGattCharacteristic characteristic, String requestId, String macAddress) {
        this.characteristic = characteristic;
        this.requestId = requestId;
        this.macAddress = macAddress;
    }

    @Override
    public void execute(HashMap<String, BluetoothGatt> gattHashMap) {
        if (gattHashMap.containsKey(this.macAddress)) {
            BluetoothGatt mBluetoothGatt = gattHashMap.get(macAddress);
            final int charaProp = characteristic.getProperties();
            //Log.d(TAG, "charaProp: " + charaProp);
            if ((charaProp | BluetoothGattCharacteristic.PROPERTY_NOTIFY) > 0) {
                //mNotifyCharacteristic = characteristic;
                mBluetoothGatt.setCharacteristicNotification(characteristic, true);
                UUID uuid = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
                BluetoothGattDescriptor descriptor = characteristic.getDescriptor(uuid);
                if (descriptor == null) {
                    return;
                }
                descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                mBluetoothGatt.writeDescriptor(descriptor);

                //Log.w(TAG, "Bluetooth descriptor written!!!");
                //Log.d(TAG, "True, Set notification by" + characteristic.getUuid());
            }
        }
    }

    @Override
    public String getRequestId() {
        return this.requestId;
    }

    @Override
    public String getMacAddress() {return this.macAddress;}
}
