import $ from "jquery";
import React, { Component } from "react";

import "./global.css"

class BarButton extends React.Component {
    /** @props : openPage, param, preview, setBar
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = {}
    }
    getContent = () => {
     if(this.props.icon!=undefined){
         return(<div className="bar_butt_icon" 
         style={{backgroundImage:'url(common://icons/'+this.props.icon+'.png)'}}></div>)
     }
    }
    render() {
        return (<div className="center bar_butt" onClick={() => {
            if (this.props.onClick != undefined) {
                this.props.onClick();
            }
        }}>{this.getContent()}</div>)
    }
}

export { BarButton }