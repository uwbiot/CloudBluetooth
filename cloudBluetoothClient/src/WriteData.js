import React, { Component } from 'react';

class WriteData extends Component {
    constructor(props) {
        super(props);
        this.state = { uuid: props.uuid, error: '' , input:'', data : ''};
    }

    render() {
        return (
            <div>
                <input type = "text" onChange = {this.onchange.bind(this)} />
                <button type = "button" onClick = {this.onWriteClick.bind(this)}>Write</button>
                {this.state.data}
            </div>
        );
    }

    onchange(event) {
        this.setState({ input: event.target.value });
    }

    onWriteClick(event) {
        var endpoint = "/write";
        //var endpoint = "http://localhost:4000/write";
        var component = this;
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chara: this.state.uuid,
                bytes: this.state.input,
                macAddress: this.props.macAddress,
                agentID: this.props.agentID
            })
        }).then(function (response) {
            return response.json();
            }).then(function (json) {
                if (json) {
                    component.setState({ data: json.status });
                } else {
                    component.setState({ error: "The response is invalid" });
                }
            }).catch(function (ex) {
                console.log('parsing failed', ex);
            })
    }
}

export default WriteData;