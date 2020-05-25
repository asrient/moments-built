import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import { BarButton, Loading,Icon } from "./global.js";
import "./window.css";

class AddDev extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = {page:'root'}
    }
    componentDidMount(){
    }


    render(){
        if(this.state.page=='root')
        return(<div className="ad center-col">
            <div className="ad_grp center-col">
              <div className="ink-black size-s base-semilight">Connect to Google Photos</div>
              <br/>
            <div><Icon src="assets://icons/google-photos.svg" className="size-xl"/></div>
            <br/>
            <div style={{padding:"0.5rem 1rem"}} className="ink-dark size-xs base-light">
                View all your photos from your Google Photos here.</div>
            <br/>
            <div><button onClick={()=>{
               window.actions('GOOGLE_PHOTOS_LOGIN');
            }}>Log In</button></div>
            </div>
        </div>)
    }
}
export default AddDev;