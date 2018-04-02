import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';
import Devices from './Devices';
//import RecentQuery from './RecentQuery';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { agents: {}, agentIDs:[], error: '' };
  }

  componentDidMount() {
    this.fetchDeviceInfo();
  }

  render() {
    var agentList = this.state.agentIDs.map((agentID) => {
      var devices = <Devices deviceList = {this.state.agents[agentID]}/>;
      return (<div className="agent">
         Agent ID: {agentID}
         {devices}
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
          <div>{agentList}</div>
        </div>
        <div className="author">
          Developed by <a href="mailto:michellewx16@gmail.com">Wei Xu</a> 
        </div>
      </div>
    );
  }

  fetchDeviceInfo() {
    //var endpoint = "/devices";
    var endpoint = "http://localhost:4000/getDevices"

    var component = this;
    fetch(endpoint)
      .then(function (response) {
        return response.json()
      }).then(function (json) {
        if (json) {
          var agentToDeviceMapping = {};
          var agentIDs = [];
          json.forEach(function(device) {
            var agentID = device.agentID;
            if (!agentToDeviceMapping[agentID]) {
              agentToDeviceMapping[agentID] = [];
              agentIDs.push(agentID);
            }
            agentToDeviceMapping[agentID].push({
                name: device.deviceName,
                isConnect: false,
                macAddress: device.macAddress,
                agentID: device.agentID
              });
          }, this);
          component.setState({ agents: agentToDeviceMapping , agentIDs: agentIDs});
        } else {
         component.setState({ error: "The response is invalid" });
        }
      }).catch(function (ex) {
        console.log('parsing failed', ex)
      })
  }

}

export default App;
