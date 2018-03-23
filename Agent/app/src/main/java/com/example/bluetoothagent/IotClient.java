package com.example.bluetoothagent;

/**
 * Created by wei on 9/13/17.
 */

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.content.ContextWrapper;

import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.iot.AWSIotKeystoreHelper;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttClientStatusCallback;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttLastWillAndTestament;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttManager;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttNewMessageCallback;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttQos;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.iot.AWSIotClient;
import com.amazonaws.services.iot.model.AttachPrincipalPolicyRequest;
import com.amazonaws.services.iot.model.CreateKeysAndCertificateRequest;
import com.amazonaws.services.iot.model.CreateKeysAndCertificateResult;

import java.io.UnsupportedEncodingException;
import java.security.KeyStore;
import java.util.UUID;
import java.lang.Runnable;


public class IotClient {
    static final String LOG_TAG = IotClient.class.getCanonicalName();

    // --- Constants to modify per your configuration ---

    // IoT endpoint
    // AWS Iot CLI describe-endpoint call returns: XXXXXXXXXX.iot.<region>.amazonaws.com
    //private static final String CUSTOMER_SPECIFIC_ENDPOINT = "a3vn897wwb8rzw.iot.us-west-2.amazonaws.com";
    private static final String CUSTOMER_SPECIFIC_ENDPOINT = "a17v6hh1labrsy.iot.us-west-2.amazonaws.com";
    // Cognito pool ID. For this app, pool needs to be unauthenticated pool with
    // AWS IoT permissions.
    //private static final String COGNITO_POOL_ID = "us-west-2:558b7b94-16a7-418c-b981-a68432ffd398";
    private static final String COGNITO_POOL_ID = "us-west-2:69459a55-b8d8-43a9-91b2-a395baa690f6";
    // Name of the AWS IoT policy to attach to a newly created certificate
    //private static final String AWS_IOT_POLICY_NAME = "iotExampleAndroidPolicy";
    private static final String AWS_IOT_POLICY_NAME = "css599wxIoT-Policy";

    // Region of AWS IoT
    //private static final Regions MY_REGION = Regions.US_WEST_2;
    private static final Regions MY_REGION = Regions.US_WEST_2;
    //Filename of KeyStore file on the filesystem
    //private static final String KEYSTORE_NAME = "iot_keystore";
    private static final String KEYSTORE_NAME = "iot_keystore4";
    // Password for the private key in the KeyStore
    //private static final String KEYSTORE_PASSWORD = "password";
    private static final String KEYSTORE_PASSWORD = "password";
    // Certificate and key aliases in the KeyStore
    //private static final String CERTIFICATE_ID = "default";
    private static final String CERTIFICATE_ID = "default";

    AWSIotClient mIotAndroidClient;
    AWSIotMqttManager mqttManager;
    String clientId;
    String keystorePath;
    String keystoreName;
    String keystorePassword;
    AWSIotMqttClientStatusCallback.AWSIotMqttClientStatus connectStatus;

    KeyStore clientKeyStore = null;
    String certificateId;

    CognitoCachingCredentialsProvider credentialsProvider;

    Context c;

