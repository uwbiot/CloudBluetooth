var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "AgentIDKeyMap",
    KeySchema: [
        { AttributeName: "agentID", KeyType: "HASH" },  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "agentID", AttributeType: "S" },
        { AttributeName: "agentKey", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    },
    GlobalSecondaryIndexes: [
        {
            IndexName: "key2AgentID",
            KeySchema: [
                { AttributeName: "agentKey", KeyType: "HASH" } // partition key
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

function agentIDKeyMapTable() {
}

agentIDKeyMapTable.prototype.createTable = function () {
    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created public service table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

agentIDKeyMapTable.prototype.deleteTable = function () {
    var params = {
        TableName: "AgentIDKeyMap"
    };
    dynamodb.deleteTable(params, function (err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports = agentIDKeyMapTable;