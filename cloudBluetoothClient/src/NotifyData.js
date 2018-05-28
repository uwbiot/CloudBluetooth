import React, { Component } from 'react';
import socketIOClient from 'socket.io-client'
import './NotifyData.css'
var LineChart = require('react-chartjs').Line;
var socket;
class NotifyData extends Component {
    constructor(props) {
        super(props);
        this.state = { luxometer: [], labels:[], error: '', isNotificationEnabled: false };
    }

    render() {
        var text;
        if (this.state.isNotificationEnabled) {
            text = 'DisableNotify';
        } else {
            text = 'EnableNotify';
        }
        var lineChart = <div />;
        if (this.state.isNotificationEnabled && this.state.luxometer.length > 0) {
            var chartData = {
                labels: this.state.labels,
                datasets: [
                    {
                        data: this.state.luxometer,
                        fillColor: 'rgba(0,100,0,0.2)',
                        label: 'light',
                        pointColor: "rgba(0,100,0,1)",
                        pointHighlightFill: '#fff',
                        pointHighlightStroke: 'rgba(0,100,0,1)',
                        pointStrokeColor: '#fff',
                        strokeColor: 'rgba(0,100,0,1)'
                    }
                ]
            };
            var chartOptions = {};
            lineChart = <LineChart data={chartData} options={chartOptions} width="300" height="100" />;
        }
        return (<div>
            <button type="button" onClick={this.onNotificationClick.bind(this)}>{text}</button>
            {lineChart}
        </div>);
    }

    onNotificationClick() {
        if(this.state.isNotificationEnabled) {
            this.disableNotify();
        } else {
            this.sendNotify();
        }
    }


    startSocketConnection() {
        // const socket = socketIOClient();
        var component = this;
        socket = socketIOClient("http://localhost:4000/");
        socket.on('notifyMessage', (value) => {
            var lux = this.state.luxometer;
            var label = this.state.labels;

            if (lux.length < 20) {
                lux.push(value);
                label.push('');
            } else {
                lux.shift();
                lux.push(value);
            }
           component.setState({ luxometer: lux, labels: label, isNotificationEnabled: true });
        })
        var uuidMacAddress = this.props.uuid + this.props.macAddress;
        socket.emit('uuidMacAddress', uuidMacAddress);

        // test
       // this.setState({ luxometer: [65, 59, 80, 81, 56, 55, 40], labels: ['', '', '', '', '', '', ''] });
    }

    disableNotify() {
        this.setState({ luxometer: [], labels: [], isNotificationEnabled: false});
        var uuidMacAddress = this.props.uuid + this.props.macAddress;
        if (socket) {
            socket.emit('disableNotify', uuidMacAddress);
        }
    }

    sendNotify() {
        //var endpoint = "/notify";
        this.startSocketConnection();
        var endpoint = "http://localhost:4000/notify";
        var component = this;
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chara: this.props.uuid,
                macAddress: this.props.macAddress,
                agentID: this.props.agentID
            })
        }).catch(function (ex) {
            console.log('parsing failed', ex);
        })
    }

    
}

export default NotifyData;