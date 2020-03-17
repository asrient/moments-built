import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import { BarButton, Loading } from "./global.js";
import "./window.css";

import AddDev from "./addDev.js";

class Window extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = {isActive:false,content:null,relay:null}
    }
    parseState(){
        var state=this.state;
      var win=window.state.getState().window;
      state.isActive=win.isActive;
      state.content=win.content;
      state.relay=win.relay;
      this.setState(state);
    }
    componentDidMount(){
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }
    getContent(){
        if(this.state.content=='ADD_DEVICE'){
            return <AddDev/>
        }
    }
    render(){
        if(!this.state.isActive)
        return(<div></div>)
        else{
            return(<div id="win_holder" className="center">
                <div id="win_bg" onClick={()=>{
                    window.state.window.close();
                }}></div>
                <div id="win">{this.getContent()}</div>
            </div>)
        }
    }
}
export default Window;