    public IotClient(Context context) {
        connectStatus = AWSIotMqttClientStatusCallback.AWSIotMqttClientStatus.ConnectionLost;
        c = context;
        clientId = UUID.randomUUID().toString();

        // Initialize the AWS Cognito credentials provider
        credentialsProvider = new CognitoCachingCredentialsProvider(
            c.getApplicationContext(), // context
            COGNITO_POOL_ID, // Identity Pool ID
            MY_REGION // Region
        );

        Region region = Region.getRegion(MY_REGION);

        // MQTT Client
        mqttManager = new AWSIotMqttManager(clientId, CUSTOMER_SPECIFIC_ENDPOINT);

        // Set keepalive to 10 seconds.  Will recognize disconnects more quickly but will also send
        // MQTT pings every 10 seconds.
        mqttManager.setKeepAlive(10);

        // Set Last Will and Testament for MQTT.  On an unclean disconnect (loss of connection)
        // AWS IoT will publish this message to alert other clients.
        AWSIotMqttLastWillAndTestament lwt = new AWSIotMqttLastWillAndTestament("my/lwt/topic",
                "Android client lost connection", AWSIotMqttQos.QOS0);
        mqttManager.setMqttLastWillAndTestament(lwt);

        // IoT Client (for creation of certificate if needed)
        mIotAndroidClient = new AWSIotClient(credentialsProvider);
        mIotAndroidClient.setRegion(region);

        keystorePath = c.getFilesDir().getPath();
        keystoreName = KEYSTORE_NAME;
        keystorePassword = KEYSTORE_PASSWORD;
        certificateId = CERTIFICATE_ID;

        // To load cert/key from keystore on filesystem
        try {
            if (AWSIotKeystoreHelper.isKeystorePresent(keystorePath, keystoreName)) {
                if (AWSIotKeystoreHelper.keystoreContainsAlias(certificateId, keystorePath,
                        keystoreName, keystorePassword)) {
                    Log.i(LOG_TAG, "Certificate " + certificateId
                            + " found in keystore - using for MQTT.");
                    // load keystore from file into memory to pass on connection
                    clientKeyStore = AWSIotKeystoreHelper.getIotKeystore(certificateId,
                            keystorePath, keystoreName, keystorePassword);

                } else {
                    Log.i(LOG_TAG, "Key/cert " + certificateId + " not found in keystore.");
                }
            } else {
                Log.i(LOG_TAG, "Keystore " + keystorePath + "/" + keystoreName + " not found.");
            }
        } catch (Exception e) {
            Log.e(LOG_TAG, "An error occurred retrieving cert/key from keystore.", e);
        }

        if (clientKeyStore == null) {
            Log.i(LOG_TAG, "Cert/key was not found in keystore - creating new key and certificate.");

            new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        // Create a new private key and certificate. This call
                        // creates both on the server and returns them to the
                        // device.
                        CreateKeysAndCertificateRequest createKeysAndCertificateRequest =
                                new CreateKeysAndCertificateRequest();
                        createKeysAndCertificateRequest.setSetAsActive(true);
                        final CreateKeysAndCertificateResult createKeysAndCertificateResult;
                        createKeysAndCertificateResult =
                                mIotAndroidClient.createKeysAndCertificate(createKeysAndCertificateRequest);
                        Log.i(LOG_TAG,
                                "Cert ID: " +
                                        createKeysAndCertificateResult.getCertificateId() +
                                        " created.");

                        // store in keystore for use in MQTT client
                        // saved as alias "default" so a new certificate isn't
                        // generated each run of this application
                        AWSIotKeystoreHelper.saveCertificateAndPrivateKey(certificateId,
                                createKeysAndCertificateResult.getCertificatePem(),
                                createKeysAndCertificateResult.getKeyPair().getPrivateKey(),
                                keystorePath, keystoreName, keystorePassword);

                        // load keystore from file into memory to pass on
                        // connection
                        clientKeyStore = AWSIotKeystoreHelper.getIotKeystore(certificateId,
                                keystorePath, keystoreName, keystorePassword);

                        // Attach a policy to the newly created certificate.
                        // This flow assumes the policy was already created in
                        // AWS IoT and we are now just attaching it to the
                        // certificate.
                        AttachPrincipalPolicyRequest policyAttachRequest =
                                new AttachPrincipalPolicyRequest();
                        policyAttachRequest.setPolicyName(AWS_IOT_POLICY_NAME);
                        policyAttachRequest.setPrincipal(createKeysAndCertificateResult
                                .getCertificateArn());
                        mIotAndroidClient.attachPrincipalPolicy(policyAttachRequest);

                    } catch (Exception e) {
                        Log.e(LOG_TAG,
                                "Exception occurred when generating new private key and certificate.",
                                e);
                    }
                }
            }).start();
        }
    }

    public void connect(AWSIotMqttClientStatusCallback callback) {
        Log.d(LOG_TAG, "clientId = " + clientId);
        try {
            mqttManager.connect(clientKeyStore, callback);
        } catch (final Exception e) {
            Log.e(LOG_TAG, "Connection error.", e);
            //tvStatus.setText("Error! " + e.getMessage());
        }
    }

    public void subscribe(String topic, AWSIotMqttNewMessageCallback callback) {
        //final String topic = txtSubcribe.getText().toString();
        Log.d(LOG_TAG, "topic = " + topic);
        try {
            mqttManager.subscribeToTopic(topic, AWSIotMqttQos.QOS0, callback);
        } catch (Exception e) {
            Log.e(LOG_TAG, "Subscription error.", e);
        }
    }
    public void publish(String topic, String msg) {
        /*
        final String topic = txtTopic.getText().toString();
        final String msg = txtMessage.getText().toString();
        */
        try {
            mqttManager.publishString(msg, topic, AWSIotMqttQos.QOS0);
        } catch (Exception e) {
            Log.e(LOG_TAG, "Publish error.", e);
        }
    }
    public void disconnect() {
        try {
            mqttManager.disconnect();
        } catch (Exception e) {
            Log.e(LOG_TAG, "Disconnect error.", e);
        }
    }
}


