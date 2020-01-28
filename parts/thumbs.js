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
        this.state = {}
    }
    componentDidMount=()=>{
    }
    render() {
        var size='8rem';
        if(this.props.size!=undefined&&this.props.size!=null){
         size=this.props.size;
        }
        return(
            <div className="thumb" style={{"backgroundImage":'url('+this.props.src+')',height:size,width:size}} 
            onClick={()=>{
                if(this.props.onClick!=undefined){
                    this.props.onClick(this.props.src);
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
        this.state = {list:null}
    }
    componentDidMount=()=>{
       
    }
    showThumbs=()=>{
        var html=[];
        if(this.props.paths!=undefined&&this.props.paths!=null){
            this.props.paths.forEach((pth,key)=>{
                html.push(<Thumb size={this.props.thumbSize} key={key} src={'files://media/'+pth} />)
             })
        }
    return(html);
    }
    render() {
        var size='8rem';
        if(this.props.thumbSize!=undefined){
         size=this.props.thumbSize;
        }
        return(
              <div className="thumbs_grid"
              style={{gridTemplateColumns:'repeat(auto-fill,minmax('+size+', 1fr))'}}
              >  {this.showThumbs()} </div>
            )
    }
}

export {Thumb,ThumbsGrid}