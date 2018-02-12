import React, { Component } from 'react';
import Profile from './Profile';

class DeviceDetails extends Component {
    constructor(props) {
        super(props);
        this.state = { deviceDetails: [], error: '' };
    }

    componentDidMount() {
        this.fetchDeviceDetailInfo();
    }

    render() {
        var deviceDetailList = this.state.deviceDetails.map((deviceDetail) => {
            var profiles = <div/>;
            if (deviceDetail.isClicked) {
                profiles = <Profile profiles = {deviceDetail.charas}/>
            }
            var deviceName = deviceDetail.name ? deviceDetail.name : deviceDetail.uuid;
            return (
                <div>
                    <div onClick={this.onServiceClick.bind(this)} name={deviceDetail.uuid} >service: {deviceName}</div>
                    charactics: {profiles}
                </div>
            );
        });

        return (
            <div>
                Connecting to {this.props.macAddress}
                <div>{deviceDetailList}</div>
            </div>
            
        );
    }

    onServiceClick(event) {
        var uuid = event.target.getAttribute('name');
        var newDeviceDetails = this.state.deviceDetails.slice();
        newDeviceDetails.map((deviceDetail) => {
            if (deviceDetail.uuid === uuid) {
                deviceDetail.isClicked = !deviceDetail.isClicked;
            }
        });
        this.setState({ deviceDetails: newDeviceDetails });
        console.log('clicked');
    }

    fetchDeviceDetailInfo() {
        var endpoint = "http://localhost:4000/services";
        var component = this;
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                agentID: this.props.agentID,
                macAddress: this.props.macAddress,
            })
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            if (json) {
                var deviceDetails = [];
                json.forEach(function(device) {
                    deviceDetails.push({ 
                        uuid: device.uuid, 
                        name: device.name,
                        charas: device.charas,
                        isClicked: false
                    });}, this);
                component.setState({ deviceDetails: deviceDetails });
            } else {
                component.setState({ error: "The response is invalid" });
            }

        }).catch(function(ex) {
            console.log('parsing failed', ex)
        })
    }
}

export default DeviceDetails;