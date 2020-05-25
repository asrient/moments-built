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
    componentWillUnmount(){
        this.unsub();
    }
    componentDidMount = () => {
        window.state.tags.getList();
        this.parseState();
        this.unsub=window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var data = window.state.getState();
        if (data.nav.page == 'tags') {
            if (data.nav.relay != null) {
                this.state.page = data.nav.relay;
            }
            this.state.tags = window.state.tags.list();
        }
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
                        <Icon className="size-xs" src="assets://icons/tag.png" />&nbsp;
            {tag.id}
                    </div>

                    <div>{tag.snaps.length}</div>
                </div>
            </div>)
        })
        return html;
    }
    showGrid(tagId) {
        var tagInd = this.state.tags.findIndex((tag) => {
            return tag.id == tagId;
        })
        if (tagInd >= 0) {
            var snaps = this.state.tags[tagInd].snaps.map((snap) => {
                //console.log(snap)
                return ({ id: snap.id, thumb: snap.thumb_url, type: snap.type })
            })
            return (<ThumbsGrid snaps={snaps} context={'tag:' + tagId} onThumbClick={(id) => {
                window.actions('PREVIEW_SNAP', { id, context: 'tag:' + tagId })
            }} />)
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
                    <div style={{ display: 'flex', alignItems: "center" }}>
                        <div className="tg_view_back size-s center" onClick={() => {
                            this.state.page = 'home';
                            this.setState(this.state);
                        }}><Icon className="size-xs" style={{ opacity: 0.5 }} src="assets://icons/Control_GoBack.png" /></div>
                        <div className="size-l ink-black base-regular">{tagId}</div>
                    </div>

                </div>
                <div style={{ height: '7.6rem' }}></div>
                <div style={{ padding: '0.7rem' }}>
                    {this.showGrid(tagId)}
                </div>
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
                    <div><Icon className="size-m" src="assets://icons/tag.png" /></div>
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