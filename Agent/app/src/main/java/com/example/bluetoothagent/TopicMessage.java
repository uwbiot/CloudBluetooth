package com.example.bluetoothagent;

import org.json.JSONObject;

/**
 * Created by wei on 3/1/18.
 */

public class TopicMessage {
    public String scan_req;
    public String scan_res;
    public String conn_req;
    public String conn_res;
    public String disconn_req;
    public String data_req;
    public String data_res;
    public String conn_device;

    public TopicMessage(String message) {
        try {
            JSONObject json = new JSONObject(message);
            this.scan_req = json.getString("scanReq");
            this.scan_res = json.getString("scanRes");
            this.conn_req = json.getString("connReq");
            this.conn_res = json.getString("connRes");
            this.disconn_req = json.getString("disconnReq");
            this.data_req = json.getString("dataReq");
            this.data_res = json.getString("dataRes");
            this.conn_device = json.getString("connDevice");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
