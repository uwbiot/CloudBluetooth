var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const IotManager = require('./device.js');
const DynamoDBClient = require('./DynamoDBClient.js');
const DynamoDBCreateTable = require('./DevicesCreateTable.js');
const DynamoDBCreatePublicTable = require('./PublicServiceMapTableCreate');
const DynamoDBCreateUserTable = require('./UserDefineServiceMapTableCreate');
const ServiceNameLookup = require('./ServiceNameLookup.js');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var iotManager = new IotManager();
var dynamoDBClient = new DynamoDBClient();
var dynamoDBCreateTable = new DynamoDBCreateTable();
var dynamoDBCreatePublicTable = new DynamoDBCreatePublicTable();
var dynamoDBCreateUserTable = new DynamoDBCreateUserTable();
var serviceNameLookup = new ServiceNameLookup();
serviceNameLookup.getAllServices();

app.post('/deviceRegister', (req, res) => {
    var message = req.body;
    var agentID = message.agentID;
    console.log(agentID);
    iotManager.scan(agentID);
    res.sendStatus(200);
});

app.get('/devices', (req, res) => {
    dynamoDBClient.scanAllDevices((data) => {
        res.send(data);
    });
});

app.post('/services', (req, res) => {
    var message = req.body;
    var agentID = message.agentID;
    var macAddress = message.macAddress;

    iotManager.registerOnServiceDiscover((data) => {
        var items = [];
        if(data) {
            data.forEach(service => {
                var charas = [];
                service.charas.forEach(chara => {
                    var charaName = serviceNameLookup.lookup(chara.uuid);
                    charas.push({
                        uuid: chara.uuid,
                        name: charaName
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
            res.send(items);
        }
        iotManager.unRegisterOnServiceDiscover();
    });
    iotManager.connect(agentID, macAddress);
});

app.post('/userdefineService', (req, res) => {
    var message = req.body;
    var serviceUUID = message.serviceUUID;
    var serviceName = message.serviceName;
    dynamoDBClient.putUserDefineService(serviceUUID, serviceName);
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

var MessageType = {
    READ: 0,
    WRITE: 1,
};

app.post('/read', (req, res) => {
    var message = req.body;
    var chara = message.chara;
    iotManager.readData(MessageType.READ, chara);
    res.send(data);
})

app.post('/write', (req, res) => {
    var message = req.body;
    var chara = message.chara;
    var bytes = message.bytes;
    iotManager.writeData(MessageType.WRITE, chara, bytes);
})

/*
dynamoDBCreateTable.createTable();
dynamoDBCreatePublicTable.createTable();
dynamoDBCreateUserTable.createTable();
*/
// io.on('connection', (socket) => {
//     socket.on('scandevice', (msg) =>{
//         iotManger.scan();
//         console.log('receive scan');
//     });
// });
var port = process.env.PORT || 4000;
http.listen(port, "0.0.0.0");