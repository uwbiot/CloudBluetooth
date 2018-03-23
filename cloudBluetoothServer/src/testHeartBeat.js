const DynamoDBClient = require('./DynamoDBClient.js');
const DynamoDBCreateTable = require('./DevicesCreateTable.js');

var dynamoDBClient = new DynamoDBClient();
var dynamoDBCreateTable = new DynamoDBCreateTable();

dynamoDBCreateTable.createTable();
//dynamoDBCreateTable.deleteTable();

/*
dynamoDBClient.getDevice("869851020200859", "24:71:89:07:4A:82", (data) => {
    console.log(data.Item.lastConnTime + " " + data.Item.macAddress);
});
*/
