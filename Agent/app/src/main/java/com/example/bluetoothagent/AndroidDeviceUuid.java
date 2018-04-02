package com.example.bluetoothagent;

import android.content.Context;
import android.telephony.TelephonyManager;

/**
 * Created by wei on 1/1/18.
 */

public class AndroidDeviceUuid {
    private static String uuid;

    public static void configUuid(Context context) {
        TelephonyManager tManager = (TelephonyManager)context.getSystemService(Context.TELEPHONY_SERVICE);
        AndroidDeviceUuid.uuid = tManager.getDeviceId();
    }

    public static String getUuid() {
        return AndroidDeviceUuid.uuid;
    }
}
