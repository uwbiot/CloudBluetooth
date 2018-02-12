import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';
import DeviceDetails from './DeviceDetails';
//import RecentQuery from './RecentQuery';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { devices: [], error: '' };
  }

  componentDidMount() {
    this.fetchDeviceInfo();
  }

  render() {
    var deviceList = this.state.devices.map((device) => {
       var deviceDetail = <div/>;
       if(device.isConnect) {
         deviceDetail = <DeviceDetails macAddress = {device.macAddress} agentID = {device.agentID}/>;
       }
       return (<div>
          {device.name}
        <button type = "button" onClick = {this.onDeviceClick.bind(this)} name = {device.macAddress}>Connect</button>
         {deviceDetail}
       </div>);
    });

    return (
      <div className="App">
        <div className="App-header">
          <div className="middle">
            <div className="headerTitle">cloud bluetooth</div>
         </div>
        </div>
        <div className="error">{this.state.error}</div>
        <div className="mainDiv">
          {deviceList}
        </div>
        <div className="author">
          Developed by <a href="mailto:michellewx16@gmail.com">Wei Xu</a> 
        </div>
      </div>
    );
  }

  fetchDeviceInfo() {
    // var endpoint = "/devices";
    var endpoint = "http://localhost:4000/devices"

    var component = this;
    fetch(endpoint)
      .then(function (response) {
        return response.json()
      }).then(function (json) {
        if (json) {
          var deviceNames = [];
          json.forEach(function(device) {
            deviceNames.push({ 
              name: device.deviceName, 
              isConnect: false, 
              macAddress: device.macAddress, 
              agentID: device.agentID});
          }, this);
          component.setState({ devices: deviceNames });
        } else {
         component.setState({ error: "The response is invalid" });
        }
      }).catch(function (ex) {
        console.log('parsing failed', ex)
      })
  }

  onDeviceClick(event) {
    var macAddress = event.target.getAttribute('name');
    var newDevices = this.state.devices.slice();
    newDevices.map((device) => {
      if(device.macAddress === macAddress) {
        device.isConnect = !device.isConnect;
      }
    });
    this.setState({devices: newDevices});
    console.log('clicked');
  }
}

export default App;
