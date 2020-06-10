import $ from "jquery";
import React, { Component } from "react";
import "./settings.css";
import { Icon, BarButton } from "./global.js";

function code(n = 10) {
    return crypto.randomBytes(n).toString('hex');
}

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: 'general', theme: 'system' };
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
        this.themeUpdate();
    }
    parseState() {
        var st = window.state.getState();
        this.setState({ ...this.state, avatar: st.info.icon })
    }
    themeUpdate() {
        console.log('updating theme')
        var theme = 'system';
        if (localStorage.getItem("theme")) {
            theme = localStorage.getItem("theme");
        }
        this.setState({ ...this.state, theme })
    }
    componentWillUnmount() {
        this.unsub();
    }
    changePage(page = 'general') {
        this.setState({ ...this.setState, page })
    }
    getSideMenu() {
        var getClass = (cat) => {
            var cls = "sett_menuOpt";
            if (cat == this.state.page.split('/')[0]) {
                cls += " sett_menuOptActive"
            }
            return cls;
        }
        return (<div id="sett_sideMenu" className="ink-grey size-s base-light">
            <div className={getClass('general')} onClick={() => {
                this.changePage('general')
            }}>General</div>
            <div className={getClass('devices')} onClick={() => {
                this.changePage('devices')
            }}>Devices</div>
            <div className={getClass('storage')} onClick={() => {
                this.changePage('storage')
            }}>Storage</div>
        </div>)
    }
    getGeneralPage() {
        var page = this.state.page;
        var getThemeClass = (theme) => {
            var cls = "sett_thOpt";
            if (theme == this.state.theme) {
                cls += " sett_optActive"
            }
            return cls;
        }
        var getAvatar = (avatar) => {
            var cls = "sett_avatar";
            if (avatar == this.state.avatar) {
                cls += " sett_optActive"
            }
            return (<div className={cls} onClick={() => {
                window.state.updateAvatar(avatar);
            }}><Icon style={{ fontSize: '4rem' }} src={`assets://avatars/${avatar}.png`} /></div>);
        }
        return (<div>
            <div className="size-m base-regular ink-secondary">General</div>
            <hr style={{ marginTop: '0.3rem' }} />
            <div style={{ padding: '0.3rem' }}>
                <div className="size-s ink-secondary base-semilight">Theme</div>
                <div className="hstack space-around" style={{flexWrap:'wrap'}}>
                    <div className={getThemeClass('system')} onClick={() => {
                        window.changeTheme('system');
                        this.themeUpdate();
                    }}>
                        <Icon style={{ fontSize: '3.6rem' }} src={"assets://screenshots/systemTheme.png"} />
                        <div className="center">System</div>
                    </div>
                    <div className={getThemeClass('light')} onClick={() => {
                        window.changeTheme('light');
                        this.themeUpdate();
                    }}>
                        <Icon style={{ fontSize: '3.6rem' }} src={"assets://screenshots/lightMode.png"} />
                        <div className="center">Light</div>
                    </div>
                    <div className={getThemeClass('dark')} onClick={() => {
                        window.changeTheme('dark');
                        this.themeUpdate();
                    }}>
                        <Icon style={{ fontSize: '3.6rem' }} src={"assets://screenshots/darkMode.png"} />
                        <div className="center">Dark</div>
                    </div>
                </div>
                <hr />
                <div>
                    <div className="size-s ink-secondary base-semilight">Avatar</div>
                    <div id="sett_avatars">
                        {getAvatar('sierra')}
                        {getAvatar('potions')}
                        {getAvatar('dish')}
                        {getAvatar('elcapitan')}
                        {getAvatar('acorn')}
                        {getAvatar('bag')}
                        {getAvatar('ball')}
                        {getAvatar('tweetbot')}
                        {getAvatar('facetime')}
                        {getAvatar('goofy_laptop')}
                        {getAvatar('black_iMac')}
                        {getAvatar('click')}
                        {getAvatar('win7_logo')}
                        {getAvatar('duck')}
                        {getAvatar('iPhone_7')}
                        {getAvatar('win_logo')}
                        {getAvatar('lily')}
                        {getAvatar('analog')}
                        {getAvatar('plane')}
                        {getAvatar('bot')}
                        {getAvatar('cake')}
                        {getAvatar('can')}
                        {getAvatar('iPhone_XR')}
                        {getAvatar('submarine')}
                        {getAvatar('mojave')}
                        {getAvatar('iphoto')}
                        {getAvatar('keka')}
                    </div>
                </div>
            </div>
        </div>)
    }
    getPage() {
        var cat = this.state.page.split('/')[0];
        if (cat == 'general') {
            return (this.getGeneralPage())
        }
        else if (cat == 'devices') {
            return (<div>Devices</div>)
        }
        else if (cat == 'storage') {
            return (<div>Storages</div>)
        }
    }
    render() {
        return (<div id="sett_container">
            <div className="size-xl ink-primary base-regular">Settings</div>
            <hr style={{ marginTop: '0.3rem' }} />
            <div id="sett">
                {this.getSideMenu()}
                <div id="sett_page">
                    {this.getPage()}
                </div>
            </div>

        </div>)
    }
}

export default Settings;