import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import { BarButton, Loading } from "./global.js";
import "./preview.css";

class Preview extends React.Component {
    /** @props : src onClick
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = {isActive:false}
    }
    componentDidMount = () => {
        this.props.openFunc((id)=>{
            //show the preview now
           this.open(id);
        })
    }
    open=(id)=>{
        var state=this.state;
        state.id=id;
        this.state.isActive=true;
        recs.findOne({id:this.state.id},(err,snap)=>{
            state.snap=snap;
            this.setState(state);
           })
    }
    getTitle=()=>{
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var dt=new Date(this.state.snap.taken_on);
        var date =   dt.getUTCDate()+" "+ months[dt.getUTCMonth()]+" "+  dt.getUTCFullYear();
        var hr=dt.getHours();
        var min=dt.getMinutes();
        var suffix="AM";
        if(hr>12||(hr==12&&min>0)){
          suffix="PM";
          if(hr>12){
              hr-=12;
          }
        }
        if(min<10){
            min="0"+min;
        }
        var time = hr+":"+min+" "+suffix;
        return(<div>{time+", "+date}</div>)
    }
    getView=()=>{
        return(<div className="pv_picView" style={{backgroundImage:"url("+this.state.snap.url+")"}}></div>)
    }
    render(){
        if(this.state.isActive){
        return(<div className="pv_window">
            <div className="pv_head">
                <div className="pv_nohandle center" style={{marginLeft:'5rem'}}>
                   <BarButton icon="Control_GoBack" onClick={()=>{
                       //closing preview
                       var state=this.state;
                       state.isActive=false;
                       this.setState(state);
                   }}/>
                </div>
                <div className="pv_handle center base-regular size-xs">{this.getTitle()}</div>
                <div className="pv_nohandle center">
                    <BarButton icon="Control_Info"/><BarButton icon="Control_Share"/>
                </div>
            </div>
                <div className="center pv_body">{this.getView()}</div>
            </div>)  
        }
      else{
          return(<div></div>)
      }
    }
}

export default Preview;