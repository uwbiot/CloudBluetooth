const DynamoDBClient = require('./DynamoDBClient.js');
const DynamoDBTable = require('./DevicesTable.js');
const DynamoDBAgentIDKeyMapTable = require('./AgentIDKeyMapTable.js');

var dynamoDBClient = new DynamoDBClient();
var dynamoDBTable = new DynamoDBTable();
var dynamoDBAgentIDKeyMapTable = new DynamoDBAgentIDKeyMapTable();

//dynamoDBCreateTable.createTable();
//dynamoDBCreateTable.deleteTable();
/*
dynamoDBClient.queryAgentID("869851020200859", (data) => {
    console.log(data);
})
*/
/*
dynamoDBClient.getDevice("869851020200859", "24:71:89:07:4A:82", (data) => {
    console.log(data.Item.lastConnTime + " " + data.Item.macAddress);
});
*/


//dynamoDBClient.putUserInfo('weixu@uw.edu');
//dynamoDBClient.updateUserKey('weixu@uw.edu', 'abcdef2', '12345567');
/*
dynamoDBClient.getUser('weixu@uw.edu', (data) => {
    if (data.Item) {
        console.log("userEmailAddress: " + data.Item.userEmailAddress
            + " keysList: " + data.Item.keysList + " agentIDsList: " + data.Item.agentIDsList);
    } else {
        console.log("item not found!");
    }  
});
*/
//dynamoDBClient.putAgentIDKey('123456', 'adbc');
/*
dynamoDBClient.getKey('123456', (data) => {
    console.log(data.Item.agentKey);
});

dynamoDBClient.queryAgentID('adbc', (data) => {
    console.log(data.Items[0].agentID);
});
*/
dynamoDBClient.queryAvailableDevices("869851020200859", (err, data) => {
    data.forEach(device => {
        console.log("device macAddress: " + device.macAddress);
    });
});