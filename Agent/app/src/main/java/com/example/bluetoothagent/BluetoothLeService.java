package com.example.bluetoothagent;

import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.util.Log;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Service for managing connection and data communication with a GATT server hosted on a
 * given Bluetooth LE device.
 */
public class BluetoothLeService extends Service {
    private final static String TAG = BluetoothLeService.class.getSimpleName();

    private BluetoothManager mBluetoothManager;
    private BluetoothAdapter mBluetoothAdapter;
    private HashMap<String, BluetoothGatt> gattHashMap = new HashMap<>();
    private HashMap<String, Integer> connStatusMap = new HashMap<>();
    private int mConnectionState = STATE_DISCONNECTED;
    private final Lock lock = new ReentrantLock();
    private LinkedList<BLEAction> actQueue;
    private bleAction curAction = null;

    private static final int STATE_DISCONNECTED = 0;
    private static final int STATE_CONNECTING = 1;
    private static final int STATE_CONNECTED = 2;

    public class bleAction {
        public String requestId;
        public boolean isFinished;
        public int curTimeout;
        public String macAddress;
        public bleAction(String requestId, String macAddress) {
            this.requestId = requestId;
            this.isFinished = false;
            this.curTimeout = 0;
            this.macAddress = macAddress;
        }
    }

    public final static String ACTION_GATT_CONNECTED =
            "com.example.bluetooth.le.ACTION_GATT_CONNECTED";
    public final static String ACTION_GATT_DISCONNECTED =
            "com.example.bluetooth.le.ACTION_GATT_DISCONNECTED";
    public final static String ACTION_GATT_SERVICES_DISCOVERED =
            "com.example.bluetooth.le.ACTION_GATT_SERVICES_DISCOVERED";
    public final static String ACTION_DATA_READ =
            "com.example.bluetooth.le.ACTION_DATA_READ";
    public final static String ACTION_DATA_WRITE =
            "com.example.bluetooth.le.ACTION_DATA_WRITE";
    public final static String ACTION_DATA_NOTIFY =
            "com.example.bluetooth.le.ACTION_DATA_NOTIFY";
    public final static String EXTRA_DATA =
            "com.example.bluetooth.le.EXTRA_DATA";
    public final static String UUID_DATA =
            "com.example.bluetooth.le.UUID_DATA";
    public final static String MAC_ADDRESS =
            "com.example.bluetooth.le.MAC_ADDRESS";
    public final static String REQUEST_ID =
            "com.example.bluetooth.le.REQUEST_ID";
    public final static int GATT_TIMEOUT = 150;

    private void broadcastUpdate(final String action, String macAddress, String requestId) {
        final Intent intent = new Intent(action);
        intent.putExtra(MAC_ADDRESS, macAddress);
        intent.putExtra(REQUEST_ID, new String(requestId));
        sendBroadcast(intent);
    }

    private void broadcastUpdate(final String action) {
        final Intent intent = new Intent(action);
        sendBroadcast(intent);
    }

    private void broadcastUpdate(final String action,
                                 final BluetoothGattCharacteristic characteristic,
                                 String macAddress, String requestId) {
        final Intent intent = new Intent(action);
        intent.putExtra(UUID_DATA, new String(characteristic.getUuid().toString()));
        intent.putExtra(MAC_ADDRESS, new String(macAddress));
        intent.putExtra(REQUEST_ID, new String(requestId));
        // For all other profiles, writes the data formatted in HEX.
        final byte[] data = characteristic.getValue();
        if (data != null && data.length > 0) {
            final StringBuilder stringBuilder = new StringBuilder(data.length);
            for(byte byteChar : data) {
                stringBuilder.append(String.format("%02X ", byteChar));
            }
            intent.putExtra(EXTRA_DATA, new String(data) + "\n" + stringBuilder.toString());
        }
        sendBroadcast(intent);
    }

    public class LocalBinder extends Binder {
        BluetoothLeService getService() {
            return BluetoothLeService.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        // After using a given device, you should make sure that BluetoothGatt.close() is called
        // such that resources are cleaned up properly.  In this particular example, close() is
        // invoked when the UI is disconnected from the Service.
        close();
        return super.onUnbind(intent);
    }

    private final IBinder mBinder = new LocalBinder();

