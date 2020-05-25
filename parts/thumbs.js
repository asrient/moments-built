import $ from "jquery";
import React, { Component } from "react";

import "./thumbs.css"
import "./global.css"
import { BarButton, Loading, Icon } from "./global.js";

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';


class Thumb extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { src: this.props.src,menu:false }
    }
    componentDidMount = () => {
    }
    close(){
        this.state.menu = false;
        this.setState(this.state);
    }
    tags(snap){
        if(snap.tags.length){
            var html=[];
            snap.tags.forEach((tagId)=>{
            html.push(<div className="th_menu_opt_tag" key={tagId} onClick={()=>{
                this.close();
                window.actions('OPEN_PAGE','tags:'+tagId);
            }}>
                <Icon className="size-xs" src="assets://icons/tag.png"/>&nbsp;{tagId}
                </div>)
            })
            return(<div className="th_menu_opt_grp">
                {html}
            </div>)
        }
    }
    untagOpt(){
        var src=this.props.context;
        if(src.split(':')[0]=='tag'){
            var tagId=src.split(':')[1];
        return(<div className="th_menu_opt ink-red" onClick={()=>{
            window.actions("UNTAG_SNAP",{snapId:this.props.id,tagId})
        }}>Untag from "{tagId}"</div>)
        }
    }
    getMenu(snap){
    return(<div className="th_menu_opts base-semilight">
        {this.untagOpt()}
        <div className="th_menu_opt" onClick={()=>{
          this.close();
          window.actions('PREVIEW_SNAP', { id:this.props.id, context: this.props.context })
        }}>Preview</div>
        <div className="th_menu_opt ink-red" onClick={()=>{
             this.close();
             window.actions('DELETE_SNAP', this.props.id )
        }}>Delete</div>
        <div className="th_menu_opt">Export</div>
        <div className="th_menu_opt" onClick={()=>{
            this.close();
                window.actions("ADD_TAG",this.props.id)
        }}>Add tag</div>
        {this.tags(snap)}
    </div>)
    }
    menu(){
        var id=this.props.id;
        var src=this.props.context;
        var snaps=[];
        if(src=='timeline'){
        snaps=window.state.timeline.snaps();
        }
        else if(src.split(':')[0]=='tag'){
            var tagId=src.split(':')[1];
            var tags=window.state.tags.list();
            var tagInd=tags.findIndex((tag)=>{
                return tag.id==tagId;
            })
            if(tagInd>=0){
               snaps= tags[tagInd].snaps; 
            }
        }
        //for other contexts
        var snap=snaps.find((snp)=>{
            return snp.id==id;
        })
        if(snap!=undefined)
        return this.getMenu(snap);
    }
    getData = () => {
        var srcId = this.props.id.split(':')[0];
        if (srcId == 'local') {
            recs.findOne({ id: this.props.id }, (err, snap) => {
                if (snap != null) {
                    var state = this.state;
                    state.src = snap.thumb_url;
                    state.type = snap.type;
                    this.setState(state);
                }
            })
        }
        else {
            //code for other types here.
        }
    }
    render() {
        var size = '9rem';
        var src = this.props.src;
        if (this.props.size != undefined && this.props.size != null) {
            size = this.props.size;
        }
        if (this.props.src == undefined) {
            if (this.state.src == undefined&&this.props.id!=undefined) {
                console.warn("getting data for thumbnail");
                this.getData();
            }
            else {
                src = this.state.src;
            }
        }
        var style = { height: size, width: size };
        if (src != undefined) {
            style["backgroundImage"] = 'url(' + src + ')';
        }
        var cls="thumb";
        if(this.state.menu){
            cls+=" thumb_selected";
        }
        return (
            <Tippy
            visible={this.state.menu}
            onClickOutside={() => {
                this.close()
            }}
            hideOnClick={false}
            content={this.menu()}
            arrow={true}
            className="th_menu"
            animation="scale"
            duration={0}
            placement="auto-start"
            hideOnClick='toggle'
            interactive={true}
        >
             <div className={cls} style={style}
                onClick={() => {
                    this.close();
                    if (this.props.onClick != undefined) {
                        this.props.onClick(this.props.id);
                    }
                }}
                onContextMenu={()=>{
                    this.state.menu=true;
                    this.setState(this.state);
                }}
            ></div>
        </Tippy>
           
        )
    }
}

class ThumbsGrid extends React.Component {
    /** @props : paths onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { list: null }
    }
    componentDidMount = () => {

    }
    showThumbs = () => {
        var html = [];
        if (this.props.snaps != undefined && this.props.snaps != null) {
            this.props.snaps.forEach((snap, key) => {
                html.push(<Thumb size={this.props.thumbSize} context={this.props.context} key={snap.id} src={snap.thumb} id={snap.id} type={snap.type} onClick={(id) => {
                    if (this.props.onThumbClick != undefined) {
                        this.props.onThumbClick(id);
                    }
                }} />)
            })
        }
        return (html);
    }
    getGrid = () => {
        var size = '9rem';
        if (this.props.thumbSize != undefined) {
            size = this.props.thumbSize;
        }
        return (
            <div className="thumbs_grid"
                style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(' + size + ', 1fr))' }}
            >  {this.showThumbs()} </div>
        )
    }
    render() {

        if (this.props.title != undefined) {
            return (
                <div>
                    <div>
                        <div className="tg_title ink-black base-regular">{this.props.title}</div>
                        <div className="tg_location ink-dark base-semilight">{this.props.location} </div>
                    </div>

                    <div>
                        {this.getGrid()}
                    </div>
                </div>
            )
        }
        else {
            return (<div>{this.getGrid()}</div>)
        }

    }
}

export { Thumb, ThumbsGrid }