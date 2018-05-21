var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "publicServices",
    KeySchema: [
        { AttributeName: "serviceUUID", KeyType: "HASH" },  //Partition key
        //{ AttributeName: "serviceName", KeyType: "RANGE" } //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "serviceUUID", AttributeType: "S" },
        //{ AttributeName: "serviceName", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

function publicServiceTable() {

}

publicServiceTable.prototype.createTable = function () {
    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created public service table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

publicServiceTable.prototype.deleteTable = function() {
    var params = {
        TableName: "publicServices"
    };
    dynamodb.deleteTable(params, function (err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports = publicServiceTable;

