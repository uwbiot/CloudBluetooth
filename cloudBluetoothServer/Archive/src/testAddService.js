const DynamoDBClient = require('./DynamoDBClient.js');

const CreatePublicTable = require('./PublicServiceMapTableCreate.js');
const CreateUserDefineTable = require('./UserDefineServiceMapTableCreate.js');

const ServiceNameLookup = require('./ServiceNameLookup.js');

var serviceNameLookup = new ServiceNameLookup();


var dynamoDBClient = new DynamoDBClient();
var createPublicTable = new CreatePublicTable();
var createUserDefineTable = new CreateUserDefineTable();

//create public table
//createPublicTable.createTable();
//createUserDefineTable.createTable();
serviceNameLookup.getAllServices();

setTimeout(() => {
    console.log("look up:");
    console.log(serviceNameLookup.lookup("0000180d-0000-1000-8000-00805f9b34fb"));

}, 2000);


// public services


// Sample Characteristics. 
dynamoDBClient.putPublicService("00002a37-0000-1000-8000-00805f9b34fb", "Heart Rate Measurement");
dynamoDBClient.putPublicService("00002a29-0000-1000-8000-00805f9b34fb", "Manufacturer Name String");

// GATT Services 
dynamoDBClient.putPublicService("00001800-0000-1000-8000-00805f9b34fb", "GenericAccess");
dynamoDBClient.putPublicService("00001801-0000-1000-8000-00805f9b34fb", "GenericAttribute");

// GATT Declarations 
dynamoDBClient.putPublicService("00002800-0000-1000-8000-00805f9b34fb", "Primary Service");
dynamoDBClient.putPublicService("00002801-0000-1000-8000-00805f9b34fb", "Secondary Service");
dynamoDBClient.putPublicService("00002802-0000-1000-8000-00805f9b34fb", "Include");
dynamoDBClient.putPublicService("00002803-0000-1000-8000-00805f9b34fb", "Characteristic"); 

// GATT Descriptors 
dynamoDBClient.putPublicService("00002900-0000-1000-8000-00805f9b34fb", "Characteristic Extended Properties");
dynamoDBClient.putPublicService("00002901-0000-1000-8000-00805f9b34fb", "Characteristic User Description");
dynamoDBClient.putPublicService("00002902-0000-1000-8000-00805f9b34fb", "Client Characteristic Configuration");
dynamoDBClient.putPublicService("00002903-0000-1000-8000-00805f9b34fb", "Server Characteristic Configuration");
dynamoDBClient.putPublicService("00002904-0000-1000-8000-00805f9b34fb", "Characteristic Presentation Format");
dynamoDBClient.putPublicService("00002905-0000-1000-8000-00805f9b34fb", "Characteristic Aggregate Format");
dynamoDBClient.putPublicService("00002906-0000-1000-8000-00805f9b34fb", "Valid Range");
dynamoDBClient.putPublicService("00002907-0000-1000-8000-00805f9b34fb", "External Report Reference Descriptor");
dynamoDBClient.putPublicService("00002908-0000-1000-8000-00805f9b34fb", "Report Reference Descriptor"); 

// GATT Characteristics 
dynamoDBClient.putPublicService("00002a00-0000-1000-8000-00805f9b34fb", "Device Name");
dynamoDBClient.putPublicService("00002a01-0000-1000-8000-00805f9b34fb", "Appearance");
dynamoDBClient.putPublicService("00002a02-0000-1000-8000-00805f9b34fb", "Peripheral Privacy Flag");
dynamoDBClient.putPublicService("00002a03-0000-1000-8000-00805f9b34fb", "Reconnection Address");
dynamoDBClient.putPublicService("00002a04-0000-1000-8000-00805f9b34fb", "PPCP");
dynamoDBClient.putPublicService("00002a05-0000-1000-8000-00805f9b34fb", "Service Changed"); 

