var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jwt = require('jwt-simple');
var async = require('async');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '323138957375-8v8rbrk83slomrclgnhaemoc939mpkip.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

var CHECK_AVAILABLE_PERIOD = 300;
var CHECK_CONNECT_PERIOD = 10;

const IotManager = require('./device.js');
const DynamoDBClient = require('./DynamoDBClient.js');
const DynamoDBDeviceTable = require('./DevicesTable.js');
const DynamoDBPublicTable = require('./PublicServiceMapTable.js');
const DynamoDBUserTable = require('./UserDefineServiceMapTable.js');
const ServiceNameLookup = require('./ServiceNameLookup.js');
const DynamoDBAgentIDKeyMapTable = require('./AgentIDKeyMapTable.js');
const DynamoDBUserKeysListTable = require('./UserKeysListMapTable.js');
const Authentication = require('./authentication.js');

//define topics
const SCAN_REQ = 'scan_req';
const SCAN_RES = 'scan_res';
const CONN_REQ = 'conn_req';
const CONN_RES = 'conn_res';
const DISCONN_REQ = 'disconn_req';
const DATA_REQ = 'data_req';
const DATA_RES = 'data_res';
const CONN_DEVICE = 'conn_device';

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("requestId", generateUUID());
    next();
});

var iotManager = new IotManager();
var dynamoDBClient = new DynamoDBClient();
var dynamoDBDeviceTable = new DynamoDBDeviceTable();
var dynamoDBPublicTable = new DynamoDBPublicTable();
var dynamoDBUserTable = new DynamoDBUserTable();
var serviceNameLookup = new ServiceNameLookup();
var dynamoDBAgentIDKeyMapTable =  new DynamoDBAgentIDKeyMapTable();
var dynamoDBUserKeysListTable = new DynamoDBUserKeysListTable();
var authentication = new Authentication();

serviceNameLookup.getAllServices();

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateAgentKey() {
    var allowedChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var key = '';
    for (var i = 0; i < 6; i++) {
        var index = Math.floor(Math.random() * 62);
        key += allowedChars.charAt(index);
    }
    return key;
}

function agentID2Key(agentID, callback) {
    dynamoDBClient.getKey(agentID, (data) => {
        if (data.Item) {
            callback(data.Item.agentKey);
        } else {
            generateUiqueKey(agentID, callback);
        }
    })
}

function generateUiqueKey(agentID, callback) {
    var newKey = generateAgentKey();
    console.log("generate new key:" + newKey);
    // check whether key is availiable. 
    dynamoDBClient.queryAgentID(newKey, (data) => {
        if (data.Item) {
            console.log("conflict key found!, retry");
            generateUiqueKey(agentID, callback);
        } else {
            dynamoDBClient.putAgentIDKey(agentID, newKey);
            callback(newKey);
        }
    })
}


function checkPermission(userEmailAddress, agentID) {
    return new Promise(function (resolve, reject) {
        dynamoDBClient.getUserInfoList(userEmailAddress, (data) => {
            if (data.Item) {
                var agentIDs = data.Item.agentIDsList;
                for (var i = 0; i < agentIDs.length; i++) {
                    if (agentIDs[i] === agentID) {
                        resolve(true);
                    }
                }
                reject(false);
            }
        });
        reject(false);
    });
};

// by local agent
app.post('/register', (req, res) => {
    var message = req.body;
    var agentID = message.agentID;
    var scanReq = agentID + '/' + SCAN_REQ;
    var scanRes = agentID + '/' + SCAN_RES;
    var connReq = agentID + '/' + CONN_REQ;
    var connRes = agentID + '/' + CONN_RES;
    var disconnReq = agentID + '/' + DISCONN_REQ;
    var dataReq = agentID + '/' + DATA_REQ;
    var dataRes = agentID + '/' + DATA_RES;
    var connDevice = agentID + '/' + CONN_DEVICE;
    console.log("register device: " + JSON.stringify(message));

    agentID2Key(agentID, (key) => {
        var registerRes = {
            'scanReq': scanReq,
            'scanRes': scanRes,
            'connReq': connReq,
            'connRes': connRes,
            'disconnReq': disconnReq,
            'dataReq': dataReq,
            'dataRes': dataRes,
            'connDevice': connDevice,
            'agentIDKey': key
         };
        res.send(registerRes);
        var subscribeTopics = [scanRes, connRes, dataRes, connDevice];
        iotManager.subscribeTopics(subscribeTopics);
    })
});

/*
app.post('/availableDevice', (req, res) => {
    var message = req.body;
    var agentID = message.agentID;
    console.log("available agentID: " + agentID);
    var scanReq = agentID + '/' + SCAN_REQ;
    iotManager.scan(scanReq);
    res.sendStatus(200);
});
*/

