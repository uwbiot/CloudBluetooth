import React, { Component } from 'react';
import ReadData from './ReadData';
import './Service.css';
import WriteData from './WriteData';
import NotifyData from './NotifyData';

class Service extends Component {
    constructor(props) {
        super(props);
        this.state = { services: props.services, error: '', input: ''};
    }

    render() {
        var serviceList = this.state.services.map((charas) => {
            var read = <ReadData uuid = {charas.uuid} macAddress = {this.props.macAddress} agentID = {this.props.agentID}/>;
            var write = <WriteData uuid = {charas.uuid} macAddress = {this.props.macAddress} agentID = {this.props.agentID}/>;
            var enableNotification = <NotifyData uuid = {charas.uuid} macAddress = {this.props.macAddress} agentID = {this.props.agentID}/>;
            var name = charas.name ? charas.name : charas.uuid;
            return (
            <div className = 'chars'  name = {charas.uuid} tooltip = "read">
                {name}
                {write}
                {read}
                {enableNotification}
            </div>);
        });
        return (
            <div>{serviceList}</div>
        );
    }
}

export default Service;