// GATT Service UUIDs 
dynamoDBClient.putPublicService("00001802-0000-1000-8000-00805f9b34fb", "Immediate Alert");
dynamoDBClient.putPublicService("00001803-0000-1000-8000-00805f9b34fb", "Link Loss");
dynamoDBClient.putPublicService("00001804-0000-1000-8000-00805f9b34fb", "Tx Power");
dynamoDBClient.putPublicService("00001805-0000-1000-8000-00805f9b34fb", "Current Time Service");
dynamoDBClient.putPublicService("00001806-0000-1000-8000-00805f9b34fb", "Reference Time Update Service");
dynamoDBClient.putPublicService("00001807-0000-1000-8000-00805f9b34fb", "Next DST Change Service");
dynamoDBClient.putPublicService("00001808-0000-1000-8000-00805f9b34fb", "Glucose");
dynamoDBClient.putPublicService("00001809-0000-1000-8000-00805f9b34fb", "Health Thermometer");
dynamoDBClient.putPublicService("0000180a-0000-1000-8000-00805f9b34fb", "Device Information");
dynamoDBClient.putPublicService("0000180b-0000-1000-8000-00805f9b34fb", "Network Availability");
dynamoDBClient.putPublicService("0000180d-0000-1000-8000-00805f9b34fb", "Heart Rate");
dynamoDBClient.putPublicService("0000180e-0000-1000-8000-00805f9b34fb", "Phone Alert Status Service");
dynamoDBClient.putPublicService("0000180f-0000-1000-8000-00805f9b34fb", "Battery Service");
dynamoDBClient.putPublicService("00001810-0000-1000-8000-00805f9b34fb", "Blood Pressure");
dynamoDBClient.putPublicService("00001811-0000-1000-8000-00805f9b34fb", "Alert Notification Service");
dynamoDBClient.putPublicService("00001812-0000-1000-8000-00805f9b34fb", "Human Interface Device");
dynamoDBClient.putPublicService("00001813-0000-1000-8000-00805f9b34fb", "Scan Parameters"); 
dynamoDBClient.putPublicService("00001814-0000-1000-8000-00805f9b34fb", "Running Speed and Cadence");
dynamoDBClient.putPublicService("00001816-0000-1000-8000-00805f9b34fb", "Cycling Speed and Cadence");
dynamoDBClient.putPublicService("00001818-0000-1000-8000-00805f9b34fb", "Cycling Power");
dynamoDBClient.putPublicService("00001819-0000-1000-8000-00805f9b34fb", "Location and Navigation");

