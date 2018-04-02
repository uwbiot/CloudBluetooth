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
        { AttributeName: "macAddress", KeyType: "HASH" },  //Partition key
        { AttributeName: "agentID", KeyType: "RANGE"} //Sort key
    ],
    AttributeDefinitions: [       
        { AttributeName: "macAddress", AttributeType: "S" },
        { AttributeName: "agentID", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
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
module.exports = dynamodbCreateTable;

