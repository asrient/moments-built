import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import deleteSnap from "./deleteSnap.js";
import { BarButton, Loading,Icon } from "./global.js";
import "./preview.css";

class Preview extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { id: null, isActive: false, snap: null, snaps: [], snapInd: 0, limits: { left: false, right: false }, showTags:true, showTbar: true }
    }
    getSnapInfo = (id, cb) => {
        recs.findOne({ id }, (err, snap) => {
            if (snap != null)
                cb(snap);
        })
    }


    parseState = (id = null) => {
        var data = window.state.getState().preview;
        var state = this.state;
        state.isActive = data.isActive;
        state.snaps = [];
        if (data.isActive) {
            if (id != null) {
                state.id = id;
            }
            else if (state.id == null) {
                state.id = data.id;
            }
            var allSnaps = [];
            if (data.context == 'timeline') {
                allSnaps = window.state.timeline.snaps();
            }
            else if (data.context.split(':')[0] == 'tag') {
                var tagId = data.context.split(':')[1];
                var list = window.state.tags.list();
                var ind = list.findIndex((tag) => {
                    return tag.id == tagId
                })
                if (ind >= 0) {
                    allSnaps = list[ind].snaps;
                }
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
                state.snap = allSnaps[ind];
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
    componentDidMount = () => {
        window.state.subscribe(() => {
                this.parseState();
        })
        this.parseState();
    }
    openByIndex = (ind) => {
        var state = this.state;
        var snap = state.snaps[ind];
        if (snap != undefined) {
            this.parseState(snap.id);
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
        var ht = "100%";
        if (this.state.showTbar) {
            ht = "calc(100% - 5rem)";
        }
        if (this.state.snap.type == 'image') {
            return (<div className="pv_picView" style={{ backgroundImage: "url(" + this.state.snap.url + ")", height: ht }}></div>)
        }
        else {
            return (<video src={this.state.snap.url} style={{ maxHeight: ht, maxWidth: '100%' }}
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
                this.parseState(this.state.snaps[this.state.snapInd + val].id)
            }}></div>)
        }
        else {
            return (<div></div>)
        }
    }
    getThumb = (snap, isFocus = false) => {
        var snapInd = this.state.snapIndex;
        var getClass = () => {
            var cls = "pv_thumb"
            if (isFocus) {
                cls += " pv_thumbFocused";
            }
            return (cls);
        }
        var src = snap.thumb_url;
        return (<img className={getClass()} key={snap.id} src={src} onClick={() => {
            this.parseState(snap.id);
        }} />)

    }
    getThumbsBar = () => {
        if (this.state.showTbar) {
            var html = [];
            /* var left = -3;
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
                 if (html.length < 7) {
                     if (left == -3) {
                         for (var i = -4; i >= -6; i--) {
                             var v = this.getThumb(snapInd + i);
                             if (v != null) {
                                 html.splice(0, 0, v);
                             }
                         }
                     }
                 }
             }*/
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
    tags(){
        var tags=this.state.snap.tags;
        var html=[]
        if(tags!=undefined&&tags.length>0){
          html=tags.map((tagId)=>{
          return(<div key={tagId} className="pv_tag center">
              <div onClick={()=>{
            window.actions('CLOSE_PREVIEW');
            window.actions('OPEN_PAGE','tags:'+tagId);
          }}>{tagId}</div>&nbsp;&nbsp;
          <div className="pv_tag_x center" onClick={()=>{
              window.actions("UNTAG_SNAP",{snapId:this.state.snap.id,tagId})
          }}><Icon className="center" src="common://icons/Freestanding_StopProgress.png" /></div></div>)
          })
          return(<div className="center">{html}</div>)
        }
    }
    getTags(){
      if(this.state.showTags){
          return(<div className="center pv_tags ink-white base-regular">
              <div className="pv_tags_add" onClick={()=>{
                   window.actions("ADD_TAG",this.state.snap.id);
              }}>Tag</div>
              &nbsp;
              {this.tags()}
          </div>)
      }
    }
    render() {
        if (this.state.isActive) {
            return (<div className="pv_window">
                <div className="pv_head">
                    <div className="pv_nohandle center" style={{ marginLeft: '5rem' }}>
                        <BarButton icon="Control_GoBack" onClick={() => {
                            //closing preview
                            window.actions('CLOSE_PREVIEW');
                        }} />
                    </div>
                    <div className="pv_handle center base-regular size-xs">{this.getTitle()}</div>
                    <div className="pv_nohandle center">
                        <BarButton icon="Control_Info" onClick={() => {
                            var state = this.state;
                            if (this.state.showTbar) {
                                state.showTbar = false
                            }
                            else {
                                state.showTbar = true
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
                            window.actions('DELETE_SNAP', toDel);
                        }} />
                    </div>
                </div>
                <div className="pv_body">
                    {this.getTags()}
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