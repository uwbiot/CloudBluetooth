package com.example.bluetoothagent;

import static java.lang.Math.pow;

/**
 * Created by wei on 5/23/18.
 */

public class SampleNotification {
    public static String convert(final byte [] value) {
        if (value != null && value.length > 0) {
            int mantissa;
            int exponent;
            Integer sfloat = shortUnsignedAtOffset(value, 0);

            mantissa = sfloat & 0x0FFF;
            exponent = (sfloat >> 12) & 0xFF;

            double output;
            double magnitude = pow(2.0f, exponent);
            output = (mantissa * magnitude);
            return String.valueOf(output);
        }
        return "0";
    }

    private static Integer shortUnsignedAtOffset(byte[] c, int offset) {
        Integer lowerByte = (int) c[offset] & 0xFF;
        Integer upperByte = (int) c[offset+1] & 0xFF;
        return (upperByte << 8) + lowerByte;
    }
}
