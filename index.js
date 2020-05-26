import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import "./common.css";

import Timeline from "./parts/timeline.js";
import Preview from "./parts/preview.js";
import Tags from "./parts/tags.js";
import Window from "./parts/window.js";
import state from "./parts/state.js";
import actions from "./parts/actions.js";
import { BarButton, Loading, Icon, Switch } from "./parts/global.js";
import "./styles.css";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

if (window.srcs.get('local') == undefined) {
    console.log("Initializing sources..");
    window.srcs.set('local', { isActive: true, count: 0, type: 'local', name: "Computer", icon: "assets://icons/SystemEntity_Computer.png" });
}
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir + '/tmp', { recursive: true });
    fs.mkdirSync(filesDir + '/media', { recursive: true });
    fs.mkdirSync(filesDir + '/thumbs', { recursive: true });
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
            <div className="switches ink-black">
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
        this.state = { isSrcMenuVisible: false, srcs: window.srcs.get() }
    }
    componentDidMount() {
        window.state.subscribe(() => {
            this.state.srcs = window.srcs.get();
            this.setState(this.state);
        })
    }
    getSrcMenu = () => {
        var buildOpt = (srcId, src) => {
            return ((<div key={srcId} className="srcm_opt"><div className="center">
                <Icon src={src.icon} style={{ paddingRight: "0.4rem" }} /><div>{src.name}</div></div> <div>
                    <Switch checked={src.isActive} onChange={(check) => {
                        if (check) {
                            window.actions('ACTIVATE_SOURCE', srcId);
                        }
                        else {
                            window.actions('DEACTIVATE_SOURCE', srcId);
                        }
                    }} />
                </div></div>))
        }
        var opts = { local: null, cloud: [], airSync: [] };
        var srcs = this.state.srcs;
        var srcIds = Object.keys(srcs);
        srcIds.forEach((srcId) => {
            var src = window.srcs.get(srcId);
            if (srcId == 'local') {
                opts.local = buildOpt(srcId, src);
            }
            else if (src.type == 'cloud/google') {
                opts.cloud.push(buildOpt(srcId, src));
            }
            else {
                opts.airSync.push(buildOpt(srcId, src));
            }
        })
        var getGrp = (title, opts) => {
            if (opts.length) {
                return (<div><div className="srcm_grp_title">{title}</div>
                    <div>{opts}</div></div>)
            }
        }
        return (<div className="ink-black size-xs base-regular">
            <div className="center-col size-xs" style={{ padding: "0.8rem 0.4rem" }}>
                <div><Icon className="size-l" src="assets://icons/connectedDevices.png" /></div><div>Connected devices</div>
            </div>
            <div className="srcm_grp_title">THIS DEVICE</div>
            <div>{opts.local}</div>
            {getGrp('CLOUD', opts.cloud)}
            {getGrp('AIR SYNC', opts.airSync)}
            <div id="srcm_addbutt_holder"><div id="srcm_addbutt" onClick={() => {
                window.actions('ADD_DEVICE');
            }} className="center">Add device</div></div>
        </div>)
    }
    render() {
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
            <span><BarButton rounded={true} icon="SystemEntity_Computer" onClick={() => {
                if (this.state.isSrcMenuVisible)
                    this.state.isSrcMenuVisible = false;
                else
                    this.state.isSrcMenuVisible = true;
                this.setState(this.state);
            }} /></span>
        </Tippy>)
    }
}


const allPages = ['timeline', 'places', 'people', 'tags']

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = { pageBarHtml: null, currentPage: 'timeline', relayToPage: null }
    }
    componentDidMount() {
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }
    getPageBar = () => {
        if (this.state.pageBarHtml != null) {
            return (
                <div id="pagebar">
                    {this.state.pageBarHtml}
                </div>
            )
        }
        else {
            return ('')
        }
    }
    setPageBar = (html) => {
        if (html == undefined) {
            html = null;
        }
        var state = this.state;
        state.pageBarHtml = html;
        this.setState(state);
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
            return (<Timeline setBar={this.setPageBar} relay={this.state.relayToPage} />)
        }
        else if (this.state.currentPage == 'places') {
            return (<div className="center" style={{ height: '100vh', fontSize: '80vh' }}>🗺</div>)
        }
        else if (this.state.currentPage == 'tags') {
            return (<Tags setBar={this.setPageBar} relay={this.state.relayToPage} />)
        }
        else {
            return (<div className="center" style={{ height: '16rem' }}>🚧</div>)
        }
    }
    render() {
        return (
            <div>
                <div id="head">
                    <div id="menubar">
                        <div id="handle1" className="handle"></div>
                        <div className="center"><Switcher change={this.setPage} selected={this.state.currentPage} /></div>
                        <div id="handle2">
                            <div className="handle"></div>
                            <div className="center">
                                <DeviceMenu />
                            </div>
                            <div className="handle"></div>
                        </div>

                    </div>
                    {this.getPageBar()}
                </div>
                <div>
                    {this.getPage()}
                </div>
            </div>
        )
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