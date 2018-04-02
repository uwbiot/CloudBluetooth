const DynamoDBClient = require('./DynamoDBClient.js');

var dynamoDBClient = new DynamoDBClient();
var dict = {};

function ServiceNameLookup() {

}

ServiceNameLookup.prototype.getAllServices = function() {
    dynamoDBClient.getAllPublicServices((items) => {
        items.forEach(element => {
            dict[element.serviceUUID] = element.serviceName;
        });
    });
    dynamoDBClient.getAllUserDefineServices((items) => {
        items.forEach(element => {
            dict[element.serviceUUID] = element.serviceName;
        });
    });
}

ServiceNameLookup.prototype.insert = function(uuid, name) {
    dict[uuid] = name;
}

ServiceNameLookup.prototype.lookup = function(uuid) {
    if(dict[uuid]) {
        return dict[uuid];
    }
    return undefined;
}

module.exports = ServiceNameLookup;