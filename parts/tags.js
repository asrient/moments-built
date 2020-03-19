import $ from "jquery";
import React, { Component } from "react";

import { BarButton, Loading, Icon } from "./global.js";
import { ThumbsGrid } from "./thumbs.js";

import "./tags.css";
import "./global.css";

class Tags extends React.Component {
    /** @props : openPage, param, preview, setBar, preview
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { page: 'home', tags: [] };
    }
    componentDidMount = () => {
        window.state.tags.getList();
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        this.state.tags = window.state.tags.list();
        /*this.state.tags = [
            { id: "Mountains", snaps: ['local:645dcd53f1', 'local:d46a89a920'], modified_on: 6887 },
            { id: "Birthdays", snaps: ['local:a097e4a321', 'local:ec4e5e8533','local:645dcd53f1'], modified_on: 476 }
        ]*/
        this.setState(this.state);
    }
    showTagList(selected = null) {
        var tags = this.state.tags;
        var html = [];
        tags.forEach((tag) => {
            var cls = "tg_view_list_item";
            if (selected == tag.id) {
                cls += " tg_view_list_item_selected";
            }
            html.push(<div key={tag.id} className="ink-dark base-semilight">
                <div className={cls} onClick={() => {
                    this.state.page = tag.id;
                    this.setState(this.state);
                }}>
                    <div className="center">
                        <Icon className="size-xs" src="common://icons/tag.png" />&nbsp;
            {tag.id}
                    </div>

                    <div>{tag.snaps.length}</div>
                </div>
            </div>)
        })
        return html;
    }
    showGrid(tagId){
        var tagInd=this.state.tags.findIndex((tag)=>{
            return tag.id==tagId;
        })
        if(tagInd>=0){
            var snaps=this.state.tags[tagInd].snaps.map((snapId)=>{
                return({id:snapId})
            })
      return(<ThumbsGrid snaps={snaps} />)
        }
    }
    showPage(tagId) {
        return (<div className="tg_view">
            <div className="tg_view_list">
                <div style={{ padding: "0.5rem 2rem" }} className="ink-black base-regular size-s">Tags</div>
                <div>{this.showTagList(tagId)}</div>
            </div>
            <div>
                <div className="tg_view_head">
                    <div style={{display:'flex',alignItems: "center"}}>
                        <div className="tg_view_back size-s center" onClick={()=>{
                            this.state.page='home';
                            this.setState(this.state);
                        }}><Icon className="size-xs" style={{opacity:0.5}} src="common://icons/Control_GoBack.png" /></div>
                        <div className="size-l ink-black base-regular">{tagId}</div>
                    </div>
                    
                </div>
                <div style={{height:'7.6rem'}}></div>
                    {this.showGrid(tagId)}
            </div>
        </div>)
    }
    showHomeTagList() {
        var tags = this.state.tags;
        var html = [];
        tags.forEach((tag) => {
            html.push(<div key={tag.id} className="center">
                <div className="tg_home_item center-col" onClick={() => {
                    this.state.page = tag.id;
                    this.setState(this.state);
                }}>
                    <div><Icon className="size-m" src="common://icons/tag.png" /></div>
                    <div className="size-s ink-black base-semilight">{tag.id}</div>
                    <div className="size-xs ink-dark base-light">{tag.snaps.length}&nbsp;snaps</div>
                </div>
            </div>)
        })
        return html;
    }
    emptyScreen() {
        return (<div style={{ height: "calc(100vh - 3rem)" }} className="center ink-black base-semilight size-xl">Tag your snaps</div>)
    }
    render() {
        if (this.state.tags.length) {
            if (this.state.page == 'home') {
                return (<div>
                    <div style={{ height: "3rem" }}></div>
                    <div id="tags_home_head" className="ink-black size-xl base-bold">Tags</div>
                    <br />
                    <div className="tg_home_grid">{this.showHomeTagList()}</div>
                </div>)
            }
            else {
                return this.showPage(this.state.page)
            }
        }
        else {
            return this.emptyScreen();
        }

    }
}

export default Tags;