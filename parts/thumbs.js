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
    componentDidMount = () => {
    }
    render() {
        var size = '8rem';
        if (this.props.size != undefined && this.props.size != null) {
            size = this.props.size;
        }
        return (
            <div className="thumb" style={{ "backgroundImage": 'url(' + this.props.src + ')', height: size, width: size }}
                onClick={() => {
                    if (this.props.onClick != undefined) {
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
        this.state = { list: null }
    }
    componentDidMount = () => {

    }
    showThumbs = () => {
        var html = [];
        if (this.props.snaps != undefined && this.props.snaps != null) {
            this.props.snaps.forEach((snap, key) => {
                html.push(<Thumb size={this.props.thumbSize} key={key} src={snap.url} id={snap.id} />)
            })
        }
        return (html);
    }
    getGrid=()=>{
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
        
        if(this.props.title!=undefined){
          return(
              <div>
                  <div>
                      <div className="tg_title ink-black base-regular">{this.props.title}</div>
                      <div  className="tg_location ink-dark base-semilight">{this.props.location} </div>
                  </div>
                  
                  <div>
                      {this.getGrid()}
                  </div>
              </div>
          )
        }
        else{
            return(<div>{this.getGrid()}</div>)
        }
        
    }
}

export { Thumb, ThumbsGrid }