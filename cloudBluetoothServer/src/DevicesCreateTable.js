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

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "Devices",
    KeySchema: [
        { AttributeName: "agentID", KeyType: "HASH"},  //partition key
        { AttributeName: "macAddress", KeyType: "RANGE" }    // sort key    
    ],
    AttributeDefinitions: [
        { AttributeName: "agentID", AttributeType: "S"},   
        { AttributeName: "macAddress", AttributeType: "S" },
        { AttributeName: "lastAvailTime", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    },
    GlobalSecondaryIndexes: [
        {
            IndexName: "IsAvailable",
            KeySchema: [
                //{AttributeName: "macAddress", KeyType: "HASH"}, //partition key
                { AttributeName: "lastAvailTime", KeyType: "HASH" } // partition key
            ],
            Projection: {
                ProjectionType: "ALL"
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        }
    ]
};

var paramsDelete = {
    TableName: "Devices"
};

function dynamodbCreateTable(){
}

dynamodbCreateTable.prototype.createTable = function() {
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });  
}

dynamodbCreateTable.prototype.deleteTable = function () {
    dynamodb.deleteTable(paramsDelete, function (err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports = dynamodbCreateTable;

