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
        return(
            <div className="thumb" style={{"backgroundImage":'url('+this.props.src+')'}}></div>
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
        var state=this.state;
        state.list=[];
        for(var i=1;i<=15;i++){
            state.list.push("files://media/1.jpg");
        }
        this.setState(state);
    }
    showThumbs=()=>{
        var html=[];
        if(this.props.paths!=undefined&&this.props.paths!=null){
            this.props.paths.forEach((pth,key)=>{
                html.push(<Thumb key={key} src={'files://media/'+pth} />)
             })
        }
    return(html);
    }
    render() {
        return(
              <div className="thumbs_grid">  {this.showThumbs()} </div>
            )
    }
}

export {Thumb,ThumbsGrid}