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
        this.state = { page: null, catalog: [], list: [], thumbSize: 11 };
    }
    componentWillUnmount() {
        this.unsub();
    }
    componentDidMount = () => {
        window.state.loadTagsCatalog();
        var data = window.state.getState();
        if (data.nav.page == 'tags' && data.nav.relay != null) {
            window.state.loadTagsList(data.nav.relay);
        }
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var data = window.state.getState();
        if (data.nav.page == 'tags') {
            this.state.page = data.nav.relay;
            this.state.catalog = window.state.getTagsCatalog();
            if (this.state.page != null) {
                this.state.list = window.state.getTagsList(this.state.page);
            }
        }
        this.state.thumbSize = data.thumbSize;
        this.setState(this.state);
    }
    changePage(tagId = null) {
        if (tagId != null) {
            window.state.loadTagsList(tagId);
        }
        window.state.openPage('tags', tagId);
    }
    showTagList(selected = null) {
        var tags = this.state.catalog;
        var html = [];
        tags.forEach((tag) => {
            var cls = "tg_view_list_item";
            if (selected == tag) {
                cls += " tg_view_list_item_selected";
            }
            html.push(<div key={tag} className="ink-secondary base-semilight">
                <div className={cls} onClick={() => {
                    this.changePage(tag);
                }}>
                    <div className="center">
                        <Icon className="size-xs" src="assets://icons/tag.png" />&nbsp;
            {tag}
                    </div>
                </div>
            </div>)
        })
        return html;
    }
    showGrid() {
        var tagId = this.state.page;
        var snapIds = this.state.list.map((snap) => { return snap.id })
        return (<ThumbsGrid snapIds={snapIds}
            context={'tag:' + tagId}
            thumbSize={this.state.thumbSize + 'rem'}
            onThumbClick={(id) => {
                window.actions('PREVIEW_SNAP', { id, context: 'tag:' + tagId })
            }} />)
    }
    showPage() {
        var tagId = this.state.page;
        return (<div className="tg_view">
            <div className="tg_view_list">
                <div style={{ padding: "0.5rem 2rem" }} className="ink-primary base-regular size-s">Tags</div>
                <div>{this.showTagList(tagId)}</div>
            </div>
            <div style={{overflow: 'auto'}}>
                <div className="tg_view_head">
                    <div style={{ display: 'flex', alignItems: "center" }}>
                        <div className="tg_view_back size-s center" onClick={() => {
                            this.changePage(null);
                        }}><Icon className="size-xs" style={{ opacity: 0.5 }} src="assets://icons/Control_GoBack.png" /></div>
                        <div className="size-l ink-primary base-regular">{tagId}</div>
                    </div>

                </div>
                <div style={{ height: '7.6rem' }}></div>
                <div style={{ padding: '0.7rem' }}>
                    {this.showGrid()}
                </div>
            </div>
        </div>)
    }
    showHomeTagList() {
        var tags = this.state.catalog;
        var html = [];
        tags.forEach((tag) => {
            html.push(<div key={tag} className="center">
                <div className="tg_home_item center-col" onClick={() => {
                    this.changePage(tag);
                }}>
                    <div><Icon className="size-m" src="assets://icons/tag.png" /></div>
                    <div className="size-s ink-primary base-semilight">{tag}</div>
                </div>
            </div>)
        })
        return html;
    }
    emptyScreen() {
        return (<div style={{ height: "calc(100vh - 2.8rem)" }} className="center ink-primary base-semilight size-xl">Tag your snaps</div>)
    }
    render() {
        if (this.state.catalog.length) {
            if (this.state.page == null) {
                return (<div>
                    <div style={{ height: "2.8rem" }}></div>
                    <div id="tags_home_head" className="ink-primary size-xl base-bold">Tags</div>
                    <br />
                    <div className="tg_home_grid">{this.showHomeTagList()}</div>
                </div>)
            }
            else {
                return this.showPage()
            }
        }
        else {
            return this.emptyScreen();
        }

    }
}

export default Tags;