    /**
     * Initializes a reference to the local Bluetooth adapter.
     *
     * @return Return true if the initialization is successful.
     */
    public boolean initialize() {
        // For API level 18 and above, get a reference to BluetoothAdapter through
        // BluetoothManager.
        if (mBluetoothManager == null) {
            mBluetoothManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
            if (mBluetoothManager == null) {
                Log.e(TAG, "Unable to initialize BluetoothManager.");
                return false;
            }
        }
        mBluetoothAdapter = mBluetoothManager.getAdapter();
        if (mBluetoothAdapter == null) {
            Log.e(TAG, "Unable to obtain a BluetoothAdapter.");
            return false;
        }
        actQueue = new LinkedList<>();
        Thread queueThread = new Thread() {
            @Override
            public void run() {
                while (true) {
                    executeQueue();
                    try {
                        Thread.sleep(0, 100000);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        };
        queueThread.start();
        return true;
    }

    private void executeQueue() {
        lock.lock();
        if (curAction != null && !curAction.isFinished) {
            Log.d(TAG, "executeQueue, curAction running");
            try {
                curAction.curTimeout++;
                if (curAction.curTimeout > GATT_TIMEOUT) {
                    Log.d(TAG, "current action timeout" + curAction.requestId);
                    curAction.isFinished = true;
                }
                Thread.sleep(10, 0);
            } catch (InterruptedException e ) {
                e.printStackTrace();
            }
            lock.unlock();
            return;
        }
        if (actQueue == null) {
            lock.unlock();
            return;
        }
        if (actQueue.size() == 0) {
            lock.unlock();
            return;
        }
        BLEAction bleAction = actQueue.removeFirst();
        Long tsLong = System.currentTimeMillis();
        String ts = tsLong.toString();
        Log.d("start reading message ",  " ts: " + ts);
        bleAction.execute(gattHashMap);
        curAction = new bleAction(bleAction.getRequestId(), bleAction.getMacAddress());
        lock.unlock();
    }

    private boolean addActionToQueue(BLEAction bleAction) {
        lock.lock();
        actQueue.add(bleAction);
        lock.unlock();
        return true;
    }

    /**
     * Connects to the GATT server hosted on the Bluetooth LE device.
     *
     * @param address The device address of the destination device.
     *
     * @return Return true if the connection is initiated successfully. The connection result
     *         is reported asynchronously through the
     *         {@code BluetoothGattCallback#onConnectionStateChange(android.bluetooth.BluetoothGatt, int, int)}
     *         callback.
     */
    public boolean connect(final String address, String requestId) {
        if (mBluetoothAdapter == null || address == null) {
            Log.w(TAG, "BluetoothAdapter not initialized or unspecified address.");
            return false;
        }
        // Previously connected device.  Try to reconnect.
        /*
        if (gattHashMap.containsKey(address) && gattHashMap.get(address) != null) {
            Log.d(TAG, "Trying to use an existing mBluetoothGatt for connection.");
            if (gattHashMap.get(address).connect()) {
                //mConnectionState = STATE_CONNECTING;
                return true;
            } else {
                return false;
            }
        }
        */
        final BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(address);
        if (device == null) {
            Log.w(TAG, "Device not found.  Unable to connect.");
            return false;
        }
        // We want to directly connect to the device, so we are setting the autoConnect
        // parameter to false.
        final BluetoothGattCallback mGattCallback = new MyBluetoothGattCallback(address) {
            @Override
            public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                String intentAction;

                if(curAction != null && curAction.macAddress.equals(address)) {
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        intentAction = ACTION_GATT_CONNECTED;
                        mConnectionState = STATE_CONNECTED;
                        connStatusMap.put(address, mConnectionState);
                        broadcastUpdate(intentAction, address, curAction.requestId);
                        Log.i(TAG, "Connected to GATT server.");
                        // Attempts to discover services after successful connection.
                        BluetoothGatt mBluetoothGatt = gattHashMap.get(address);
                        Log.i(TAG, "Attempting to start service discovery:" + mBluetoothGatt.discoverServices());
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        intentAction = ACTION_GATT_DISCONNECTED;
                        mConnectionState = STATE_DISCONNECTED;
                        Log.i(TAG, "Disconnected from GATT server.");
                        gattHashMap.remove(address);
                        broadcastUpdate(intentAction, address, curAction.requestId);
                        connStatusMap.put(address, mConnectionState);
                        curAction.isFinished = true;
                    }
                } else {
                    Log.i(TAG, "curAction is null or address mismatch");
                }
            }

            @Override
            public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    broadcastUpdate(ACTION_GATT_SERVICES_DISCOVERED, address, curAction.requestId);
                } else {
                    Log.w(TAG, "onServicesDiscovered received: " + status);
                }
                curAction.isFinished = true;
            }

            @Override
            public void onCharacteristicWrite(BluetoothGatt gatt,
                                              BluetoothGattCharacteristic characteristic,
                                              int status) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    broadcastUpdate(ACTION_DATA_WRITE, characteristic, address, curAction.requestId);
                } else {
                    Log.w(TAG, "onCharacteristicWrite: " + status);
                }
                curAction.isFinished = true;
            }