app.post('/addKey', (req, res) => {
    var id_token = req.get('Token');
    var message = req.body;
    var agentKey = message.agentKey;
    var userEmailAddress = authentication.getUserEmailAddress(id_token);
    dynamoDBClient.queryAgentID(agentKey, (data) => {
        if (data.Items) {
            var agentID = data.Items[0].agentID;
            dynamoDBClient.updateUserKey(userEmailAddress, agentKey, agentID);
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });
});

app.get('/getDevices', (req, res) => {
    var id_token = req.get('Token');
    var userEmailAddress = authentication.getUserEmailAddress(id_token);
    dynamoDBClient.getUserInfoList(userEmailAddress, (data) => {
        if (data.Item) {
            var agentIDs = data.Item.agentIDsList;
            console.log("userEmailAddress: " + userEmailAddress);
            agentIDs.forEach (agentID => {
                console.log("agentID: " + agentID);
            })
            var functionArray = [];
            agentIDs.forEach(agentID => {
                functionArray.push(
                    function(callback) {
                        dynamoDBClient.queryAvailableDevices(agentID, callback);
                    }
                );
            });
            async.parallel(
                functionArray,
                function(err, results) {
                    var devicesList = [];
                    results.forEach(devices => {
                        devices.forEach(device => {
                            devicesList.push(device);
                        })
                    });
                    res.send(devicesList);
                }
            );
        } else {
            dynamoDBClient.putUserInfo(userEmailAddress);
            res.sendStatus(200);
        }
    });
});

app.post('/connect', (req, res) => {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    console.log('ip of caller: ' + ip);

    //var id_token = req.get('Token');
    //var userEmailAddress = authentication.getUserEmailAddress(id_token);
    var requestId = res.get("requestId");
    var message = req.body;
    var agentID = message.agentID;
    var macAddress = message.macAddress;
    //checkPermission(userEmailAddress, agentID)
     //   .then(() => {
            dynamoDBClient.getDevice(agentID, macAddress, (data) => {
                if (Math.floor(new Date().getTime() / 1000) - data.Item.lastConnTime < 5) {
                    console.log("getting services from database " + data.Item.lastConnTime);
                    var items = serviceNameLookupSend(data.Item.services);
                    res.send(items);
                } else {
                    iotManager.registerOnServiceDiscover(requestId, (data) => {
                        var items = serviceNameLookupSend(data);
                        res.send(items);
                        iotManager.unRegisterOnServiceDiscover(requestId);
                    });
                    iotManager.connect(macAddress, agentID + '/' + CONN_REQ, requestId);
                }
       })
   /* }).catch(err => {
        res.sendStatus(404);
    })*/
    
});

app.post('/disconnect', (req, res) => {
    var requestId = res.get("requestId");
    var message = req.body;
    var agentID = message.agentID;
    var macAddress = message.macAddress;
    iotManager.disconnect(macAddress, agentID + '/' + DISCONN_REQ, requestId);
    dynamoDBClient.initialConnTime(agentID, macAddress);
    res.sendStatus(200);
});

function serviceNameLookupSend(data) {
    var items = [];
    if (data && data.forEach) {
        data.forEach(service => {
            var charas = [];
            service.charas.forEach(chara => {
                var charaName = serviceNameLookup.lookup(chara.uuid);
                charas.push({
                    uuid: chara.uuid,
                    name: charaName,
                });
            })
            console.log(charas);
            var serviceName = serviceNameLookup.lookup(service.uuid);
            items.push({
                uuid: service.uuid,
                name: serviceName,
                charas: charas
            })
        });
        return items;
    }
}

app.post('/addUserDefineService', (req, res) => {
    var message = req.body;
    var serviceUUID = message.serviceUUID;
    var serviceName = message.serviceName;
    dynamoDBClient.putUserDefineService(serviceUUID, serviceName);
    res.sendStatus(200);
});

app.post('/deleteUserDefineService', (req, res) => {
    var message = req.body;
    var serviceUUID = message.serviceUUID;
    dynamoDBClient.deleteUserDefineService(serviceUUID);
    res.sendStatus(200);
});

app.get('/getPublicServices', (req, res) => {
    dynamoDBClient.getAllPublicServices((data) => {
        res.send(data);
    });
});

app.get('/getUserDefineServices', (req, res) => {
    dynamoDBClient.getAllUserDefineServices((data) => {
        res.send(data);
    });
});

app.post('/read', (req, res) => {
    var requestId = res.get("requestId");
    var message = req.body;
    var chara = message.chara;
    var macAddress = message.macAddress;
    var agentID = message.agentID;
    var dataReq = agentID + '/' + DATA_REQ;
    iotManager.registerOnDataReceived(requestId, (data) => {
        res.send(data);
        iotManager.unRegisterOnDataReceived(requestId);
    });
    iotManager.readData(chara, macAddress, dataReq, requestId);
})

app.post('/write', (req, res) => {
    var requestId = res.get("requestId");
    var message = req.body;
    var chara = message.chara;
    var bytes = message.bytes;
    var macAddress = message.macAddress;
    var agentID = message.agentID;
    var dataReq = agentID + '/' + DATA_REQ;
    iotManager.registerOnDataReceived(requestId, (data) => {
        res.send(data);
        iotManager.unRegisterOnDataReceived(requestId);
    });
    iotManager.writeData(chara, bytes, macAddress, dataReq, requestId);
})

app.get('/validateToken', (req, res) => {
    var id_token = req.get('Token');
    console.log("id token get from client: " + id_token);
    client.verifyIdToken({
        idToken: id_token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    }, (err, login) => {
        if (!err) {
            const payload = login.getPayload();
            const userid = payload['sub'];
            console.log("payload: " + JSON.stringify(payload));
            res.cookie('Token', id_token);
            res.sendStatus(200);
        } else {
            console.log(err);
            res.sendStatus(500);
        }
    });
})

//dynamoDBDeviceTable.createTable();
//dynamoDBCreateTable.createTable();
//dynamoDBCreatePublicTable.createTable();
//dynamoDBCreateUserTable.createTable();
//dynamoDBAgentIDKeyMapTable.createTable();
//dynamoDBAgentIDKeyMapTable.deleteTable();
//dynamoDBUserKeysListTable.createTable();
//dynamoDBUserKeysListTable.deleteTable();
//dynamoDBCreateAgentIDKeyMapTable.deleteTable();
// io.on('connection', (socket) => {
//     socket.on('scandevice', (msg) =>{
//         iotManger.scan();
//         console.log('receive scan');
//     });
// });

process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
});

var port = process.env.PORT || 4000;
http.listen(port, "0.0.0.0");