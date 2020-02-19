import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";

import Timeline from "./parts/timeline.js";
import Preview from "./parts/preview.js";

import "./styles.css";

opener=function(){
console.error("opener not initialized yet");
}

class Switcher extends React.Component {
        /** @props : change, selected
     **/
    constructor(props) {
        super(props);
        this.state = {}
    }
    change=(pg)=>{
        if(this.props.selected!=pg) {
            this.props.change(pg)
        }
    }
    getSwitch=(id,name)=>{
     if(id==this.props.selected){
         return( <div className="switch center active_switch">{name}</div>)
     }
     else{
        return( <div className="switch center" onClick={()=>{this.change(id)}}>{name}</div>)
     }
    }
    render() {
        return (
            <div className="switches ink-black">
                {this.getSwitch('timeline','Timeline')}
                {this.getSwitch('places','Places')}
                {this.getSwitch('people','People')}
                {this.getSwitch('albums','Albums')}
            </div>
        )
    }
}

const allPages=['timeline','places','people','albums']

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {pageBarHtml:null,currentPage:'timeline',relayToPage:null}
    }
    getPageBar=()=>{
    if(this.state.pageBarHtml!=null){
        return(
             <div id="pagebar">
             {this.state.pageBarHtml}
             </div>
        )
    }
    else{
        return('')
    }
    }
    setPageBar=(html)=>{
     if(html==undefined){
         html=null;
     }
     var state=this.state;
     state.pageBarHtml=html;
     this.setState(state);
    }
    setPage=(page,relay)=>{
     if(allPages.includes(page)){
        this.state.currentPage=page;
        this.state.pageBarHtml=null;
        if(relay==undefined){
            relay=null;
        }
        this.state.relayToPage=relay;
        this.setState(this.state);
     }
     else{
         console.error('invalid page to set');
     }
    }
    getPage=()=>{
        if(this.state.currentPage=='timeline'){
           return(<Timeline setBar={this.setPageBar} openPage={this.setPage} preview={opener} param={this.state.relayToPage} />)
        }
        else if(this.state.currentPage=='places'){
          return(<div className="center" style={{height:'100vh',fontSize:'80vh'}}>🗺</div>)
        }
        else{
            return(<div className="center" style={{height:'16rem'}}>🚧</div>)
        }
    }

    render() {
        return (
            <div>
            <div id="head">
             <div id="menubar">
                 <div id="handle1" className="handle"></div>
              <div className="center"><Switcher change={this.setPage} selected={this.state.currentPage} /></div>
              <div className="handle"></div>
             </div>
            {this.getPageBar()}
            </div>
            <div>
             {this.getPage()}
            </div>
            </div>
        )
    }
}



ReactDOM.render(
         <div>
         <Nav />
         <Preview openFunc={(open)=>{
            opener=open;
         }} />
    </div>
   , document.getElementById('root')
);

