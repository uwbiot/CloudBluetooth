package com.example.bluetoothagent;

import android.widget.TextView;

/**
 * Created by wei on 3/3/18.
 */

public class TopicsManager {
    private TopicMessage topicMessage;
    private TextView textView;
    public TopicsManager (TextView textView) {
        this.topicMessage = null;
        this.textView = textView;
    }

    public TopicMessage getTopics() {
        if(this.topicMessage == null) {
            String message = CallServerAPI.registerDevice(textView);
            this.topicMessage = new TopicMessage(message);
        }
        return this.topicMessage;
    }
}
