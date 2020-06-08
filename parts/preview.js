import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import deleteSnap from "./deleteSnap.js";
import { BarButton, Loading, Icon } from "./global.js";
import "./preview.css";

class Preview extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            isActive: false,
            snap: null,
            snaps: [],
            snapInd: 0,
            limits: { left: false, right: false },
            showDetails: true,
            showTbar: true
        }
        this.retries = [];
    }
    componentDidMount = () => {
        window.state.subscribe(() => {
            this.parseState();
        })
        this.parseState();
    }
    parseState = () => {
        var preview = window.state.getState().preview;
        var state = this.state;
        state.isActive = preview.isActive;
        state.snaps = [];
        if (preview.isActive) {
            state.id = preview.id;
            state.snap = window.state.getSnapInfo(preview.id);
            if (state.snap == null) {
                this.tryLoadingSnap(state.id);
            }
            var allSnaps = [];
            if (preview.context == 'timeline') {
                allSnaps = window.state.getTimelineList();
            }
            else if (preview.context.split(':')[0] == 'tag') {
                var tagId = preview.context.split(':')[1];
                allSnaps = window.state.getTagsList(tagId);
            }
            var ind = allSnaps.findIndex((snp) => {
                if (snp.id == state.id) {
                    return true;
                }
                else {
                    return false;
                }
            })
            if (ind >= 0) {
                var count = 0;
                state.limits = { left: false, right: false };
                for (var i = ind - 5; i <= ind + 5; i++) {
                    if (allSnaps[i] != undefined) {
                        if (i == ind) {
                            state.snapInd = count;
                        }
                        count++;
                        state.snaps.push(allSnaps[i]);
                    }
                    else {
                        if (i == ind + 1) {
                            state.limits.right = true;
                        }
                        else if (i == ind - 1) {
                            state.limits.left = true;
                        }
                    }
                }
            }
            else {
                console.error("PREVIEW: snap not in context");
                window.actions('CLOSE_PREVIEW');
            }

        }
        else {
            state.id = null;
            state.snaps = [];
        }
        this.setState(state);
    }
    tryLoadingSnap(id) {
        if (!this.retries.includes(id)) {
            window.state.loadSnapInfo(id);
            this.retries.push(id);
        }
    }
    changeSnap(id) {
        window.state.preview.changeSnap(id);
    }
    getTitle = () => {
        if (this.state.snap != null) {
            const months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            var dt = new Date(this.state.snap.taken_on);
            var date = dt.getUTCDate() + " " + months[dt.getUTCMonth()] + " " + dt.getUTCFullYear();
            var hr = dt.getHours();
            var min = dt.getMinutes();
            var suffix = "AM";
            if (hr > 12 || (hr == 12 && min > 0)) {
                suffix = "PM";
                if (hr > 12) {
                    hr -= 12;
                }
            }
            if (min < 10) {
                min = "0" + min;
            }
            var time = hr + ":" + min + " " + suffix;
            return (<div>{time + ", " + date}</div>)
        }
        else {
            return (<div></div>)
        }
    }
    getView = () => {
        var ht = "100%";
        if (this.state.showTbar) {
            ht = "calc(100% - 5rem)";
        }
        if (this.state.snap.type == 'image') {
            return (<div className="pv_picView" style={{ backgroundImage: "url(resource://" + this.state.snap.file_key + ")", height: ht }}></div>)
        }
        else {
            return (<video src={'resource://' + this.state.snap.file_key} style={{ maxHeight: ht, maxWidth: '100%' }}
                controls autoPlay ></video>)
        }
    }

    getArrow = (dir = "left") => {
        var val = 1;
        if (dir == "left") {
            val = -1;
        }
        var willShow = true;
        var limitReached = false;
        if (dir == 'left') {
            if (this.state.limits.left) {
                limitReached = true;
            }
        }
        else {
            if (this.state.limits.right) {
                limitReached = true;
            }
        }

        if (limitReached) {
            willShow = false;
        }

        if (willShow) {
            return (<div className={"pv_" + dir + "Arrow"} onClick={() => {
                this.changeSnap(this.state.snaps[this.state.snapInd + val].id)
            }}></div>)
        }
        else {
            return (<div></div>)
        }
    }
    getThumb = (snap, isFocus = false) => {
        var getClass = () => {
            var cls = "pv_thumb"
            if (isFocus) {
                cls += " pv_thumbFocused";
            }
            return (cls);
        }
        var snapObj = window.state.getSnapInfo(snap.id);
        if (snapObj == null) {
            this.tryLoadingSnap(snap.id);
        }
        var src = null;
        if (snapObj != null) {
            src = 'resource://' + snapObj.thumbnail_key;
        }
        return (<img className={getClass()} key={snap.id} src={src} onClick={() => {
            this.changeSnap(snap.id);
        }} />)
    }
    getThumbsBar = () => {
        if (this.state.showTbar) {
            var html = [];
            this.state.snaps.forEach((snap, ind) => {
                var isFocus = false;
                if (ind == this.state.snapInd) {
                    isFocus = true;
                }
                html.push(this.getThumb(snap, isFocus));
            })
            return (<div className="pv_tBar center">
                {html}
            </div>)
        }
        else {
            return (null);
        }
    }
    tags() {
        var tags = this.state.snap.tags;
        var html = []
        if (tags != undefined && tags.length > 0) {
            html = tags.map((tag) => {
                var tagId = tag.id;
                return (<div key={tagId} className="pv_tag center">
                    <div onClick={() => {
                        window.actions('CLOSE_PREVIEW');
                        window.actions('OPEN_PAGE', 'tags:' + tagId);
                    }}>{tagId}</div>&nbsp;&nbsp;
                    <div className="pv_tag_x center" onClick={() => {
                        window.actions("UNTAG_SNAP", { snapId: this.state.snap.id, tagId })
                    }}><Icon className="center" src="assets://icons/Freestanding_StopProgress.png" /></div></div>)
            })
            return (<div className="center">{html}</div>)
        }
    }
    getTags() {
        if (this.state.showDetails) {
            return (<div className="center pv_tags ink-bg base-regular">
                <div className="pv_tags_add" onClick={() => {
                    window.actions("ADD_TAG", this.state.snap.id);
                }}>Tag</div>
              &nbsp;
                {this.tags()}
            </div>)
        }
    }
    getDevInfo() {
        if (this.state.showDetails) {
        var devId = this.state.id.split('/')[0];
        var devInfo = window.state.getDeviceInfo1(devId);
        return (<div className="pv_devInfo">
            <Icon src={devInfo.icon} />&nbsp;
            {devInfo.name}
        </div>)
        }
    }
    getBody() {
        if (this.state.snap != null) {
            return (<div style={{ height: '100%' }}>
                {this.getTags()}
                {this.getDevInfo()}
                {this.getArrow("left")}
                {this.getView()}
                {this.getArrow("right")}
            </div>)
        }
    }
    render() {
        if (this.state.isActive) {
            return (<div className="pv_window">
                <div className="pv_head">

                    <div className="pv_nohandle center" style={{ marginLeft: '5rem', justifyContent: 'flex-end' }}>
                        <BarButton icon="Control_GoBack" onClick={() => {
                            //closing preview
                            window.actions('CLOSE_PREVIEW');
                        }} />
                    </div>
                    <div className="pv_handle"></div>
                    <div className="pv_handle center base-regular size-xs">{this.getTitle()}</div>
                    <div className="pv_nohandle center">
                        <BarButton icon="TabBar_More" selected={this.state.showTbar} onClick={() => {
                            var state = this.state;
                            if (this.state.showTbar) {
                                state.showTbar = false
                            }
                            else {
                                state.showTbar = true
                            }
                            this.setState(state);
                        }} />
                        <BarButton icon="Control_Info" selected={this.state.showDetails} onClick={() => {
                            var state = this.state;
                            if (this.state.showDetails) {
                                state.showDetails = false
                            }
                            else {
                                state.showDetails = true
                            }
                            this.setState(state);
                        }} /><BarButton icon="Control_Share" />
                        <BarButton icon="Navigation_Trash" onClick={() => {
                            var toDel = this.state.id;
                            if (!this.state.limits.right) {
                                this.parseState(this.state.snaps[this.state.snapInd + 1].id)
                            }
                            else if (!this.state.limits.left) {
                                console.log("moving left")
                                this.parseState(this.state.snaps[this.state.snapInd - 1].id)
                            }
                            window.actions('DELETE_SNAPS', [toDel]);
                        }} />
                    </div>
                </div>
                <div className="pv_body">
                    {this.getBody()}
                    {this.getThumbsBar()}
                </div>
            </div>)
        }
        else {
            return (<div></div>)
        }
    }
}

export default Preview;