            @Override
            public void onCharacteristicRead(BluetoothGatt gatt,
                                             BluetoothGattCharacteristic characteristic,
                                             int status) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    Long tsLong = System.currentTimeMillis();
                    String ts = tsLong.toString();
                    Log.d("getting message ", "requestId: " + curAction.requestId + " ts: " + ts);
                    broadcastUpdate(ACTION_DATA_READ, characteristic, address, curAction.requestId);
                } else {
                    Log.w(TAG, "onCharacteristicRead: " + status);
                }
                curAction.isFinished = true;
            }

            @Override
            public void onCharacteristicChanged(BluetoothGatt gatt,
                                                BluetoothGattCharacteristic characteristic) {
                Log.w(TAG, "onCharacteristicChange: " + characteristic.getValue());
                //broadcastUpdate(ACTION_DATA_NOTIFY, characteristic, address, curAction.requestId);
                //curAction.isFinished = true;
            }
        };

        BLEAction bleAction = new ConnectAction(requestId, address){
            @Override
            public void execute(HashMap<String, BluetoothGatt> gattHashMap) {
                if (connStatusMap.containsKey(address) &&
                        connStatusMap.get(address) == STATE_CONNECTED) {
                    broadcastUpdate(ACTION_GATT_SERVICES_DISCOVERED, address, curAction.requestId);
                } else if (connStatusMap.containsKey(address) && gattHashMap.containsKey(address) &&
                        connStatusMap.get(address) == STATE_DISCONNECTED) {
                    Log.w(TAG,"start reconnecting..");
                    gattHashMap.get(address).connect();
                } else {
                    BluetoothGatt mBluetoothGatt = device.connectGatt(BluetoothLeService.this, false, mGattCallback);
                    gattHashMap.put(address, mBluetoothGatt);
                }
            }
        };
        addActionToQueue(bleAction);

       // BluetoothGatt mBluetoothGatt = device.connectGatt(this, false, mGattCallback);
       // gattHashMap.put(address, mBluetoothGatt);
        Log.d(TAG, "Trying to create a new connection to address : " + address);
        return true;
    }

    /**
     * Disconnects an existing connection or cancel a pending connection.
     *
     * @param requestId The requestId of this request.
     * @param macAddress The device address of the destination device.
     *
     *  The disconnection result is reported asynchronously through the
     * {@code BluetoothGattCallback#onConnectionStateChange(android.bluetooth.BluetoothGatt, int, int)}
     * callback.
     */
    public void disconnect(final String macAddress, String requestId) {
        if (mBluetoothAdapter == null || !gattHashMap.containsKey(macAddress)) {
            Log.w(TAG, "BluetoothAdapter for this device not initialized");
            return;
        }
        BLEAction bleAction = new DisconnectAction(requestId, macAddress) {
            @Override
            public void execute(HashMap<String, BluetoothGatt> gattHashMap) {
                BluetoothGatt mBluetoothGatt = gattHashMap.get(macAddress);
                if(mBluetoothGatt != null) {
                    gattHashMap.remove(macAddress);
                    connStatusMap.remove(macAddress);
                    mBluetoothGatt.disconnect();
                    mBluetoothGatt = null;
                }
                curAction.isFinished = true;
            }
        };
        addActionToQueue(bleAction);
        /*
        BluetoothGatt mBluetoothGatt = gattHashMap.get(address);
        if(mBluetoothGatt != null) {
            gattHashMap.remove(address);
            mBluetoothGatt.disconnect();
            mBluetoothGatt = null;
        }
        */
    }

    /**
     * Disconnects an existing connection or cancel a pending connection, used for onDestroy.
     *
     * @param macAddress The device address of the destination device.
     *
     *  The disconnection result is reported asynchronously through the
     * {@code BluetoothGattCallback#onConnectionStateChange(android.bluetooth.BluetoothGatt, int, int)}
     * callback.
     */
    public void disconnect(String macAddress) {
        if (mBluetoothAdapter == null || !gattHashMap.containsKey(macAddress)) {
            Log.w(TAG, "BluetoothAdapter for this device not initialized");
            return;
        }
        BluetoothGatt mBluetoothGatt = gattHashMap.get(macAddress);
        if(mBluetoothGatt != null) {
            gattHashMap.remove(macAddress);
            mBluetoothGatt.disconnect();
            mBluetoothGatt = null;
        }
    }

    /**
     * After using a given BLE device, the app must call this method to ensure resources are
     * released properly.
     */
    public void close() {
        if (gattHashMap.size() == 0) {
            return;
        }
        for (String key : gattHashMap.keySet()) {
            BluetoothGatt mBluetoothGatt = gattHashMap.get(key);
            mBluetoothGatt.close();
            mBluetoothGatt = null;
        }
    }

    /**
     * Request a read on a given {@code BluetoothGattCharacteristic}. The read result is reported
     * asynchronously through the {@code BluetoothGattCallback#onCharacteristicRead(android.bluetooth.BluetoothGatt, android.bluetooth.BluetoothGattCharacteristic, int)}
     * callback.
     *
     * @param characteristic The characteristic to read from.
     */
    public void readCharacteristic(BluetoothGattCharacteristic characteristic,
                                   String macAddress, String requestId) {
        BluetoothGatt mBluetoothGatt = gattHashMap.get(macAddress);
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            Log.w(TAG, "BluetoothAdapter not initialized");
            return;
        }
        /* to do call factory create method, put in the queue*/
        BLEAction bleAction = BLEActionFactory.getReadAction(characteristic, requestId, macAddress);
        addActionToQueue(bleAction);
        //mBluetoothGatt.readCharacteristic(characteristic);
    }

    public void writeCharacteristic(BluetoothGattCharacteristic characteristic, byte[] b,
                                    String macAddress, String requestId) {
        BluetoothGatt mBluetoothGatt = gattHashMap.get(macAddress);
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            Log.w(TAG, "BluetoothAdapter not initialized");
            return;
        }
        characteristic.setValue(b);
        /* to do call factory create method, put in the queue*/
        BLEAction bleAction = BLEActionFactory.getWriteAction(characteristic, requestId, macAddress);
        addActionToQueue(bleAction);
        //mBluetoothGatt.writeCharacteristic(characteristic);

    }

    public void writeCharacteristic(BluetoothGattCharacteristic characteristic, byte b,
                                    String macAddress, String requestId) {
        BluetoothGatt mBluetoothGatt = gattHashMap.get(macAddress);
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            Log.w(TAG, "BluetoothAdapter not initialized");
            return;
        }
        byte[] val = new byte[1];
        val[0] = b;
        characteristic.setValue(val);
        /* to do call factory create method, put in the queue*/
        BLEAction bleAction = BLEActionFactory.getWriteAction(characteristic, requestId, macAddress);
        addActionToQueue(bleAction);
        //mBluetoothGatt.writeCharacteristic(characteristic);
    }
    /**
     * Enables or disables notification on a give characteristic.
     *
     * @param characteristic Characteristic to act on.
     * @param enabled If true, enable notification.  False otherwise.
     */
    public void setCharacteristicNotification(BluetoothGattCharacteristic characteristic,
                                              boolean enabled, String macAddress) {
        BluetoothGatt mBluetoothGatt = gattHashMap.get(macAddress);
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            Log.w(TAG, "BluetoothAdapter not initialized");
            return;
        }
        mBluetoothGatt.setCharacteristicNotification(characteristic, enabled);
        UUID uuid = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
        BluetoothGattDescriptor descriptor = characteristic.getDescriptor(uuid);

        if(descriptor == null)
        {
            return;
        }
        descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        mBluetoothGatt.writeDescriptor(descriptor);
        Log.w(TAG, "Bluetooth descriptor written!!!");
    }

    /**
     * Retrieves a list of supported GATT services on the connected device. This should be
     * invoked only after {@code BluetoothGatt#discoverServices()} completes successfully.
     *
     * @return A {@code List} of supported services.
     */
    public List<BluetoothGattService> getSupportedGattServices(String macAddress) {
        if(!gattHashMap.containsKey(macAddress)) {
            Log.w(TAG, "gattHashMap doesn't containsKey:" + macAddress);
        }
        BluetoothGatt mBluetoothGatt = gattHashMap.get(macAddress);
        if (mBluetoothGatt == null) return null;
        return mBluetoothGatt.getServices();
    }

    public List<String> getConnectedDevices() {
        return new ArrayList<>(this.gattHashMap.keySet());
    }
}
