var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var CHECK_AVAILABLE_PERIOD = 300;
var CHECK_CONNECT_PERIOD = 10;

const IotManager = require('./device.js');
const DynamoDBClient = require('./DynamoDBClient.js');
const DynamoDBCreateTable = require('./DevicesCreateTable.js');
const DynamoDBCreatePublicTable = require('./PublicServiceMapTableCreate');
const DynamoDBCreateUserTable = require('./UserDefineServiceMapTableCreate');
const ServiceNameLookup = require('./ServiceNameLookup.js');

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
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.set("requestID", generateUUID());
    next();
});

var iotManager = new IotManager();
var dynamoDBClient = new DynamoDBClient();
var dynamoDBCreateTable = new DynamoDBCreateTable();
var dynamoDBCreatePublicTable = new DynamoDBCreatePublicTable();
var dynamoDBCreateUserTable = new DynamoDBCreateUserTable();
var serviceNameLookup = new ServiceNameLookup();
serviceNameLookup.getAllServices();

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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
    var topics =    
    {
        'scanReq': scanReq,
        'scanRes': scanRes,
        'connReq': connReq,
        'connRes': connRes,
        'disconnReq': disconnReq,
        'dataReq': dataReq,
        'dataRes': dataRes,
        'connDevice' : connDevice
    };
    //res.sendStatus(200);
    res.send(topics);
    var subscribeTopics = [scanRes, connRes, dataRes, connDevice];
    iotManager.subscribeTopics(subscribeTopics);
});

app.post('/availableDevice', (req, res) => {
    var message = req.body;
    var agentID = message.agentID;
    console.log("available agentID: " + agentID);
    var scanReq = agentID + '/' + SCAN_REQ;
    iotManager.scan(scanReq);
    res.sendStatus(200);
});

app.get('/devices', (req, res) => {
    dynamoDBClient.scanAllAvailableDevices((data) => {
        res.send(data);
    });
});

app.post('/connect', (req, res) => {
    var message = req.body;
    var agentID = message.agentID;
    var macAddress = message.macAddress;
    dynamoDBClient.getDevice(agentID, macAddress, (data) => {
        if (Math.floor(new Date().getTime() / 1000) - data.Item.lastConnTime < 5) {
            console.log("getting services from database " + data.Item.lastConnTime);
            var items = serviceNameLookupSend(data.Item.services);
            res.send(items);
        } else {
            iotManager.registerOnServiceDiscover((data) => {
                var items = serviceNameLookupSend(data);
                res.send(items);
                iotManager.unRegisterOnServiceDiscover();
            });
            iotManager.connect(macAddress, agentID + '/' + CONN_REQ);
        }
    });
});

app.post('/disconnect', (req, res) => {
    var message = req.body;
    var agentID = message.agentID;
    var macAddress = message.macAddress;
    iotManager.disconnect(macAddress, agentID + '/' + DISCONN_REQ);
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

app.post('/userdefineService', (req, res) => {
    var message = req.body;
    var serviceUUID = message.serviceUUID;
    var serviceName = message.serviceName;
    dynamoDBClient.putUserDefineService(serviceUUID, serviceName);
    res.sendStatus(200);
});

app.get('/publicServices', (req, res) => {
    dynamoDBClient.getAllPublicServices((data) => {
        res.send(data);
    });
});

app.get('/userDefineServices', (req, res) => {
    dynamoDBClient.getAllUserDefineServices((data) => {
        res.send(data);
    });
});

app.post('/read', (req, res) => {
    var message = req.body;
    var chara = message.chara;
    var macAddress = message.macAddress;
    var agentID = message.agentID;
    var dataReq = agentID + '/' + DATA_REQ;
    iotManager.registerOnDataReceived((data) => {
        res.send(data);
        iotManager.unRegisterOnDataReceived();
    })
    iotManager.readData(chara, macAddress, dataReq);
})

app.post('/write', (req, res) => {
    var message = req.body;
    var chara = message.chara;
    var bytes = message.bytes;
    var macAddress = message.macAddress;
    var agentID = message.agentID;
    var dataReq = agentID + '/' + DATA_REQ;
    iotManager.writeData(chara, bytes, macAddress, dataReq);
    res.sendStatus(200);
})


//dynamoDBCreateTable.deleteTable();
//dynamoDBCreatePublicTable.createTable();
//dynamoDBCreateUserTable.createTable();


// io.on('connection', (socket) => {
//     socket.on('scandevice', (msg) =>{
//         iotManger.scan();
//         console.log('receive scan');
//     });
// });
var port = process.env.PORT || 4000;
http.listen(port, "0.0.0.0");