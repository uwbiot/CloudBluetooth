package com.example.bluetoothagent;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.Bundle;
import android.os.IBinder;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.widget.TextView;
import android.widget.Toast;

import com.amazonaws.mobileconnectors.iot.AWSIotMqttClientStatusCallback;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttNewMessageCallback;

import java.io.UnsupportedEncodingException;

public class DeviceScanActivity extends Activity {
    private BluetoothAdapter mBluetoothAdapter;
    private Handler mHandler;
    private static IotClient iotClient;
    private String mDeviceAddress;
    private String mRequestId;
    private BluetoothLeService mBluetoothLeService;
    private BluetoothGattCharacteristic mNotifyCharacteristic;
    private TextView textView;
    private DeviceManager deviceManager;
    private Activity self;
    private TopicsManager topicsManager;
    private boolean isAvailableCheckRun = false;
    private boolean isRegistered = false;

    private static final int REQUEST_ENABLE_BT = 1;
    // Stops scanning after 10 seconds.
    private static final long SCAN_LENGTH = 10000;
    // check device connection every 5 seconds
    private static final long CONNECTION_CHECK_PERIOD = 5000;
    // check available devices every 5 minutes
    private static final long AVAILABLE_CHECK_PERIOD = 300000;
    private static final String LOG_TAG = "DeviceScanActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        self = this;

        AndroidDeviceUuid.configUuid(this.getApplicationContext());
        textView = findViewById(R.id.textView);
        textView.setMovementMethod(new ScrollingMovementMethod());

        //textView.append("DeviceScan, Supper called for DeviceScan OnCreate\n");
        mHandler = new Handler();
        // Use this check to determine whether BLE is supported on the device.  Then you can
        // selectively disable BLE-related features.
        if (!getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            Toast.makeText(this, R.string.ble_not_supported, Toast.LENGTH_SHORT).show();
            finish();
        }

        // Initializes a Bluetooth adapter.  For API level 18 and above, get a reference to
        // BluetoothAdapter through BluetoothManager.
        final BluetoothManager bluetoothManager =
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();

