
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
var onDataReceived = null;  

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
        var agentID = message.agentID;
        var macAddress = message.macAddress;
        var services = message.services;
        if (onServiceDiscover) {
          console.log(services.length);
          onServiceDiscover(message.services);
        }
        dynamoDBClient.updateServices(agentID, macAddress, services);
      } else if (message.type === 'ACTION_GATT_DISCONNECTED') {
        if (onServiceDiscover) {
          onServiceDiscover('Disconnected!');
        }
      } else if (message.type === 'ACTION_DATA_AVAILABLE') {
        /* to do data */
      }
    } else if (topic.endsWith(DATA_RES)) {
      if (message.type === 'ACTION_DATA_AVAILABLE') {
        console.log("recevied data:" + message.value);
        if(onDataReceived) {
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

iotManager.prototype.scan = function(topic) {
  console.log("scanning topics: " + topic);
  device.publish(topic, 'scanning');
}

iotManager.prototype.connect = function(macAddress, topic) {
  console.log("connecting topics: " + topic);
  device.publish(topic, macAddress);
}

iotManager.prototype.disconnect = function(macAddress, topic) {
  console.log("disconnect topics: " + topic);
  console.log("disconnect macAddress: " + macAddress);
  device.publish(topic, macAddress);
}

iotManager.prototype.readData = function(chara, macAddress, topic) {
  var myObj = {"messageType": "READ", "uuid": chara, "macAddress": macAddress};
  var myJSON = JSON.stringify(myObj);
  device.publish(topic, myJSON);
}

iotManager.prototype.writeData = function(chara, bytes, macAddress, topic) {
  var myObj = {"messageType" : "WRITE", "uuid" : chara, "bytes" : bytes, "macAddress" : macAddress};
  var myJSON = JSON.stringify(myObj);
  device.publish(topic, myJSON);
}

iotManager.prototype.registerOnServiceDiscover = function(callback) {
  onServiceDiscover = callback;
}

iotManager.prototype.unRegisterOnServiceDiscover = function() {
  onServiceDiscover = null;
}

iotManager.prototype.registerOnDataReceived = function (callback) {
  onDataReceived = callback;
}

iotManager.prototype.unRegisterOnDataReceived = function () {
  onDataReceived = null;
}

module.exports = iotManager;