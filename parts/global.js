import $ from "jquery";
import React, { Component } from "react";
import Switch from 'react-ios-switch';

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
        if (this.props.icon != undefined) {
            return (<div className="bar_butt_icon"
                style={{ backgroundImage: 'url(assets://icons/' + this.props.icon + '.png)' }}></div>)
        }
    }
    render() {
        var style={};
        if(this.props.rounded){
            style.borderRadius='0.8rem';
        }
        var cls="center bar_butt";
        if(this.props.selected){
            cls+=' bar_butt_selected';
        }
        return (  
                <div className={cls} style={style} onClick={() => {
                    if (this.props.onClick != undefined) {
                        this.props.onClick();
                    }
                }}>{this.getContent()}</div>
        )
    }
}
class Loading extends React.Component {
    /** @props : openPage, param, preview, setBar
     ** 
     **/
    constructor(props) {
        super(props);
        var dt = new Date();
        this.state = { id: "spinner" + dt.getTime() }
    }
    componentDidMount() {
        if (this.props.onVisible != undefined) {
            var observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting === true)
                    this.props.onVisible();
            }, { threshold: [1] });

            observer.observe(document.querySelector('#' + this.state.id))
        }
    }
    render() {
        var cls = "ispinner gray animating";
        if (this.props.size == 'l') {
            cls = cls + " large"
        }
        return (
            <div className={cls} id={this.state.id}  >

                <div className="ispinner-blade" key="1" ></div>

                <div className="ispinner-blade" key="2" ></div>

                <div className="ispinner-blade" key="3" ></div>

                <div className="ispinner-blade" key="4" ></div>

                <div className="ispinner-blade" key="5" ></div>

                <div className="ispinner-blade" key="6" ></div>

                <div className="ispinner-blade" key="7" ></div>

                <div className="ispinner-blade" key="8" ></div>

                <div className="ispinner-blade" key="9" ></div>

                <div className="ispinner-blade" key="10" ></div>

                <div className="ispinner-blade" key="11" ></div>

                <div className="ispinner-blade" key="12" ></div>

            </div>

        )
    }
}

class Icon extends React.Component{
    render(){
        return(
            <img src={this.props.src} onClick={()=>{
                if(this.props.onClick!=undefined){
                    this.props.onClick();
                }
            }} className={"icon "+this.props.className} style={this.props.style}/>
        )
    }
    }
    
    Icon.defaultProps={
        src:"common://icons/TabBar_Favorites.png",style:{background:"transperent"},className:" "
    }

export { BarButton, Loading, Icon, Switch }