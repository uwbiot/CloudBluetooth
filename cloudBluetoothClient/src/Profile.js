import React, { Component } from 'react';
import ReadData from './ReadData';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { profiles: props.profiles, error: ''};
    }

    render() {
        var profileList = this.state.profiles.map((profile) => {
            var data = <div/>;
            if (profile.isReadClicked) {
                data = <ReadData uuid = {profile.uuid}/>;
            }
            var name = profile.name ? profile.name : profile.uuid;
            return (<div onClick = {this.onCharasClick.bind(this)} name = {profile.uuid}>
                {name}
                <form onsubmit = "this.writeFunction(profile)">
                <input id = "data" type = "text" size = "20"/><input type = "submit"/>
                </form>
                {data}
            </div>);
        });
        return (
            <div>{profileList}</div>
        );
    }

    writeFunction(profile) {
        var bytes = document.getElementById("data");
        var endpoint = "http://localhost:4000/write";
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chara: this.profile.uuid,
                bytes: bytes,
            })
        })
    }
    
    onCharasClick(event) {
        var chara = event.target.getAttribute('name');
        var newProfiles = this.state.profiles.slice();
        newProfiles.map((profile) => {
            if (profile.uuid === chara) {
                profile.isReadClicked = true;
            }
        });
        this.setState({ profiles: newProfiles });
        console.log('clicked');
    }
}

export default Profile;