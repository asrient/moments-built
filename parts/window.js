import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import { BarButton, Loading } from "./global.js";
import "./window.css";

import AddDev from "./addDev.js";


class AddTag extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tags: [], value: '' }
    }
    parseState() {
        var list = window.state.tags.list();
        var tags = list.map((tag) => {
            return tag.id;
        })
        this.state.tags = tags;
        this.setState(this.state);
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
        if (!window.state.tags.list().length) {
            window.state.tags.getList();
        }
    }
    componentWillUnmount() {
        this.unsub();
    }
    getTags() {
        var html = [];
        html = this.state.tags.map((tagId) => {
            return (<div key={tagId} onClick={()=>{
              this.state.value=tagId;
              this.setState(this.state);
            }} className="at_tag size-xs ink-dark base-semilight">{tagId}</div>)
        })
        if (html.length)
            return (<div className="at_tags">{html}</div>)
    }
    handleChange = (event) => {
        this.state.value = event.target.value;
        this.setState(this.state);
    }
    done=()=> {
        var snapId = this.props.id;
        var tagId=this.state.value;
        tagId=tagId.trim();
        if(tagId!=''){
            window.actions('TAG_SNAP',{snapId,tagId});
        }
        window.actions('CLOSE_WINDOW');
    }
    render() {
        return (<div className="at">
            <div className="center ink-black base-semilight size-m at_title">Tag photo</div>
            <div className="center"><input placeholder="Tag" type="text" className="at_input" value={this.state.value} onChange={this.handleChange} /></div>
            {this.getTags()}
            <div className="at_done_holder"><button onClick={this.done}>Done</button></div>
        </div>)
    }
}

class Window extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { isActive: false, content: null, relay: null }
    }
    parseState() {
        var state = this.state;
        var win = window.state.getState().window;
        state.isActive = win.isActive;
        state.content = win.content;
        state.relay = win.relay;
        this.setState(state);
    }
    componentDidMount() {
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }
    getContent() {
        if (this.state.content == 'ADD_DEVICE') {
            return <AddDev />
        }
        else if (this.state.content == 'ADD_TAG') {
            return <AddTag id={this.state.relay} />
        }
    }
    render() {
        if (!this.state.isActive)
            return (<div></div>)
        else {
            return (<div id="win_holder" className="center">
                <div id="win_bg" onClick={() => {
                    window.state.window.close();
                }}></div>
                <div id="win">{this.getContent()}</div>
            </div>)
        }
    }
}
export default Window;