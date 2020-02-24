import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import deleteSnap from "./deleteSnap.js";
import { BarButton, Loading } from "./global.js";
import "./preview.css";

class Preview extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { id: null, isActive: false, snaps: {}, snapIndex: 0, limits: { left: null, right: null },showTbar:true }
    }
    getSnapInfo = (id, cb) => {
        recs.findOne({ id }, (err, snap) => {
            if (snap != null)
                cb(snap);
        })
    }
    
    deleteSnap=()=>{
        deleteSnap([this.state.snap.id],()=>{
                var sid=this.state.snapIndex;
                this.notifyDelete(this.state.snap.id);
                this.goTo(this.state.snapIndex + 1,(succsess)=>{
                    var state=this.state;
                    delete state.snaps[sid];
                  if(!succsess){
                    state.isActive=false;
                  }
                  this.setState(state);
                });
        })
    }
    componentDidMount = () => {
        this.props.openFunc((id, getSnap,notifyDelete) => {
            //show the preview now
            this.getSnapInfo(id, (snp0) => {
                var state = { id: null, isActive: false, snaps: {}, snapIndex: 0, limits: { left: null, right: null },showTbar:true };
                state.snaps['0'] = snp0;
                this.setState(state);
                this.open(0);
            })
            this.notifyDelete=(delId)=>{
               if(notifyDelete!=undefined){
                   notifyDelete(delId);
               }
            }
            this.getSnap = (ind, cb = function () { }) => {
                if (this.state.snaps[ind] == undefined) {
                    var state = this.state;
                    if (getSnap == undefined) {
                        state.limits.left = 0;
                        state.limits.right = 0;
                        cb(null);
                    }
                    else {
                        var proceed = true;
                        if (ind > 0 && (this.state.limits.right != null && Math.abs(this.state.limits.right) <= Math.abs(ind))) {
                            proceed = false;
                        }
                        if (ind < 0 && (this.state.limits.left != null && Math.abs(this.state.limits.left) <= Math.abs(ind))) {
                            proceed = false;
                        }
                        console.log("getSnap resist for", ind, "left:", this.state.limits.left != null, Math.abs(this.state.limits.left) <= Math.abs(ind));
                        if (proceed) {
                            getSnap(ind, (sid) => {
                                var state = this.state;
                                if (sid != null) {
                                    this.getSnapInfo(sid, (snap) => {
                                        state.snaps[ind] = snap;
                                        this.setState(state);
                                        cb(sid);
                                    })
                                }
                                else {
                                    if (ind >= 0) {
                                        state.limits.right = ind;
                                    }
                                    if (ind <= 0) {
                                        state.limits.left = ind;
                                    }
                                    this.setState(state);
                                    cb(null);
                                }
                            })
                        }
                        else {
                            cb(null)
                        }
                    }
                }
                else {
                    return (this.state.snaps[ind])
                }

            }

        })
    }
    open = (ind) => {
        var state = this.state;
        var snap = state.snaps[ind];
        if (snap != undefined) {
            state.isActive = true;
            state.snap = snap;
            state.snapIndex = ind;
            state.id=snap.id;
            this.setState(state);
        }
        else {
            console.error("req to open invalid snap index", ind);
        }
    }
    getTitle = () => {
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
    getView = () => {
        var  ht="100%";
        if(this.state.showTbar){
           ht="calc(100% - 5rem)";
        }
        return (<div className="pv_picView" style={{ backgroundImage: "url(" + this.state.snap.url + ")",height:ht }}></div>)
    }
    goTo=(val,cb=function(){})=>{
        if (this.state.snaps[val] != undefined) {
            this.open( val)
        }
        else {
            this.getSnap( val, (sid) => {
                if (sid != null) {
                    this.open(val);
                    cb(true);
                }
                else {
                    cb(false);
                }
            })
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
            if (this.state.limits.left != null && this.state.limits.left >= this.state.snapIndex + val) {
                limitReached = true;
            }
        }
        else {
            if (this.state.limits.right != null && this.state.limits.right <= this.state.snapIndex + val) {
                limitReached = true;
            }
        }

        if (limitReached) {
            willShow = false;
        }

        if (willShow) {
            return (<div className={"pv_" + dir + "Arrow"} onClick={() => {
               this.goTo(this.state.snapIndex + val); 
            }}></div>)
        }
        else {
            return (<div></div>)
        }
    }
    getThumb = (ind) => {
        var snapInd = this.state.snapIndex;
        var dir = 'right';
        if (ind < 0) {
            dir = 'left';
        }
        var getClass=()=>{
            var cls="pv_thumb"
            if(snapInd==ind){
              cls+=" pv_thumbFocused";
            }
            return(cls);
        }
        if (this.state.snaps[ind] != undefined) {
            var src = this.state.snaps[ind].thumb_url;
            return (<img className={getClass()} key={ind}  src= {src }  onClick={() => {
                this.open(ind);
            }}/>)
        }
        else if (this.state.limits[dir] == null || Math.abs(this.state.limits[dir]) >= Math.abs(ind)) {
            console.log("getting ind", ind);
            this.getSnap(ind);
            return (null)
        }
        else {
            return (null)
        }
    }
    getThumbsBar = () => {
        if(this.state.showTbar){
            var snapInd = this.state.snapIndex;
            var html = [];
            var left = -3;
            var right = 3;
            for (var i = -3; i <= 3; i++) {
                var v = this.getThumb(snapInd + i);
                if (v != null) {
                    html.push(v);
                }
                else {
                    if (i <= 0) {
                        left = i;
                    }
                    else {
                        right = i;
                    }
                }
            }
            if (html.length < 7) {
                if (right == 3) {
                    for (var i = 4; i <= 6; i++) {
                        var v = this.getThumb(snapInd + i);
                        if (v != null) {
                            html.push(v);
                        }
                    }
                }
                if(html.length<7){
                    if(left==-3){
                        for (var i = -4; i >= -6; i--) {
                            var v = this.getThumb(snapInd + i);
                            if (v != null) {
                                html.splice(0,0,v);
                            }
                        }
                    }
                }
            }
            return (<div className="pv_tBar center">
                {html}
            </div>)
        }
        else{
            return(null);
        }
    }
    render() {
        if (this.state.isActive) {
            return (<div className="pv_window">
                <div className="pv_head">
                    <div className="pv_nohandle center" style={{ marginLeft: '5rem' }}>
                        <BarButton icon="Control_GoBack" onClick={() => {
                            //closing preview
                            var state = this.state;
                            state.isActive = false;
                            this.setState(state);
                        }} />
                    </div>
                    <div className="pv_handle center base-regular size-xs">{this.getTitle()}</div>
                    <div className="pv_nohandle center">
                        <BarButton icon="Control_Info" onClick={()=>{
                            var state=this.state;
                            if(this.state.showTbar){
                                state.showTbar=false
                            }
                            else{
                                state.showTbar=true
                            }
                            this.setState(state);
                        }} /><BarButton icon="Control_Share" />
                        <BarButton icon="Navigation_Trash" onClick={()=>{
                            this.deleteSnap();
                        }} />
                    </div>
                </div>
                <div className="pv_body">
                    {this.getArrow("left")}
                    {this.getView()}
                    {this.getArrow("right")}
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