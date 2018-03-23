import React, { Component } from 'react';
import DeviceDetails from './DeviceDetails';


class Devices extends Component {
    constructor(props) {
        super(props);
        this.state = { devices: this.props.deviceList, error: '' };
    }

    render() {
        var deviceList = this.state.devices.map((device) => {
            var deviceDetail = <div />;
            var text = "connect";
            if (device.isConnect) {
                deviceDetail = <DeviceDetails macAddress={device.macAddress} agentID={device.agentID} />;
                text = "disconnect";
            }
            return (<div>
                {device.name}
                <button type="button" onClick={this.onDeviceClick.bind(this)} id={device.agentID} name={device.macAddress}>{text}</button>
                {deviceDetail}
            </div>);
        });

        return (
            <div>{deviceList}</div>
        );
    }

    onDeviceClick(event) {
        var macAddress = event.target.getAttribute('name');
        var agentID = event.target.getAttribute('id');
        console.log("macAddress: " + macAddress);
        console.log("agentID: " + agentID);
        var newDevices = this.state.devices.slice();
        newDevices.map((device) => {
            if (device.macAddress === macAddress && device.agentID === agentID) {
                device.isConnect = !device.isConnect;
                if (!device.isConnect) {
                    this.disconnectDevice(macAddress, agentID);
                }
            }
        });
        this.setState({ devices: newDevices });
        console.log('clicked');
    }

    disconnectDevice(macAddress, agentID) {
        //var endpoint = "/disconnect";
        var endpoint = "http://localhost:4000/disconnect";
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                agentID: agentID,
                macAddress: macAddress,
            })
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        })
    }
}

export default Devices;
