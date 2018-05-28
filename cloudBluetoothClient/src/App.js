import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';
import Devices from './Devices';
import { GoogleLogin } from 'react-google-login';
import { GoogleLogout } from 'react-google-login';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { agents: {}, agentIDs:[], error: '', userName : '', key : '', id_token: ''};
  }

  componentDidMount() {
    //this.fetchDeviceInfo();
  }

  render() {
    var agentList = this.state.agentIDs.map((agentID) => {
      var devices = <Devices deviceList = {this.state.agents[agentID]}/>;
      return (<div className = "agent">
         Agent ID: {agentID}
         {devices}
       </div>);
    });

    var login = <div/>;
    var logout = <div/>;
    if (this.state.userName == '') {
      login = <GoogleLogin
        clientId = "323138957375-8v8rbrk83slomrclgnhaemoc939mpkip.apps.googleusercontent.com"
        buttonText = "Login"
        onSuccess = {this.onSignIn.bind(this)}
        onFailure = {this.onSignInFail.bind(this)}
      />
    } else {
      login = this.state.userName;
      logout = <GoogleLogout
        buttonText = "Logout"
        onLogoutSuccess = {this.onSignOut.bind(this)}
      />
    }

    return (
      <div className = "App">
        <div className = "App-header">
          <div className = "middle">
            <div className = "headerTitle">cloud bluetooth</div>
            {login}
            {logout}
          </div>
        </div>
        <div className = "error">{this.state.error}</div>
        <div className = "mainDiv">
          <input type = "text" onChange = {this.onchange.bind(this)} />
          <button type = "button" onClick = {this.onUploadClick.bind(this)}>UploadKey</button>
          <div>{agentList}</div>
        </div>
        <div className = "author">
          Developed by <a href = "mailto:michellewx16@gmail.com">Wei Xu</a> 
        </div>
      </div>
    );
  }

  onchange(event) {
    this.setState({ key: event.target.value });
  }

  onUploadClick(event) {
    //var endpoint = "/addKey";
    var endpoint = "http://localhost:4000/addKey";
    var component = this;
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Token': this.state.id_token,
      },
      body: JSON.stringify({
        agentKey: this.state.key
      })
    }).then(function (response) {
      component.fetchDeviceInfo();
    }).catch(function (ex) {
      console.log('failed', ex);
    })
  }

  fetchDeviceInfo() {
    //var endpoint = "/getDevices";
    var endpoint = "http://localhost:4000/getDevices"

    var component = this;
    fetch(endpoint, {
      method: 'GET',
      headers: {
        'Token': this.state.id_token,
      },
    }).then(function (response) {
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

  validateAuth(id_token, name) {
    //var endpoint = "/validateToken"
    var endpoint = "http://localhost:4000/validateToken"
    var component = this;
    fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Token': id_token,
      },
    }).then( function(json) {
      component.setState({ userName: name, id_token: id_token});
      component.fetchDeviceInfo();
    });
  }

  onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var id_token = googleUser.getAuthResponse().id_token;
    var name = profile.getName();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    this.validateAuth(id_token, name);
  }

  onSignInFail(){
    this.setState({ userName: '' });
  }

  onSignOut() {
    this.setState({userName : ''});
  }

  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
}

export default App;