import React, { Component } from 'react';

class ReadData extends Component {
    constructor(props) {
        super(props);
        this.state = { data: '', error: '' };
    }

    render() {
        return(<div>
            <button type="button" onClick = {this.fetchData.bind(this)}>Read</button>
            {this.state.data}
            </div>);
    }

    fetchData() {
        //var endpoint = "/read";
        var endpoint = "http://localhost:4000/read";
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
        }).then(function (response) {
            return response.json();
            }).then(function (json) {
                if (json) {
                    component.setState({ data: json.value });
                } else {
                    component.setState({ error: "The response is invalid" });
                }
            }).catch(function (ex) {
                console.log('parsing failed', ex);
            })
    }
}

export default ReadData;