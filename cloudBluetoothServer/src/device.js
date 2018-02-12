
var awsIot = require('aws-iot-device-sdk');

///Users/wei/Documents/nodejs/temp
var device = awsIot.device({
  keyPath: '../css600iot.private.key',
 certPath: '../css600iot.cert.pem',
   caPath: '../caroot.key',
 clientId: 'css600iotnode',
     host: 'a3vn897wwb8rzw.iot.us-west-2.amazonaws.com'
});

const DynamoDBClient = require('./DynamoDBClient.js');

var dynamoDBClient = new DynamoDBClient();

var onServiceDiscover = null;

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

device
  .on('connect', function() {
    console.log('connect');
    device.subscribe('scan_result_deviceList');
    device.subscribe('GATT_status');
    device.subscribe('GATT_data_response');
  });

device
  .on('message', function(topic, payload) {
    var message = JSON.parse(payload.toString());
    if (topic === 'scan_result_deviceList') {
      dynamoDBClient.putDevice(message);
    } else if (topic === 'GATT_status') {
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
    } else if (topic === 'GATT_data_response') {
      if (message.type === 'ACTION_DATA_AVAILABLE') {
        /* to do data */

      }
    }
    console.log('message', topic, payload.toString()); 
  });
}


iotManager.prototype.scan = function(agentID) {
  /* to do multiple agent support */
  device.publish('scan_request', 'scanning');
}

iotManager.prototype.connect = function(agentID, macAddress) {
  /* to do multiple agent support */
  device.publish("to_beConnected_macAddress", macAddress);
}

var MessageType = {READ: 0,
   WRITE : 1,};

iotManager.prototype.readData = function(type, chara) {
  var myObj = {"messageType": type, "chara": chara};
  var myJSON = JSON.stringify(myObj);
  device.publish("GATT_data_request", myJSON);
}

iotManager.prototype.writeData = function(type, chara, bytes) {
  var myObj = {"messageType" : type, "chara" : chara, "bytes" : bin2string(bytes)};
  var myJSON = JSON.stringify(myObj);
  device.publish("GATT_data_request", myJSON);
}

function bin2string(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result += (String.fromCharCode(array[i]));
  }
  return result;
}

iotManager.prototype.registerOnServiceDiscover = function(callback) {
  onServiceDiscover = callback;
}

iotManager.prototype.unRegisterOnServiceDiscover = function() {
  onServiceDiscover = null;
}

module.exports = iotManager;