// GATT Characteristic UUIDs 
dynamoDBClient.putPublicService("00002a06-0000-1000-8000-00805f9b34fb", "Alert Level");
dynamoDBClient.putPublicService("00002a07-0000-1000-8000-00805f9b34fb", "Tx Power Level");
dynamoDBClient.putPublicService("00002a08-0000-1000-8000-00805f9b34fb", "Date Time");
dynamoDBClient.putPublicService("00002a09-0000-1000-8000-00805f9b34fb", "Day of Week");
dynamoDBClient.putPublicService("00002a0a-0000-1000-8000-00805f9b34fb", "Day Date Time");
dynamoDBClient.putPublicService("00002a0c-0000-1000-8000-00805f9b34fb", "Exact Time 256");
dynamoDBClient.putPublicService("00002a0d-0000-1000-8000-00805f9b34fb", "DST Offset");
dynamoDBClient.putPublicService("00002a0e-0000-1000-8000-00805f9b34fb", "Time Zone");
dynamoDBClient.putPublicService("00002a0f-0000-1000-8000-00805f9b34fb", "Local Time Information");
dynamoDBClient.putPublicService("00002a11-0000-1000-8000-00805f9b34fb", "Time with DST");
dynamoDBClient.putPublicService("00002a12-0000-1000-8000-00805f9b34fb", "Time Accuracy");
dynamoDBClient.putPublicService("00002a13-0000-1000-8000-00805f9b34fb", "Time Source"); 
dynamoDBClient.putPublicService("00002a14-0000-1000-8000-00805f9b34fb", "Reference Time Information");
dynamoDBClient.putPublicService("00002a16-0000-1000-8000-00805f9b34fb", "Time Update Control Point");
dynamoDBClient.putPublicService("00002a17-0000-1000-8000-00805f9b34fb", "Time Update State");
dynamoDBClient.putPublicService("00002a18-0000-1000-8000-00805f9b34fb", "Glucose Measurement");
dynamoDBClient.putPublicService("00002a19-0000-1000-8000-00805f9b34fb", "Battery Level");
dynamoDBClient.putPublicService("00002a1c-0000-1000-8000-00805f9b34fb", "Temperature Measurement");
dynamoDBClient.putPublicService("00002a1d-0000-1000-8000-00805f9b34fb", "Temperature Type");
dynamoDBClient.putPublicService("00002a1e-0000-1000-8000-00805f9b34fb", "Intermediate Temperature");
dynamoDBClient.putPublicService("00002a21-0000-1000-8000-00805f9b34fb", "Measurement Interval");
dynamoDBClient.putPublicService("00002a22-0000-1000-8000-00805f9b34fb", "Boot Keyboard Input Report");
dynamoDBClient.putPublicService("00002a23-0000-1000-8000-00805f9b34fb", "System ID");
dynamoDBClient.putPublicService("00002a24-0000-1000-8000-00805f9b34fb", "Model Number String");
dynamoDBClient.putPublicService("00002a25-0000-1000-8000-00805f9b34fb", "Serial Number String");
dynamoDBClient.putPublicService("00002a26-0000-1000-8000-00805f9b34fb", "Firmware Revision String");
dynamoDBClient.putPublicService("00002a27-0000-1000-8000-00805f9b34fb", "Hardware Revision String");
dynamoDBClient.putPublicService("00002a28-0000-1000-8000-00805f9b34fb", "Software Revision String");
dynamoDBClient.putPublicService("00002a29-0000-1000-8000-00805f9b34fb", "Manufacturer Name String");
dynamoDBClient.putPublicService("00002a2a-0000-1000-8000-00805f9b34fb", "IEEE 11073-20601 Regulatory Certification Data List"); 
dynamoDBClient.putPublicService("00002a2b-0000-1000-8000-00805f9b34fb", "Current Time");
dynamoDBClient.putPublicService("00002a31-0000-1000-8000-00805f9b34fb", "Scan Refresh");
dynamoDBClient.putPublicService("00002a32-0000-1000-8000-00805f9b34fb", "Boot Keyboard Output Report");
dynamoDBClient.putPublicService("00002a33-0000-1000-8000-00805f9b34fb", "Boot Mouse Input Report");
dynamoDBClient.putPublicService("00002a34-0000-1000-8000-00805f9b34fb", "Glucose Measurement Context");
dynamoDBClient.putPublicService("00002a35-0000-1000-8000-00805f9b34fb", "Blood Pressure Measurement");
dynamoDBClient.putPublicService("00002a36-0000-1000-8000-00805f9b34fb", "Intermediate Cuff Pressure");
dynamoDBClient.putPublicService("00002a37-0000-1000-8000-00805f9b34fb", "Heart Rate Measurement");
dynamoDBClient.putPublicService("00002a38-0000-1000-8000-00805f9b34fb", "Body Sensor Location");
dynamoDBClient.putPublicService("00002a39-0000-1000-8000-00805f9b34fb", "Heart Rate Control Point");
dynamoDBClient.putPublicService("00002a3e-0000-1000-8000-00805f9b34fb", "Network Availability");
dynamoDBClient.putPublicService("00002a3f-0000-1000-8000-00805f9b34fb", "Alert Status");
dynamoDBClient.putPublicService("00002a40-0000-1000-8000-00805f9b34fb", "Ringer Control Point");
dynamoDBClient.putPublicService("00002a41-0000-1000-8000-00805f9b34fb", "Ringer Setting");
dynamoDBClient.putPublicService("00002a42-0000-1000-8000-00805f9b34fb", "Alert Category ID Bit Mask");
dynamoDBClient.putPublicService("00002a43-0000-1000-8000-00805f9b34fb", "Alert Category ID"); 
dynamoDBClient.putPublicService("00002a44-0000-1000-8000-00805f9b34fb", "Alert Notification Control Point");
dynamoDBClient.putPublicService("00002a45-0000-1000-8000-00805f9b34fb", "Unread Alert Status");
dynamoDBClient.putPublicService("00002a46-0000-1000-8000-00805f9b34fb", "New Alert");
dynamoDBClient.putPublicService("00002a47-0000-1000-8000-00805f9b34fb", "Supported New Alert Category");
dynamoDBClient.putPublicService("00002a48-0000-1000-8000-00805f9b34fb", "Supported Unread Alert Category");
dynamoDBClient.putPublicService("00002a49-0000-1000-8000-00805f9b34fb", "Blood Pressure Feature");
dynamoDBClient.putPublicService("00002a4a-0000-1000-8000-00805f9b34fb", "HID Information");
dynamoDBClient.putPublicService("00002a4b-0000-1000-8000-00805f9b34fb", "Report Map");
dynamoDBClient.putPublicService("00002a4c-0000-1000-8000-00805f9b34fb", "HID Control Point");
dynamoDBClient.putPublicService("00002a4d-0000-1000-8000-00805f9b34fb", "Report");
dynamoDBClient.putPublicService("00002a4e-0000-1000-8000-00805f9b34fb", "Protocol Mode");
dynamoDBClient.putPublicService("00002a4f-0000-1000-8000-00805f9b34fb", "Scan Interval Window");
dynamoDBClient.putPublicService("00002a50-0000-1000-8000-00805f9b34fb", "PnP ID");
dynamoDBClient.putPublicService("00002a51-0000-1000-8000-00805f9b34fb", "Glucose Feature");
dynamoDBClient.putPublicService("00002a52-0000-1000-8000-00805f9b34fb", "Record Access Control Point");
dynamoDBClient.putPublicService("00002a53-0000-1000-8000-00805f9b34fb", "RSC Measurement"); 
dynamoDBClient.putPublicService("00002a54-0000-1000-8000-00805f9b34fb", "RSC Feature");
dynamoDBClient.putPublicService("00002a55-0000-1000-8000-00805f9b34fb", "SC Control Point");
dynamoDBClient.putPublicService("00002a5b-0000-1000-8000-00805f9b34fb", "CSC Measurement");
dynamoDBClient.putPublicService("00002a5c-0000-1000-8000-00805f9b34fb", "CSC Feature");
dynamoDBClient.putPublicService("00002a5d-0000-1000-8000-00805f9b34fb", "Sensor Location");
dynamoDBClient.putPublicService("00002a63-0000-1000-8000-00805f9b34fb", "Cycling Power Measurement");
dynamoDBClient.putPublicService("00002a64-0000-1000-8000-00805f9b34fb", "Cycling Power Vector");
dynamoDBClient.putPublicService("00002a65-0000-1000-8000-00805f9b34fb", "Cycling Power Feature");
dynamoDBClient.putPublicService("00002a66-0000-1000-8000-00805f9b34fb", "Cycling Power Control Point");
dynamoDBClient.putPublicService("00002a67-0000-1000-8000-00805f9b34fb", "Location and Speed");
dynamoDBClient.putPublicService("00002a68-0000-1000-8000-00805f9b34fb", "Navigation");
dynamoDBClient.putPublicService("00002a69-0000-1000-8000-00805f9b34fb", "Position Quality");
dynamoDBClient.putPublicService("00002a6a-0000-1000-8000-00805f9b34fb", "LN Feature");
dynamoDBClient.putPublicService("00002a6b-0000-1000-8000-00805f9b34fb", "LN Control Point");

