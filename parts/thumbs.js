import $ from "jquery";
import React, { Component } from "react";

import "./thumbs.css"
import "./global.css"

class Thumb extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { src: this.props.src }
    }
    componentDidMount = () => {
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
        var size = '8rem';
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
        return (
            <div className="thumb" style={style}
                onClick={() => {
                    if (this.props.onClick != undefined) {
                        this.props.onClick(this.props.id);
                    }
                }}
            ></div>
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
                html.push(<Thumb size={this.props.thumbSize} key={snap.id} src={snap.thumb} id={snap.id} type={snap.type} onClick={(id) => {
                    if (this.props.onThumbClick != undefined) {
                        this.props.onThumbClick(id);
                    }
                }} />)
            })
        }
        return (html);
    }
    getGrid = () => {
        var size = '8rem';
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