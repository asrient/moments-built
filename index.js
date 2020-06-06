import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import Timeline from "./parts/timeline.js";
import Preview from "./parts/preview.js";
import Tags from "./parts/tags.js";
import Window from "./parts/window.js";
import Welcome from "./parts/welcome.js";
import state from "./parts/state.js";
import actions from "./parts/actions.js";
import { BarButton, Loading, Icon, Switch } from "./parts/global.js";
import "./styles.css";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

if (window.srcs.get('local') == undefined) {
    console.log("Initializing sources..");
    window.srcs.set('local', {
        id: 'local',
        type: 'local',
        name: "Computer",
        addedOn: new Date().getTime()
    });
}
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir + '/tmp', { recursive: true });
    fs.mkdirSync(filesDir + '/media', { recursive: true });
    fs.mkdirSync(filesDir + '/thumbs', { recursive: true });
}

function getUrl(url) {
    return url.split('*').join('.')
}

function setUrl(url) {
    return url.split('.').join('*')
}


state.init();

window.state = state;
window.actions = actions;

opener = function () {
    console.error("opener not initialized yet");
}

/*pine.ipc.on('LOGIN_SUCCESS', (e, arg) => {
    console.log('LOGIN SUCCESS', arg);
    window.actions('REGISTER_GOOGLEPHOTOS', arg);
})*/

class Switcher extends React.Component {
    /** @props : change, selected
 **/
    constructor(props) {
        super(props);
        this.state = {}
    }
    change = (pg) => {
        if (this.props.selected != pg) {
            this.props.change(pg)
        }
    }
    getSwitch = (id, name) => {
        if (id == this.props.selected) {
            return (<div className="switch center active_switch">{name}</div>)
        }
        else {
            return (<div className="switch center" onClick={() => { this.change(id) }}>{name}</div>)
        }
    }
    render() {
        return (
            <div className="switches ink-primary">
                {this.getSwitch('timeline', 'Timeline')}
                {this.getSwitch('places', 'Places')}
                {this.getSwitch('people', 'People')}
                {this.getSwitch('tags', 'Tags')}
            </div>
        )
    }
}

class DeviceMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isSrcMenuVisible: false, airPeers: null, local: null, gPhotos: null }
    }
    componentDidMount() {
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
        var airPeers = [];
        var local = null;
        var gPhotos = null;
        Object.keys(st.sources).forEach(devId => {
            var source = {
                id: devId,
                isActive: st.sources[devId].isActive
            }
            if (devId == 'local') {
                source.devicename = st.info.devicename;
                source.username = st.info.username;
                source.icon = st.info.icon;
                local = source;
            }
            else if (devId == 'gPhotos') {/////
                source.devicename = st.sources[devId].info.devicename;
                source.username = st.sources[devId].info.username;
                source.icon = st.sources[devId].info.icon;
                gPhotos = source;
            }/////
            else {
                source.devicename = st.sources[devId].info.devicename;
                source.username = st.sources[devId].info.username;
                source.icon = st.sources[devId].info.icon;
                source.isConnected = false;
                if (st.sources[devId].sessionId != null) {
                    source.isConnected = true;
                    source.color = 'blue';
                    if (st.sources[devId].sessionId.split('.')[0] == 'local') {
                        source.color = 'purple';
                    }
                }
                airPeers.push(source);
            }
        })
        this.setState({ ...this.state, local, airPeers, gPhotos });
    }
    getSrcMenu = () => {
        var buildOpt = (srcId, src) => {
            var icon = "assets://icons/SystemEntity_Computer.png";
            if (src.icon != 'default') {
                icon = `assets://avatars/${src.icon}.png`;
            }
            var details = null;
            if (src.isConnected != undefined) {
                if (src.isConnected) {
                    details = (<div className={`ink-${src.color} base-semilight`}>Connected</div>)
                }
                else {
                    details = (<div className="ink-grey base-semilight">Not connected</div>)
                }
            }
            return ((<div key={srcId} className="srcm_opt">
                <div className="center">
                    <Icon src={icon} style={{ paddingRight: "0.4rem" }} />
                    <div style={{ textAlign: 'left' }}>
                        <div>{src.devicename}</div>
                        <div style={{ fontSize: '0.75rem' }}>{details}</div>
                    </div>
                </div>
                <div className="center">
                    <div>
                        <Icon src="assets://icons/Control_Refresh.png" className="srcm_refresh" style={{ paddingRight: "0.4rem", fontSize: '0.75rem' }}
                            onClick={() => {
                                window.actions('REFRESH_DEVICE', srcId);
                            }} />
                    </div>
                    <div>
                        <Switch checked={src.isActive} onChange={(check) => {
                            if (check) {
                                window.actions('ACTIVATE_SOURCE', srcId);
                            }
                            else {
                                window.actions('DEACTIVATE_SOURCE', srcId);
                            }
                        }} />
                    </div>
                </div>
            </div>))
        }
        var local = buildOpt('local', this.state.local);
        var gPhotos = null;
        if (this.state.gPhotos != null) {
            gPhotos = buildOpt('gPhotos', this.state.gPhotos);
        }
        var airPeers = [];
        this.state.airPeers.forEach((peer) => {
            airPeers.push(buildOpt(peer.id, peer));
        })
        var getGrp = (title, opts) => {
            if (opts != null && opts.length) {
                return (<div><div className="srcm_grp_title">{title}</div>
                    <div>{opts}</div></div>)
            }
        }
        return (<div className="ink-primary size-xs base-regular">
            <div className="center-col size-xs" style={{ padding: "0.8rem 0.4rem" }}>
                <div><Icon className="size-l" src="assets://icons/connectedDevices.png" /></div>
                <div>Connected devices</div>
            </div>
            <div className="srcm_grp_title">THIS DEVICE</div>
            <div>{local}</div>
            {getGrp('CLOUD', gPhotos)}
            {getGrp('AIR SYNC', airPeers)}
            <div id="srcm_addbutt_holder"><div id="srcm_addbutt" onClick={() => {
                window.actions('ADD_DEVICE');
                this.state.isSrcMenuVisible = false;
                this.setState(this.state);
            }} className="center">Add device</div></div>
        </div>)
    }
    render() {
        if (this.state.local != null) {
            return (<Tippy
                visible={this.state.isSrcMenuVisible}
                onClickOutside={() => {
                    this.state.isSrcMenuVisible = false;
                    this.setState(this.state);
                }}
                hideOnClick={false}
                content={this.getSrcMenu()}
                arrow={true}
                className="src_menu"
                animation="scale"
                duration={0}
                placement="bottom"
                hideOnClick='toggle'
                interactive={true}
            >
                <span><BarButton icon="SystemEntity_Computer" onClick={() => {
                    if (this.state.isSrcMenuVisible)
                        this.state.isSrcMenuVisible = false;
                    else
                        this.state.isSrcMenuVisible = true;
                    this.setState(this.state);
                }} /></span>
            </Tippy>)
        }
        else {
            return (<div></div>)
        }
    }
}