// user define services
dynamoDBClient.putUserDefineService("f000aa00-0451-4000-b000-000000000000", "Temperature Service");
dynamoDBClient.putUserDefineService("f000aa01-0451-4000-b000-000000000000", "Temperature Data");
dynamoDBClient.putUserDefineService("f000aa02-0451-4000-b000-000000000000", "Temperature Configuration");
dynamoDBClient.putUserDefineService("f000aa03-0451-4000-b000-000000000000", "Temperature Period");
dynamoDBClient.putUserDefineService("f000aa10-0451-4000-b000-000000000000", "Accelerometer Service");
dynamoDBClient.putUserDefineService("f000aa11-0451-4000-b000-000000000000", "Accelerometer Data");
dynamoDBClient.putUserDefineService("f000aa12-0451-4000-b000-000000000000", "Accelerometer Configuration");
dynamoDBClient.putUserDefineService("f000aa13-0451-4000-b000-000000000000", "Accelerometer Period");
dynamoDBClient.putUserDefineService("f000aa20-0451-4000-b000-000000000000", "Humidity Service");
dynamoDBClient.putUserDefineService("f000aa21-0451-4000-b000-000000000000", "Humidity Data");
dynamoDBClient.putUserDefineService("f000aa22-0451-4000-b000-000000000000", "Humidity Configuration");
dynamoDBClient.putUserDefineService("f000aa23-0451-4000-b000-000000000000", "Humidity Service");
dynamoDBClient.putUserDefineService("f000aa30-0451-4000-b000-000000000000", "Magnetometer Service");
dynamoDBClient.putUserDefineService("f000aa31-0451-4000-b000-000000000000", "Magnetometer Data");
dynamoDBClient.putUserDefineService("f000aa32-0451-4000-b000-000000000000", "Magnetometer Configuration");
dynamoDBClient.putUserDefineService("f000aa33-0451-4000-b000-000000000000", "Magnetometer Period");
dynamoDBClient.putUserDefineService("f000aa70-0451-4000-b000-000000000000", "Luxometer Service");
dynamoDBClient.putUserDefineService("f000aa71-0451-4000-b000-000000000000", "Luxometer Data");
dynamoDBClient.putUserDefineService("f000aa72-0451-4000-b000-000000000000", "Luxometer Configuration");
dynamoDBClient.putUserDefineService("f000aa73-0451-4000-b000-000000000000", "Luxometer Period");
dynamoDBClient.putUserDefineService("f000aa40-0451-4000-b000-000000000000", "Barometer Service");
dynamoDBClient.putUserDefineService("f000aa41-0451-4000-b000-000000000000", "Barometer Data");
dynamoDBClient.putUserDefineService("f000aa42-0451-4000-b000-000000000000", "Barometer Configuration");
dynamoDBClient.putUserDefineService("f000aa43-0451-4000-b000-000000000000", "Barometer Calibration");
dynamoDBClient.putUserDefineService("f000aa44-0451-4000-b000-000000000000", "Barometer Period");
dynamoDBClient.putUserDefineService("f000aa50-0451-4000-b000-000000000000", "Gyroscope Service");
dynamoDBClient.putUserDefineService("f000aa51-0451-4000-b000-000000000000", "Gyroscope Data");
dynamoDBClient.putUserDefineService("f000aa52-0451-4000-b000-000000000000", "Gyroscope Configuration");
dynamoDBClient.putUserDefineService("f000aa53-0451-4000-b000-000000000000", "Gyroscope Period");
dynamoDBClient.putUserDefineService("f000aa80-0451-4000-b000-000000000000", "Movement Service");
dynamoDBClient.putUserDefineService("f000aa81-0451-4000-b000-000000000000", "Movement Data");
dynamoDBClient.putUserDefineService("f000aa82-0451-4000-b000-000000000000", "Movement Configuration");
dynamoDBClient.putUserDefineService("f000aa83-0451-4000-b000-000000000000", "Movement Period");
dynamoDBClient.putUserDefineService("f000aa64-0451-4000-b000-000000000000", "Test Service");
dynamoDBClient.putUserDefineService("f000aa65-0451-4000-b000-000000000000", "Test Data");
dynamoDBClient.putUserDefineService("0000ffe0-0000-1000-8000-00805f9b34fb", "Key Service");
dynamoDBClient.putUserDefineService("0000ffe1-0000-1000-8000-00805f9b34fb", "Key Data");
