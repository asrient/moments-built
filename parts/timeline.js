import $ from "jquery";
import React, { Component } from "react";

import { BarButton, Loading } from "./global.js";
import { ThumbsGrid } from "./thumbs.js";

import "./timeline.css";
import "./global.css";

class Timeline extends React.Component {
    /** @props : openPage, param, preview, setBar, preview
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { list: null, thumbSize: 11, allLoaded: false };
    }
    componentWillUnmount() {
        this.unsub();
    }
    componentDidMount = () => {
        console.log('tl mounted!')
        this.props.setBar(
            <div id="tl_bar">
                <div></div>
                <div className="center">
                    <BarButton
                        icon="font_minus"
                        onClick={() => {
                            //decrease size
                            var state = this.state;
                            if (state.thumbSize > 3) {
                                state.thumbSize -= 1;
                                this.setState(state);
                            }

                        }} />
                    <BarButton icon="font_plus" onClick={() => {
                        //increase size
                        var state = this.state;
                        if (state.thumbSize < 20) {
                            state.thumbSize += 1;
                            this.setState(state);
                        }
                    }} />
                </div>
                <div className="center tl_bar_opts">
                    <BarButton
                        icon="QuickActions_Add"
                        onClick={() => {
                            window.actions('ADD_SNAP');
                        }} />
                    <BarButton icon="Navigation_Trash" />
                    <BarButton icon="QuickActions_Share" />
                </div>
            </div>)
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
        if (!window.state.isTimelineInit) {
            this.loadMore();
        }
        this.parseState();
    }
    parseState = () => {
        console.log('parsing tl state');
        var _list = window.state.getTimelineList();
        var list = []
        _list.forEach((snap) => {
            var dt = new Date(snap.taken_on);
            snap.date = { day: dt.getUTCDate(), month: dt.getUTCMonth(), year: dt.getUTCFullYear() };
            list.push(snap);
        })
        var allLoaded = window.state.isTimelineLoaded();
        this.setState({ ...this.state, list, allLoaded });
    }
    loadMore = () => {
        if (!window.state.isTimelineLoading) {
            console.log('loading more..')
            window.state.loadTimelineList();
        }
    }
    renderGrids = () => {
        // console.log("rendering grids", this.state.snaps);
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var todate = new Date();
        var today = { day: todate.getUTCDate(), month: todate.getUTCMonth(), year: todate.getUTCFullYear() };
        var html = [];
        var date = null;

        var sections = [];

        var counter = JSON.stringify(today);
        var section = { title: "Today", location: "Somewhere on Earth", date: today, snaps: [] }
        this.state.list.forEach(snap => {
            var takenOn = snap.date;
            if (counter == JSON.stringify(takenOn)) {
                //it belongs to the current section
                //console.log("same sec", takenOn);
                section.snaps.push(snap)
            }
            else {
                //create a new section and flush the old one
                //New day!
                if (section.snaps.length) {
                    sections.push(section);
                    //console.log(section)
                }
                // console.log(JSON.stringify(takenOn));
                counter = JSON.stringify(takenOn);
                var title = takenOn.day + " " + months[takenOn.month];
                if (section.date != undefined && section.date.year != takenOn.year) {
                    //Date from seperate year
                    title = title + " " + takenOn.year;
                }
                section = {
                    title, location: "Somewhere on Earth", snaps: [snap], date: takenOn
                }
            }
        })
        //flush the last sec
        if (section.snaps.length) {
            //console.log(section)
            sections.push(section);
        }
        sections.forEach((sec) => {
            html.push(this.getGrid(sec.snaps, sec.title, sec.location));
        })
        if (!this.state.allLoaded) {
            html.push(<div style={{ margin: '2rem' }} className="center" key='loader' >
                <Loading size="l" onVisible={() => {
                    this.loadMore();
                }} />
            </div>)
        }
        else {
            html.push(<div style={{ margin: '2rem' }} className="center" key='footer' >
                {this.state.list.length}&nbsp;snap(s)
            </div>)
        }
        return html;
    }
    getGrid = (snaps, title, location) => {
        var snapIds = snaps.map((snap) => { return snap.id })
        return ((<ThumbsGrid snapIds={snapIds}
            context="timeline"
            key={title}
            thumbSize={this.state.thumbSize + 'rem'}
            title={title}
            location={location}
            onThumbClick={(id) => {
                window.actions('PREVIEW_SNAP', { id, context: 'timeline' });
            }} />))
    }

    render() {
        if (this.state.list == null) {
            return (
                <div id="welcome" className="center-col">
                    LOADING..
                </div>
            )
        }
        else {
            if (this.state.list.length) {
                return (
                    <div id="tl">
                        <div style={{ overflow: 'auto', padding: '1rem', paddingTop: '7rem' }}>
                            {this.renderGrids()}
                        </div>
                    </div>
                )

            }
            else {
                return (
                    <div id="welcome" className="center-col">
                        <div className="ink-black base-light size-xl">Its lonely here</div>
                        <div className="ink-dark base-semilight size-xs">Add some photos and videos</div>
                        <br />
                        <div className="ink-blue base-regular size-s" onClick={() => {
                            window.actions('ADD_SNAP');
                        }}>Add</div>
                    </div>
                )

            }
        }

    }
}

export default Timeline