package com.example.bluetoothagent;

import android.os.StrictMode;
import android.util.Log;
import android.widget.TextView;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

import static com.example.bluetoothagent.IotClient.LOG_TAG;

/**
 * Created by wei on 1/6/18.
 */

public class CallServerAPI {
    private static final String POST_REG_URL = "http://cloudbluetooth.us-west-2.elasticbeanstalk.com/register";
    //private static final String POST_REG_URL = "http://192.168.1.14:4000/register";
    //private static final String agentID = AndroidDeviceUuid.getUuid();
    //private static final String POST_PARAMS = "{\"agentID\":\"" + agentID + "\"}";

    public static String registerDevice(TextView status) {
        StringBuilder response  = new StringBuilder();
        try {
            StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
            StrictMode.setThreadPolicy(policy);
            Log.d(LOG_TAG, "sending register request to the server, get all the topics...");
            status.append("sending register request to the server, get all the topics...");
            URL obj = new URL(POST_REG_URL);
            HttpURLConnection con = (HttpURLConnection) obj.openConnection();
            con.setRequestMethod("POST");
            con.setDoInput(true);
            con.setDoOutput(true);
            con.setRequestProperty("Content-Type", "application/json");
            con.connect();
            OutputStreamWriter os = new OutputStreamWriter(con.getOutputStream());
            os.write(getAndroidDeviceUUID(status));
            os.flush();
            os.close();
            if (con.getResponseCode() == 200) {
                BufferedReader input = new BufferedReader(new InputStreamReader(con.getInputStream()),8192);
                String strLine = null;
                while ((strLine = input.readLine()) != null) {
                    response.append(strLine);
                }
                input.close();
            }
            Log.d(LOG_TAG, "sending register request to the server, get topics:" + response.toString());
            status.append("sending register request to the server, get topics:" + response.toString());
        } catch(IOException e) {
            System.err.print(e);
        }
        return response.toString();
    }
/*
    public static void availableDevice(TextView status) {
        try {
            StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
            StrictMode.setThreadPolicy(policy);
            Log.d(LOG_TAG, "sending available devices request to the server...");
            status.append("sending available devices request to the server...");
            URL obj = new URL(POST_AVAIL_URL);
            HttpURLConnection con = (HttpURLConnection) obj.openConnection();
            con.setRequestMethod("POST");
            con.setDoInput(true);
            con.setDoOutput(true);
            con.setRequestProperty("Content-Type", "application/json");
            con.connect();
            OutputStreamWriter os = new OutputStreamWriter(con.getOutputStream());
            os.write(getAndroidDeviceUUID(status));
            os.flush();
            os.close();
            int response = con.getResponseCode();
            Log.d(LOG_TAG, "sending available devices request and get response :" + response);
            status.append("sending available devices request and get response:" + response);
        } catch(IOException e) {
            System.err.print(e);
        }
    }
*/
    private static String getAndroidDeviceUUID (TextView status) {
        String agentID = AndroidDeviceUuid.getUuid();
        String POST_PARAMS = "{\"agentID\":\"" + agentID + "\"}";
        status.append("POST_PARAMS: " + POST_PARAMS);
        return POST_PARAMS;
    }
}
