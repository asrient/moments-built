import $ from "jquery";
import React, { Component } from "react";
import "./addPeer.css";
import { Icon, Switcher, BarButton, Loading } from "./global.js";


function code(n = 10) {
    return crypto.randomBytes(n).toString('hex');
}


class Peer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
    }
    getButton() {
        if (this.props.isAdded) {
            var color = '#007cff';//blue
            if (this.props.sessionId != null) {
                if (this.props.sessionId.split('.')[0] == 'local') {
                    color = '#A200FF';//purple
                }
            }
            else {
                color = '#8e8e93';//grey
            }
            return (<div className="pr_actionButton" style={{ backgroundColor: color }} onClick={() => {
                if (this.props.uid != undefined && this.props.host != undefined) {
                    var peerId = this.props.uid + ':' + this.props.host
                    window.actions('OPEN_CHAT', peerId);
                }
            }}>Added</div>)
        }
        else {
            if (this.props.sessionId != null) {
                var color = '#00c12f';//green
                if (this.props.sessionId.split('.')[0] == 'local') {
                    color = 'rgb(255, 195, 0)';//orange
                }
            }
            return (<div className="pr_actionButton" style={{ backgroundColor: color }} onClick={() => {
                if (this.props.uid != undefined && this.props.host != undefined && this.props.sessionId != undefined) {
                    var airId = this.props.uid + ':' + this.props.host + ':' + this.props.sessionId
                    window.actions('ADD_PEER', airId);
                }
            }}>Add</div>)
        }
    }
    render() {
        var icn = this.props.icon;
        if (icn == null || icn == 'default') {
            icn = 'assets://icons/SystemEntity_Computer.png';
        }
        return (<div className="pr" style={{ textAlign: 'left' }}>
            <div className="center"><Icon className="size-l" style={{ margin: '0px' }} src={icn} /></div>
            <div>
                <div className="ink-black base-regular size-xs">{this.props.username}</div>
                <div className="ink-dark base-light size-xs" style={{ fontSize: '0.8rem', display: 'flex' }}>
                    {this.props.devicename}
                </div>
            </div>
            <div className="center">{this.getButton()}</div>
        </div>)
    }
}

class Nearby extends React.Component {
    constructor(props) {
        super(props);
        this.state = { list: null, loading: true }
    }
    parseState = () => {
        window.state.getLocalPeers((list) => {
            this.state.list = list;
            this.state.loading = false;
            this.setState(this.state);
        })
    }
    componentWillUnmount = () => {
        this.unsub();
    }
    componentDidMount = () => {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    refresh() {
        this.state.loading = true;
        this.setState(this.state);
        console.log('refreshing..');
        this.parseState();
    }
    getList = () => {
        if (this.state.list == null||this.state.loading) {
            return (<div style={{ height: '6rem', width: '100%' }} className="center"><Loading /></div>)
        }
        else if (!this.state.list.length) {
            return (<div style={{ height: '6rem', width: '100%' }} className="center size-xs ink-dark">No nearby devices found</div>)
        }
        else {
            var html = [];
            html = this.state.list.map((peer) => {
                return (<Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid + peer.host + peer.sessionId}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isAdded={peer.isAdded} />)
            })
            return html;
        }
    }
    render() {
        return (<div id="nb">
            <div id="nb_head" className="ink-dark base-light">
                <div>NEARBY</div>
                <div className="ink-blue" onClick={()=>{this.refresh()}}>Refresh</div>
            </div>
            <div>
                {this.getList()}
            </div>
        </div>)
    }
}

class AddByCode extends React.Component {
    constructor(props) {
        super(props);
        this.state = { airId: '', showDoneButton: false, peers: {}, peer: null }
    }
    componentDidMount() {
    }
    done = () => {
        this.state.showDoneButton = false;
        this.state.peer = null;
        this.state.peers = {};
        this.setState(this.state);
        var qids = window.state.parseAirId(this.state.airId);
        var peerId = qids.uid + ':' + qids.host;
        var st = window.state.getState();
        if (st.sources[peerId] == undefined) {
            window.state.reveal(this.state.airId, (airId, info) => {
                var ids = window.state.parseAirId(airId);
                if (ids.uid == this.state.airId.split(':')[0] && ids.host == this.state.airId.split(':')[1]) {
                    this.state.peer = null;
                    this.state.peers[airId] = {
                        uid: ids.uid,
                        host: ids.host,
                        sessionId: ids.sessionId,
                        username: info.username,
                        devicename: info.devicename,
                        icon: info.icon,
                        isAdded: false
                    }
                    this.setState(this.state);
                }
                else {
                    console.error("REVEAL airId not same as the one looking for");
                }
            })
        }
        else {
            this.state.peer = {
                ...st.sources[peerId].info,
                sessionId: st.sources[peerId].sessionId,
                isAdded: true
            };
            this.setState(this.state);
        }
    }
    getList() {
        var html = [];
        if (this.state.peer != null) {
            var peer = this.state.peer;
            return (<div>
                <Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid + peer.host + peer.sessionId}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isAdded={true} />
            </div>)
        }
        else {
            Object.keys(this.state.peers).forEach((peerId) => {
                var peer = this.state.peers[peerId];
                html.push(<Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid + peer.host + peer.sessionId}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isAdded={false} />)
            })
            if (html.length) {
                return html;
            }
            else {
                return (<div></div>)
            }
        }
    }
    change = (event) => {
        this.state.peer = null;
        this.state.peers = {};
        this.state.airId = event.target.value.trim();
        var txt = this.state.airId;
        this.state.showDoneButton = false;
        if (txt.split('').includes(':')) {
            if (txt.split(':')[0].length && txt.split(':')[1].length) {
                this.state.showDoneButton = true;
            }
        }
        this.setState(this.state);
    }
    getDoneButton() {
        if (this.state.showDoneButton) {
            return (<div id="ac_doneHolder"><button onClick={this.done}>Search</button></div>)
        }
    }
    render() {
        return (<div id="ac">
            <div id="ac_head" className="ink-dark base-light">
                ADD CODE
            </div>
            <div className="center">
                <input placeholder="Air ID" type="text" className="wel_input" value={this.state.airId} onChange={this.change} />
            </div>
            {this.getDoneButton()}
            {this.getList()}
        </div>)
    }
}

class AddPeer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
    }
    showIds() {
        var ids = airPeer.getMyAirIds();
        return (<div className="ink-light size-xs base-light" style={{ textAlign: 'left', padding: '0.5rem', paddingTop:'1rem' }}>
            <div className="ink-light size-xs base-regular center">Share this code with others</div>
            <div><span className="ink-dark base-regular">WEB</span> &nbsp;&nbsp; <span className="text-selectable">{ids.global}</span></div>
            <div><span className="ink-dark base-regular">LOCAL</span> &nbsp;&nbsp;<span className="text-selectable">{ids.local}</span></div>
        </div>)
    }
    render() {
        return (<div>
            <div style={{ textAlign: "left" }}>
                {this.showIds()}
                <div>
                    <Nearby />
                </div>
                <div>
                    <AddByCode />
                </div>
            </div>
        </div>)
    }
}

export default AddPeer;