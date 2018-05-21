var AWS = require("aws-sdk");
/*
AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});
*/

AWS.config.update({
  region: "us-west-2"
});

var CHECK_AVAILABLE_PERIOD = 300;
var CHECK_CONNECT_PERIOD = 10;

var docClient = new AWS.DynamoDB.DocumentClient();
var devicesTable = "Devices";
var publicTable = "publicServices";
var userDefineTable = "userDefineServices";
var agentIDKeyTable = "AgentIDKeyMap";
var userKeysTable = "UserKeysList";

function DynamoDBClient() {
}

DynamoDBClient.prototype.putDevice = function (agentID, macAddress, deviceName) {
    var date = new Date();
    console.log("agentID:" + agentID);
    console.log("macAddress:" + macAddress);
    console.log("deviceName:" + deviceName);
    var params = {
        TableName: devicesTable,
        Item:{
            "agentID": agentID,
            "macAddress": macAddress,
            "deviceName": deviceName,
            "lastAvailTime": Math.floor(date.getTime() / 1000),
            "lastConnTime": 0
        }
    };
    console.log("Adding new device...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add device. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added device:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.queryAvailableDevices = function(agentID, callback) {
    console.log("Querying for active devices");
    var params = {
        TableName: devicesTable,
        IndexName: "IsAvailable",
        KeyConditionExpression: "agentID = :agentID AND lastAvailTime > :limitAvailTime",
        ExpressionAttributeValues: {
            ":agentID": agentID,
            ":limitAvailTime": Math.floor(new Date().getTime() / 1000) - CHECK_AVAILABLE_PERIOD
        },
        ProjectionExpression: "macAddress, agentID, deviceName",
    };   
    console.log("Querying Devices table, get all available devices");
    docClient.query(params, (err, data) => {
        if (err) {
            console.error("Unable to query the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Query succeeded.");
            data.Items.forEach(function(device) {
               console.log(
                    device.macAddress + ": ",
                    device.agentID, ": ", device.deviceName);
            });
            if(callback) {
                callback(null, data.Items);
            }   
        }
    });
}

DynamoDBClient.prototype.updateServices = function(agentID, macAddress, services) {
    console.log("Adding service uuids to device");
    console.log("agentID:" + agentID);
    console.log("macAddress:" + macAddress);
    console.log("uuids:" + JSON.stringify(services));
    // Update the item, unconditionally,
    var params = {
        TableName: devicesTable,
        Key:{
            "agentID": agentID,
            "macAddress": macAddress
        },
        UpdateExpression: "set services = :s",
        ExpressionAttributeValues:{
            ":s":services
        },
        ReturnValues:"UPDATED_NEW"
    };
    console.log("Updating the services...");
    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update device. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Update device succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.updateAvailTime = function (agentID, macAddress) {
    console.log("Updating available time");
    console.log("agentID: " + agentID);
    console.log("macAddress: " + macAddress);
    // Update the item, unconditionally,
    var params = {
        TableName: devicesTable,
        Key: {
            "agentID": agentID,
            "macAddress": macAddress
        },
        UpdateExpression: "set lastAvailTime = :t",
        ExpressionAttributeValues: {
            ":t": Math.floor(new Date().getTime() / 1000)
        },
        ReturnValues: "UPDATED_NEW"
    };
    console.log("Updating the last available time...");
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update available time. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Update available time succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.updateConnTime = function (agentID, macAddress) {
    console.log("Updating connect time");
    console.log("agentID: " + agentID);
    console.log("macAddress: " + macAddress);
    var params = {
        TableName: devicesTable,
        Key: {
            "agentID": agentID,
            "macAddress": macAddress
        },
        UpdateExpression: "set lastAvailTime = :t, lastConnTime = :t",
        ExpressionAttributeValues: {
            ":t": Math.floor(new Date().getTime() / 1000)
        },
        ReturnValues: "UPDATED_NEW"
    };
    console.log("Updating the last connect time...");
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update connect time. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Update connect time succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.initialConnTime = function (agentID, macAddress) {
    console.log("Initial connect time to 0.");
    console.log("agentID: " + agentID);
    console.log("macAddress: " + macAddress);
    var params = {
        TableName: devicesTable,
        Key: {
            "agentID": agentID,
            "macAddress": macAddress
        },
        UpdateExpression: "set lastConnTime = :t",
        ExpressionAttributeValues: {
            ":t": 0
        },
        ReturnValues: "UPDATED_NEW"
    };
    console.log("Initial the last connect time...");
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to initial connect time. Error JSON: ", JSON.stringify(err, null, 2));
        } else {
            console.log("Update initial time succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.getDevice = function (agentID, macAddress, callback) {
    console.log("Getting for device with macAddress");
    var params = {
        TableName : devicesTable,
        Key: {
            "agentID": agentID,
            "macAddress": macAddress
        }
    };
    docClient.get(params, (err, data) => {
        if (err) {
            console.log("Unable to get. Error:", JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Get succeeded.");
            console.log("macAddress: "+ data.Item.macAddress
            + "agentID: " + data.Item.agentID + "lastAvailTime: " + data.Item.lastAvailTime
            + "lastConnTime: " + data.Item.lastConnTime);
            if (callback) {
                callback(data);
            }
        }
    });
}

DynamoDBClient.prototype.putPublicService = function (uuid, serviceName) {
    console.log("Put public services");
    var params = {
        TableName: publicTable,
        Item: {
            "serviceUUID": uuid,
            "serviceName": serviceName
        }
    };
    console.log("Adding new public service...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add public service. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added public service:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.putUserDefineService = function (uuid, serviceName) {
    console.log("Put user define services");
    var params = {
        TableName: userDefineTable,
        Item: {
            "serviceUUID": uuid,
            "serviceName": serviceName
        }
    };
    console.log("Adding new user define service...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add user define service. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added user define service:", JSON.stringify(data, null, 2));
        }
    });
}


DynamoDBClient.prototype.getPublicServiceName = function (uuid, callback) {
    console.log("Getting for service name with uuid");
    var serviceUUID = uuid;
    var paramsPublic = {
        TableName: publicTable,
        Key: {
            "serviceUUID": serviceUUID
        }
    };
    var paramsUser = {
        TableName: userDefineTable,
        Key: {
            "serviceUUID": serviceUUID
        }
    };
    docClient.get(paramsPublic, (err, data) => {
        if (err) {
            console.log("Unable to get. Error: ", JSON.stringify(err, null, 2));
            callback(err);
        } else {
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            if (data.Item == null) {
                docClient.get(paramsUser, (err, data) => {
                    if (err) {
                        console.log("Unable to get. Error:", JSON.stringify(err, null, 2));
                    } else {
                        //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                        if (callback) {
                            callback(data);
                        }
                    }
                });
            } else {
                if (callback) {
                    callback(data);
                }
            }
        }
    });
}

DynamoDBClient.prototype.getAllPublicServices = function (callback) {
    console.log("Scanning for public services");
    var params = {
        TableName: publicTable,
        ProjectionExpression: "serviceUUID, serviceName"
    };
    console.log("Scanning Public Services table.");
    docClient.scan(params, (err, data) => {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan public services succeeded.");
            /*
            data.Items.forEach(function (item) {
                console.log(item.serviceUUID + ": " + item.serviceName);
            });
            */
            if (callback) {
                callback(data.Items);
            }
        }
    });
}

DynamoDBClient.prototype.getAllUserDefineServices = function (callback) {
    console.log("Scanning for user define services");
    var params = {
        TableName: userDefineTable,
        ProjectionExpression: "serviceUUID, serviceName"
    };
    console.log("Scanning User Define Services table.");
    docClient.scan(params, (err, data) => {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            callback(err);
        } else {
            // print all the movies
            console.log("Scan user define services succeeded.");
            /*
            data.Items.forEach(function (item) {
                console.log(item.serviceUUID + ": " + item.serviceName);
            });
            */
            if (callback) {
                callback(data.Items);
            }
        }
    });
}

DynamoDBClient.prototype.deleteService = function (uuid) {
    console.log("Deleting for service name with uuid");
    var serviceUUID = uuid;
    var params = {
        TableName: publicTable,
        key: {
            "serviceUUID": serviceUUID
        }
    };
    console.log("Attempting a public service delete...");
    docClient.delete(params, function (err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.deleteUserDefineService = function (uuid) {
    console.log("Deleting for service name with uuid");
    var serviceUUID = uuid;
    var params = {
        TableName: userDefineTable,
        key: {
            "serviceUUID": serviceUUID
        }
    };
    console.log("Attempting a user service delete...");
    docClient.delete(params, function (err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.putAgentIDKey = function (agentID, agentKey) {
    console.log("Put agentID key pair");
    var params = {
        TableName: agentIDKeyTable,
        Item: {
            "agentID": agentID,
            "agentKey": agentKey
        }
    };
    console.log("Adding new agentID key pair...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add agentID key pair. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added agentID key pair:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.getKey = function (agentID, callback) {
    console.log("Getting key for agentID");
    var params = {
        TableName: agentIDKeyTable,
        Key: {
            "agentID": agentID
        }
    };
    docClient.get(params, (err, data) => {
        if (err) {
            console.log("Unable to get. Error:", JSON.stringify(err, null, 2));
            //callback(err);
        } else {
            console.log("Get succeeded.");
            //console.log("agentId: " + data.Item.agentID + "key: " + data.Item.key);
            if (callback) {
                callback(data);
            }
        }
    });
}

DynamoDBClient.prototype.queryAgentID = function (agentKey, callback) {
    console.log("Querying agentID for key");
    console.log("agentKey: " + agentKey);
    var params = {
        TableName: agentIDKeyTable,
        IndexName: "key2AgentID",
        KeyConditionExpression: "agentKey = :agentKey",
        ExpressionAttributeValues: {
            ":agentKey": agentKey
        },
    };
    docClient.query(params, (err, data) => {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Query succeeded.");
            //console.log("agentID: " + data.Items[0].agentID + "key: " + data.Items[0].agentKey);
            if (callback) {
                callback(data);
            }
        }
    });
} 

DynamoDBClient.prototype.putUserInfo = function (userEmailAddress) {
    console.log("Put user info");
    var params = {
        TableName: userKeysTable,
        Item: {
            "userEmailAddress": userEmailAddress,
            "keysList" : [],
            "agentIDsList" : []
        }
    };
    console.log("Adding new user...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add user. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added user:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.updateUserKey = function (userEmailAddress, agentKey, agentID) {
    console.log("Updating user keyList");
    console.log("userEmailAddress: " + userEmailAddress);
    console.log("add new agentKey: " + agentKey);
    console.log("add new agentID: " + agentID);
    // Update the item, unconditionally,
    var params = {
        TableName: userKeysTable,
        Key: {
            "userEmailAddress": userEmailAddress
        },
        UpdateExpression: "SET keysList = list_append(keysList, :kyeVals), agentIDsList = list_append(agentIDsList, :agentVals)",
        ExpressionAttributeValues: {
            ":kyeVals": [agentKey],
            ":agentVals": [agentID]
        },
        ReturnValues: "ALL_NEW"
    };
    console.log("Updating the user keys list...");
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update user keys list. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Update user keys list succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

DynamoDBClient.prototype.getUserInfoList = function (userEmailAddress, callback) {
    console.log("Getting for user key lists");
    var params = {
        TableName: userKeysTable,
        Key: {
            "userEmailAddress": userEmailAddress
        }
    };
    docClient.get(params, (err, data) => {
        if (err) {
            console.log("Unable to get. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Get succeeded.");
            //console.log("userEmailAddress: " + data.Item.userEmailAddress
            //    + " keysList: " + data.Item.keysList);
            if (callback) {
                callback(data);
            }
        }
    });
}

module.exports = DynamoDBClient;