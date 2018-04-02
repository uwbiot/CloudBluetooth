
var awsIot = require('aws-iot-device-sdk');
/*
///Users/wei/Documents/nodejs/temp
var device = awsIot.device({
  keyPath: './css600iot.private.key',
 certPath: './css600iot.cert.pem',
   caPath: './caroot.key',
 clientId: 'css600iotnode',
     host: 'a3vn897wwb8rzw.iot.us-west-2.amazonaws.com'
});
*/

var device = awsIot.device({
  keyPath: './css599wxIoT.private.key',
  certPath: './css599wxIoT.cert.pem',
  caPath: './caroot.key',
  clientId: 'css599wxIoTnode',
  host: 'a17v6hh1labrsy.iot.us-west-2.amazonaws.com'
});

const DynamoDBClient = require('./DynamoDBClient.js');

var dynamoDBClient = new DynamoDBClient();

var onServiceDiscover = null;
//var onDataReceived = null;  
var requestIdDataCallbackMap = new Object();
var requestIdConnectCallbackMap = new Object();
//define topics
const SCAN_REQ = 'scan_req';
const SCAN_RES = 'scan_res';
const CONN_REQ = 'conn_req';
const CONN_RES = 'conn_res';
const DISCONN_REQ = 'disconn_req';
const DATA_REQ = 'data_req';
const DATA_RES = 'data_res';
const CONN_DEVICE = 'conn_device';

function iotManager() {
//
// Replace the values of '<YourUniqueClientIdlsentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts 
// to connect with a client identifier which is already in use, the existing 
// connection will be terminated.
//

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
/*
device
  .on('connect', function() {
    console.log('connect');
    device.publish("test node", "TEST nodejs!!!!!!!");
  });
*/
device
  .on('message', function(topic, payload) {
    var message = JSON.parse(payload.toString());
    if (topic.endsWith(SCAN_RES)) {
      var agentID = message.agentID;
      var macAddress = message.macAddress;
      var deviceName = message.deviceName;
      dynamoDBClient.putDevice(agentID, macAddress, deviceName);
    } else if (topic.endsWith(CONN_RES)) {
      if (message.type === 'ACTION_GATT_SERVICES_DISCOVERED') {
        var requestId = message.requestId;
        var agentID = message.agentID;
        var macAddress = message.macAddress;
        var services = message.services;
        var onServiceDiscover = requestIdConnectCallbackMap[requestId];
        if (onServiceDiscover) {
          console.log(services.length);
          onServiceDiscover(message.services);
        }
        dynamoDBClient.updateServices(agentID, macAddress, services);
      } else if (message.type === 'ACTION_GATT_DISCONNECTED') {
        /* update this onServiceDiscover*/
        var requestId = message.requestId;
        var onServiceDiscover = requestIdConnectCallbackMap[requestId];
        if (onServiceDiscover) {
          onServiceDiscover('Disconnected!');
        }
      } /*else if (message.type === 'ACTION_GATT_CONNECTED') {
         // update this onServiceDiscover
        if (onServiceDiscover) {
          onServiceDiscover('Connected!');
        }
      }*/
    } else if (topic.endsWith(DATA_RES)) {
      if (message.type === 'ACTION_DATA_READ') {
        var requestId = message.requestId;
        var value = message.value;
        console.log("recevied read data:" + message.value);
        console.log("requestId:" + message.requestId);
        var onDataReceived = requestIdDataCallbackMap[requestId];
        if(onDataReceived) {
          onDataReceived(message);
        }
      } else if (message.type === 'ACTION_DATA_WRITE') {
        var requestId = message.requestId;
        console.log("requestId:" + message.requestId);
        var onDataReceived = requestIdDataCallbackMap[requestId];
        if (onDataReceived) {
          onDataReceived(message);
        }
      }
    } else if (topic.endsWith(CONN_DEVICE)) {
      var agentID = message.agentID;
      var macAddress = message.macAddress;
      dynamoDBClient.updateConnTime(agentID, macAddress);
    }
    console.log('message', topic, payload.toString()); 
  });
}

iotManager.prototype.subscribeTopics = function(topics) {
  console.log("subscribe to topics");
  topics.forEach(topic => {
    device.subscribe(topic);
  });
}
/*
iotManager.prototype.scan = function(topic) {
  console.log("scanning topics: " + topic);
  device.publish(topic, 'scanning');
}
*/
iotManager.prototype.connect = function(macAddress, topic, requestId) {
  console.log("connecting topics: " + topic);
  var myObj = {"macAddress": macAddress, "requestId": requestId};
  var myJSON = JSON.stringify(myObj);
  console.log("connect request " + myJSON);
  device.publish(topic, myJSON);
}

iotManager.prototype.disconnect = function(macAddress, topic, requestId) {
  console.log("disconnect topics: " + topic);
  var myObj = { "macAddress": macAddress, "requestId": requestId };
  var myJSON = JSON.stringify(myObj);
  console.log("disconnect request " + myJSON);
  device.publish(topic, myJSON);
}

iotManager.prototype.readData = function(chara, macAddress, topic, requestId) {
  var myObj = {"messageType": "READ", "uuid": chara, "macAddress": macAddress, 
               "requestId": requestId};
  var myJSON = JSON.stringify(myObj);
  device.publish(topic, myJSON);
}

iotManager.prototype.writeData = function(chara, bytes, macAddress, topic, requestId) {
  var myObj = { "messageType": "WRITE", "uuid": chara, "bytes": bytes, 
                "macAddress": macAddress, "requestId": requestId};
  var myJSON = JSON.stringify(myObj);
  device.publish(topic, myJSON);
}

iotManager.prototype.registerOnServiceDiscover = function(requestId, callback) {
  requestIdConnectCallbackMap[requestId] = callback;
}

iotManager.prototype.unRegisterOnServiceDiscover = function(requestId) {
  requestIdConnectCallbackMap[requestId] = null;
}

iotManager.prototype.registerOnDataReceived = function (requestId, callback) {
  requestIdDataCallbackMap[requestId] = callback;
}

iotManager.prototype.unRegisterOnDataReceived = function (requestId) {
  requestIdDataCallbackMap[requestId] = null;
}

module.exports = iotManager;