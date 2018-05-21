var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "UserKeysList",
    KeySchema: [
        { AttributeName: "userEmailAddress", KeyType: "HASH" }  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "userEmailAddress", AttributeType: "S" },
        //{ AttributeName: "keysList", AttributeType: "L" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

var paramsDelete = {
    TableName: "UserKeysList"
};

function userKeysListTable() {
}

userKeysListTable.prototype.createTable = function () {
    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created user keysList table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

userKeysListTable.prototype.deleteTable = function () {
    dynamodb.deleteTable(paramsDelete, function (err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}
module.exports = userKeysListTable;