        // Checks if Bluetooth is supported on the device.
        if (mBluetoothAdapter == null) {
            Toast.makeText(this, R.string.error_bluetooth_not_supported, Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        deviceManager = new DeviceManager();
        topicsManager = new TopicsManager(textView);
        iotClient = new IotClient(this.getApplicationContext());
        iotClient.connect(new AWSIotMqttClientStatusCallback() {
            @Override
            public void onStatusChanged(final AWSIotMqttClientStatus status,
                                        final Throwable throwable) {
                Log.d(LOG_TAG, "Status = " + String.valueOf(status));
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (status == AWSIotMqttClientStatus.Connecting) {
                            Log.d(LOG_TAG, "Connecting...");
                            //textView.append("AWSIOTConnecting..\n");
                        } else if (status == AWSIotMqttClientStatus.Connected) {
                            //textView.append("AWSIOTConnected\n");
                            TopicMessage topics = topicsManager.getTopics();
                            iotClient.subscribe(topics.scan_req, scanRequestCallback());
                            iotClient.subscribe(topics.conn_req, connectRequestCallback());
                            iotClient.subscribe(topics.disconn_req, disconnectRequestCallback());
                            if (!isAvailableCheckRun) {
                                //textView.append("Start repeating check available devices\n");
                                startRepeatingAvailableCheckTask();
                            }
                            Log.d(LOG_TAG, "send post register service to server");
                        } else if (status == AWSIotMqttClientStatus.Reconnecting) {
                            if (throwable != null) {
                                Log.e(LOG_TAG, "Connection error.", throwable);
                                textView.append("AWSIOTConnection error.\n");
                            }
                        } else if (status == AWSIotMqttClientStatus.ConnectionLost) {
                            if (throwable != null) {
                                Log.e(LOG_TAG, "Connection error.", throwable);
                                textView.append("AWSIOTConnection error.\n");
                            }
                            textView.append("AWSIOTDisconnected.\n");
                        } else {
                            textView.append("AWSIOTDisconnected.\n");
                        }
                    }
                });
            }
        });
        startRepeatingConnectCheckTask();
    }

    // device scan request call back
    private AWSIotMqttNewMessageCallback scanRequestCallback() {
        AWSIotMqttNewMessageCallback scanCallback = new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        //textView.append("start scanning ble devices");
                        scanLeDevice(true);
                    }
                });
            }
        };
        return scanCallback;
    }

    //Device connect callback
    private AWSIotMqttNewMessageCallback connectRequestCallback() {
        AWSIotMqttNewMessageCallback connectCallback = new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(final String topic, final byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);
                            ConnectMessage connectMessage = new ConnectMessage(message);
                            mDeviceAddress = connectMessage.macAddress;
                            mRequestId = connectMessage.requestId;
                            //textView.append("connect Message arrived: macAddress " + mDeviceAddress);
                            if(mBluetoothLeService == null) {
                                Intent gattServiceIntent = new Intent(self, BluetoothLeService.class);
                                bindService(gattServiceIntent, MyServiceConnection, BIND_AUTO_CREATE);
                                registerReceiver(mGattUpdateReceiver, makeGattUpdateIntentFilter());
                                //textView.append("register receiver!");
                                isRegistered = true;
                            }
                            if(mBluetoothLeService != null) {
                                final boolean result = mBluetoothLeService.connect(mDeviceAddress, mRequestId);
                                textView.append("start connecting ble device result=" + result);
                                Log.d("connect device", "Connect request result=" + result);
                            }
                        } catch (UnsupportedEncodingException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        };
        return connectCallback;
    }

    //Device disconnect callback
    private AWSIotMqttNewMessageCallback disconnectRequestCallback() {
        AWSIotMqttNewMessageCallback disconnectCallback = new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(final String topic, final byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, "disconnect Message: " + message);
                            ConnectMessage connectMessage = new ConnectMessage(message);
                            String macAddress = connectMessage.macAddress;
                            String requestId = connectMessage.requestId;
                            //textView.append("disconnect Message arrived: macAddress " + macAddress);
                            //textView.append("disconnect ble device: " + macAddress);
                            Log.d("disconnect device", "disconnect request: " + macAddress);
                            mBluetoothLeService.disconnect(macAddress, requestId);

                        } catch (UnsupportedEncodingException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        };
        return disconnectCallback;
    }

    // check connected device every 5 seconds
    Runnable mConnectStatusChecker = new Runnable() {
        @Override
        public void run() {
            TopicMessage topics = topicsManager.getTopics();
            try {
                if(mBluetoothLeService != null) {
                    for (String key : mBluetoothLeService.getConnectedDevices()) {
                        if(mBluetoothLeService != null ) {
                            //textView.append("connected device key:" + key);
                            iotClient.publish(topics.conn_device, Messaging.writeConnectDeviceJSON(key));
                            //textView.append("connected device macAddress" + key);
                        }
                    }
                }
            } finally {
                // 100% guarantee that this always happens, even if
                // your update method throws an exception
                mHandler.postDelayed(mConnectStatusChecker, CONNECTION_CHECK_PERIOD);
            }
        }
    };

    // check available devices every 5 minutes
    Runnable mAvailStatusChecker = new Runnable() {
        @Override
        public void run() {
            try {
                deviceManager.clearAddressMap();
                //CallServerAPI.availableDevice(textView);
                //textView.append("start scanning ble devices");
                scanLeDevice(true);
            } finally {
                // 100% guarantee that this always happens, even if
                // your update method throws an exception
                mHandler.postDelayed(mAvailStatusChecker, AVAILABLE_CHECK_PERIOD);
            }
        }
    };

    void startRepeatingConnectCheckTask() {
        mConnectStatusChecker.run();
    }

    void stopRepeatingConnectCheckTask() {
        mHandler.removeCallbacks(mConnectStatusChecker);
    }

    void startRepeatingAvailableCheckTask() {
        mAvailStatusChecker.run();
        isAvailableCheckRun = true;
    }

    void stopRepeatingAvailableCheckTask() {
        mHandler.removeCallbacks(mAvailStatusChecker);
    }

    // Code to manage Service lifecycle.
    private final ServiceConnection MyServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName componentName, IBinder service) {
            mBluetoothLeService = ((BluetoothLeService.LocalBinder) service).getService();
            if (!mBluetoothLeService.initialize()) {
                Log.e("Service Connection", "Unable to initialize Bluetooth");
                finish();
            }
            // Automatically connects to the device upon successful start-up initialization.
            Log.d("onServiceConnected", "connect");
            mBluetoothLeService.connect(mDeviceAddress, mRequestId);
        }

        @Override
        public void onServiceDisconnected(ComponentName componentName) {
            //mBluetoothLeService = null;
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        // Ensures Bluetooth is enabled on the device.  If Bluetooth is not currently enabled,
        // fire an intent to display a dialog asking the user to grant permission to enable it.
        if (!mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        // User chose not to enable Bluetooth.
        if (requestCode == REQUEST_ENABLE_BT && resultCode == Activity.RESULT_CANCELED) {
            finish();
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopRepeatingConnectCheckTask();
        stopRepeatingAvailableCheckTask();

        if(mBluetoothLeService != null) {
            if (isRegistered) {
                unregisterReceiver(mGattUpdateReceiver);
                unbindService(MyServiceConnection);
            }

            for (String key : mBluetoothLeService.getConnectedDevices()) {
                mBluetoothLeService.disconnect(key);
            }
        }
        mBluetoothLeService = null;
        iotClient.disconnect();
    }

    private void scanLeDevice(final boolean enable) {
        if (enable) {
            // Stops scanning after a pre-defined scan period.
            mHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    mBluetoothAdapter.stopLeScan(mLeScanCallback);
                }
            }, SCAN_LENGTH);

            mBluetoothAdapter.startLeScan(mLeScanCallback);
        } else {
            mBluetoothAdapter.stopLeScan(mLeScanCallback);
        }
    }

    // Device scan callback.
    private BluetoothAdapter.LeScanCallback mLeScanCallback =
        new BluetoothAdapter.LeScanCallback() {
            @Override
            public void onLeScan(final BluetoothDevice device, int rssi, byte[] scanRecord) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    TopicMessage topics = topicsManager.getTopics();
                    if(!deviceManager.containsDevice(device.getAddress())) {
                        if (device.getName() != null && !device.getName().equals("")) {
                            String serialization = Messaging.writeDeviceJSON(device.getName(), device.getAddress());
                            iotClient.publish(topics.scan_res, serialization);
                            //textView.append("publish to topic scan result: " + serialization + "\n");
                            deviceManager.addDevice(device.getAddress(), device);
                            Log.d("mLeScanCallback: ", device.getAddress());
                            //textView.append("mLeScanCallback: " + device.getAddress() + "\n");
                        }
                    }
                }
            });
            }
        };

    // Handles various events fired by the Service.
    // ACTION_GATT_CONNECTED: connected to a GATT server.
    // ACTION_GATT_DISCONNECTED: disconnected from a GATT server.
    // ACTION_GATT_SERVICES_DISCOVERED: discovered GATT services.
    // ACTION_DATA_READ: received data from the device of read operations
    // ACTION_DATA_WRITE: received data from the device of write operations
    // ACTION_DATA_NOTIFY: received data from the device of notify operations
    //

    private final BroadcastReceiver mGattUpdateReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            String deviceMacAddress = intent.getStringExtra(BluetoothLeService.MAC_ADDRESS);
            String requestId = intent.getStringExtra(BluetoothLeService.REQUEST_ID);
            if (BluetoothLeService.ACTION_GATT_CONNECTED.equals(action)) {
                iotClient.publish(topicsManager.getTopics().conn_res, Messaging.writeServiceJSON(GATTMessageType.ACTION_GATT_CONNECTED,
                        "connected", deviceMacAddress, requestId));
                textView.append("GATT status: connected");
                iotClient.subscribe(topicsManager.getTopics().data_req, dataRequestCallback());
            } else if (BluetoothLeService.ACTION_GATT_DISCONNECTED.equals(action)) {
                iotClient.publish(topicsManager.getTopics().conn_res,
                        Messaging.writeServiceJSON(GATTMessageType.ACTION_GATT_DISCONNECTED,
                                "disconnected", deviceMacAddress, requestId));
                textView.append("GATT status: disconnected");
            } else if (BluetoothLeService.ACTION_GATT_SERVICES_DISCOVERED.equals(action)) {
                // Show all the supported services and characteristics on the user interface.
                String message = Messaging.writeServiceJSON(GATTMessageType.ACTION_GATT_SERVICES_DISCOVERED,
                        mBluetoothLeService.getSupportedGattServices(deviceMacAddress),
                        deviceMacAddress, requestId);
                deviceManager.addListGATTCharacteristic(mBluetoothLeService.getSupportedGattServices(deviceMacAddress), deviceMacAddress);
                iotClient.publish(topicsManager.getTopics().conn_res, message);
                //textView.append("GATT status: service discovered " + message);
            } else if (BluetoothLeService.ACTION_DATA_READ.equals(action)) {
                iotClient.publish(topicsManager.getTopics().data_res, Messaging.writeDataJSON(GATTMessageType.ACTION_DATA_READ,
                        intent.getStringExtra(BluetoothLeService.EXTRA_DATA), intent.getStringExtra(BluetoothLeService.UUID_DATA),
                        deviceMacAddress, requestId));
                //textView.append("GATT_read_response: data available");
            } else if (BluetoothLeService.ACTION_DATA_WRITE.equals(action)) {
                iotClient.publish(topicsManager.getTopics().data_res, Messaging.writeDataJSON(GATTMessageType.ACTION_DATA_WRITE,
                                  intent.getStringExtra(BluetoothLeService.UUID_DATA),
                                  deviceMacAddress, requestId));
                textView.append("GATT_write_response: success!");
            } else if (BluetoothLeService.ACTION_DATA_NOTIFY.equals(action)) {
                iotClient.publish(topicsManager.getTopics().data_res, Messaging.writeNotifyDataJSON(GATTMessageType.ACTION_DATA_NOTIFY,
                                  intent.getStringExtra(BluetoothLeService.EXTRA_DATA), intent.getStringExtra(BluetoothLeService.UUID_DATA), deviceMacAddress));
            }
        }
    };

    // data request call back
    private AWSIotMqttNewMessageCallback dataRequestCallback() {
        AWSIotMqttNewMessageCallback dataRequestCallback = new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(final String topic, final byte[] data) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        String message = new String(data, "UTF-8");
                        Log.d(LOG_TAG, "Message arrived:");
                        Log.d(LOG_TAG, "   Topic: " + topic);
                        Log.d(LOG_TAG, " Message: " + message);
                        //textView.append("data request Message arrived: " + message);
                        DataMessage dataMessage = new DataMessage(message);
                        DataMessage.MessageType type = dataMessage.type;
                        String uuid = dataMessage.uuid;
                        String macAddress = dataMessage.macAddress;
                        String requestId = dataMessage.requestId;
                        if (type.equals(DataMessage.MessageType.WRITE)) {
                            mBluetoothLeService.writeCharacteristic(deviceManager.getGATTCharacteristic(uuid, macAddress), dataMessage.bytes, macAddress, requestId);
                            Log.d(LOG_TAG, "Write config file");
                            Log.d(LOG_TAG, new String(dataMessage.bytes));
                        } else if (type.equals(DataMessage.MessageType.READ)) {
                            mBluetoothLeService.readCharacteristic(deviceManager.getGATTCharacteristic(uuid, macAddress), macAddress, requestId);
                            //Long tsLong = System.currentTimeMillis()/1000;
                            //String ts = tsLong.toString();
                            //Log.d("testing receive request", "requestId: " + requestId + " ts: " + ts);
                            //readData(uuid, macAddress, requestId);
                        } else if (type.equals(DataMessage.MessageType.NOTIFY)) {
                            mBluetoothLeService.notifyCharacteristic(deviceManager.getGATTCharacteristic(uuid, macAddress), macAddress, requestId);
                        }
                    } catch (UnsupportedEncodingException e) {
                        Log.e(LOG_TAG, "Message encoding error.", e);
                    }
                }
            });
            }
        };
        return dataRequestCallback;
    }


    // read data from specific uuid
    private void readData (String uuid, String macAddress, String requestId) {
        BluetoothGattCharacteristic characteristic = deviceManager.getGATTCharacteristic(uuid, macAddress);
        final int charaProp = characteristic.getProperties();
        Log.d(LOG_TAG, "charaProp: " + charaProp);
        if ((charaProp | BluetoothGattCharacteristic.PROPERTY_READ) > 0) {
            // If there is an active notification on a characteristic, clearAll
            // it first so it doesn't update the data field on the user interface.
            if (mNotifyCharacteristic != null) {
                mBluetoothLeService.setCharacteristicNotification(
                        mNotifyCharacteristic, true, macAddress);
                Log.d(LOG_TAG, "False, Set notification by" + characteristic.getUuid());
                mNotifyCharacteristic = null;
            }
            mBluetoothLeService.readCharacteristic(characteristic, macAddress, requestId);
            Log.d(LOG_TAG, "False, read by" + characteristic.getUuid());
        }
        if ((charaProp | BluetoothGattCharacteristic.PROPERTY_NOTIFY) > 0) {
            mNotifyCharacteristic = characteristic;
            mBluetoothLeService.setCharacteristicNotification(
                    characteristic, true, macAddress);
            Log.d(LOG_TAG, "True, Set notification by" + characteristic.getUuid());
        }
    }

    private static IntentFilter makeGattUpdateIntentFilter() {
        final IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(BluetoothLeService.ACTION_GATT_CONNECTED);
        intentFilter.addAction(BluetoothLeService.ACTION_GATT_DISCONNECTED);
        intentFilter.addAction(BluetoothLeService.ACTION_GATT_SERVICES_DISCOVERED);
        intentFilter.addAction(BluetoothLeService.ACTION_DATA_READ);
        intentFilter.addAction(BluetoothLeService.ACTION_DATA_WRITE);
        intentFilter.addAction(BluetoothLeService.ACTION_DATA_NOTIFY);
        return intentFilter;
    }

}