const allPages = ['timeline', 'places', 'people', 'tags', 'welcome']

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currentPage: null, relayToPage: null }
    }
    componentDidMount() {
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState = () => {
        var data = window.state.getState();
        var page = data.nav.page;
        var relay = data.nav.relay;
        if (allPages.includes(page)) {
            if (this.state.currentPage != page) {
                this.state.pageBarHtml = null;
            }
            this.state.currentPage = page;
            if (relay == undefined) {
                relay = null;
            }
            this.state.relayToPage = relay;
            this.setState(this.state);
        }
        else {
            console.error('invalid page to set');
        }
    }
    setPage(page) {
        window.actions("OPEN_PAGE", page);
    }
    getPage = () => {
        if (this.state.currentPage == 'timeline') {
            return (<Timeline relay={this.state.relayToPage} />)
        }
        else if (this.state.currentPage == 'places') {
            return (<div className="center" style={{ height: '100vh', fontSize: '80vh' }}>🗺</div>)
        }
        else if (this.state.currentPage == 'tags') {
            return (<Tags relay={this.state.relayToPage} />)
        }
        else {
            return (<div className="center" style={{ height: '16rem' }}>🚧</div>)
        }
    }
    render() {
        if (this.state.currentPage == 'welcome') {
            return (<Welcome relay={this.state.relayToPage} />)
        }
        else if (this.state.currentPage != null) {
            return (
                <div>
                    <div id="head">
                            <div id="handle1" className="handle"></div>
                            <div className="center">
                                <BarButton
                                    icon="font_minus"
                                    onClick={() => {
                                        //decrease size
                                        window.state.reduceThumbSize();
                                    }} />
                                <BarButton icon="font_plus" onClick={() => {
                                    //increase size
                                    window.state.increaseThumbSize();
                                }} />
                            </div>
                            <div className="handle"></div>
                            <div className="center"><Switcher change={this.setPage} selected={this.state.currentPage} /></div>
                            <div id="handle2">
                                <div className="handle"></div>
                                <div className="center">
                                <BarButton
                                    icon="QuickActions_Add"
                                    onClick={() => {
                                        window.actions('ADD_SNAP');
                                    }} />
                                <BarButton icon="Navigation_Trash" />
                                <BarButton icon="QuickActions_Share" />
                                    <DeviceMenu />
                                </div>
                                <div className="handle"></div>
                            </div>
                    </div>
                    <div>
                        {this.getPage()}
                    </div>
                </div>
            )
        }
        else {
            return (<div style={{ paddingTop: '45vh' }}>
                <Loading />
            </div>)
        }
    }
}



ReactDOM.render(
    <div>
        <Nav />
        <Preview />
        <Window />
    </div>
    , document.getElementById('root')
);


win.resize = function () {
    if (win.isMaximized()) {
        win.unmaximize();
    }
    else {
        win.maximize();
    }
}
win.showControls = function () {
    $('#controls').css({
        display: 'flex'
    })
    $('#controls').html(getControls());
}
win.hideControls = function () {
    $('#controls').css({
        display: 'none'
    })
}
function getControls() {
    var red = '<div class="bar_butts bar_butt_red" onClick=win.close()></div>';
    var yellow = '<div class="bar_butts bar_butt_yellow" onClick=win.minimize()></div>';
    var green = '<div class="bar_butts bar_butt_green" onClick=win.resize()></div>';
    var grey = '<div class="bar_butts" ></div>';
    var controls = red;
    if (win.isMinimizable()) {
        controls += yellow;
    } else {
        controls += grey;
    }
    if (win.isMaximizable() && win.isResizable()) {
        controls += green;
    }
    return (controls)
}
function getControlsDisabled() {
    var grey = '<div class="bar_butts" ></div>';
    var controls = grey + grey;
    if (win.isMaximizable()) {
        controls += grey;
    }
    return (controls)
}

$('#controls').html(getControls());

win.on('focus', () => {
    $('#controls').html(getControls());
})

win.updateControls = function () {
    $('#controls').html(getControls());
}

win.on('blur', () => {
    $('#controls').html(getControlsDisabled());
})

win.show();