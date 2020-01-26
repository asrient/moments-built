import $ from "jquery";
import React, { Component } from "react";

import {BarButton} from "./global.js";
import {ThumbsGrid} from "./thumbs.js";

import impSnap from "./addSnap.js";

import "./timeline.css";
import "./global.css";

var recs=null;
var addSnap=null;

class Timeline extends React.Component {
    /** @props : openPage, param, preview, setBar
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = {count:null,paths:null};
    }
    componentDidMount=()=>{
        this.props.setBar(
        <div id="tl_bar">
        <div></div>
        <div className="center tl_bar_opts">
            <BarButton onClick={()=>{
                addSnap((c)=>{
                    console.log('new snaps',c)
                    this.getThumbPaths();
                });
            }}/><BarButton/><BarButton/>
        </div>
        </div>)
       recs.count({},(err,count)=>{
            var state=this.state;
            state.count=count;
            console.log(state);
            this.setState(state);
    })
    this.getThumbPaths();
    }
    getThumbPaths=()=>{
        recs.find({},(err,data)=>{
            var locs=[]
        data.forEach(snap => {
            locs.push(snap.path);
        });
        console.log('total images:',data.length);
        var state=this.state;
        state.paths=locs;
        this.setState(state);
        })
    }
    render() {
        if(this.state.count==null){
            return(
              <div id="welcome" className="center-col">
           LOADING..
         </div>  
            )
        }
        else{
            if(this.state.count){
               
                return(
                    <div id="tl">
                        <div id="tl_sidebar"></div>
                        <div style={{overflow:'auto',padding:'1rem',paddingTop:'5rem'}}>
                           { <ThumbsGrid paths={this.state.paths} /> } 
                        </div>
                    </div>
                )
               
            }
            else{
                return(
                    <div id="welcome" className="center-col">
                  <div className="ink-black base-light size-xl">Its lonely here</div>
                  <div className="ink-dark base-semilight size-xs">Add some photos and videos</div>
                  <br/>
                  <div className="ink-blue base-regular size-s" onClick={()=>{
                      addSnap((c)=>{
                        console.log('new snaps',c)
                        this.getThumbPaths();
                      });
                  }}>Add</div>
               </div> 
                )
              
            }
        }

    }
}

function init(r){
recs=r;
addSnap=impSnap(recs);
return Timeline;
}

export default init