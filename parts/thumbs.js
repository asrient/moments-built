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
        this.state = { snap: null, menu: false }
    }
    componentWillUnmount() {
        this.unsub();
    }
    componentDidMount = () => {
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
        var snap = this.parseState();
        if(snap==null){
            window.state.loadSnapInfo(this.props.id);
        }
    }
    parseState = () => {
        var snap = window.state.getSnapInfo(this.props.id);
        if(snap!=null){
            this.setState({...this.state,snap})
        }
        return snap;
    }
    close(){
        this.state.menu = false;
        this.setState(this.state);
    }
    tags(){
        var snap=this.state.snap;
        if(snap!=null&&snap.tags.length){
            var html=[];
            snap.tags.forEach((tag)=>{
            html.push(<div className="th_menu_opt_tag" key={tag.id} onClick={()=>{
                this.close();
                window.actions('OPEN_PAGE','tags:'+tag.id);
            }}>
                <Icon className="size-xs" src="assets://icons/tag.png"/>&nbsp;{tag.id}
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
    getMenu(){
    return(<div className="th_menu_opts base-semilight">
        {this.untagOpt()}
        <div className="th_menu_opt" onClick={()=>{
          this.close();
          window.actions('PREVIEW_SNAP', { id:this.props.id, context: this.props.context })
        }}>Preview</div>
        <div className="th_menu_opt ink-red" onClick={()=>{
             this.close();
             window.actions('DELETE_SNAPS', [this.props.id] )
        }}>Delete</div>
        <div className="th_menu_opt">Export</div>
        <div className="th_menu_opt" onClick={()=>{
            this.close();
                window.actions("ADD_TAG",this.props.id)
        }}>Add tag</div>
        {this.tags()}
    </div>)
    }
    render() {
        var size = '9rem';
        var src=null;
        if (this.props.size != undefined && this.props.size != null) {
            size = this.props.size;
        }
        if (this.state.snap != null) {
            src='resource://'+this.state.snap.thumbnail_key;
        }
        var style = { height: size, width: size };
        if (src != null) {
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
            content={this.getMenu()}
            arrow={true}
            className="th_menu"
            animation="scale"
            duration={0}
            placement="auto-start"
            hideOnClick='toggle'
            interactive={true}>
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
        if (this.props.snapIds != undefined && this.props.snapIds != null) {
            this.props.snapIds.forEach((snapId, key) => {
                html.push(<Thumb size={this.props.thumbSize} 
                    context={this.props.context} 
                    key={snapId} 
                    id={snapId} 
                    onClick={(id) => {
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