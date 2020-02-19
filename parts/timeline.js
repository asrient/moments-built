import $ from "jquery";
import React, { Component } from "react";

import { BarButton, Loading } from "./global.js";
import { ThumbsGrid } from "./thumbs.js";

import addSnap from "./addSnap.js";

import "./timeline.css";
import "./global.css";

class Timeline extends React.Component {
    /** @props : openPage, param, preview, setBar, preview
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = { count: null, sections: [], thumbSize: 11, showCount: 0 };
    }
    componentDidMount = () => {
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
                            addSnap((c, snaps) => {
                                console.log('new snaps', c);
                                if (c)
                                    this.addSnaps(snaps);
                            });
                        }} />
                    <BarButton icon="Navigation_Trash" />
                    <BarButton icon="QuickActions_Share" onClick={() => { this.getSnaps() }} />
                </div>
            </div>)
        recs.count({}, (err, count) => {
            var state = this.state;
            state.count = count;
            console.log(state);
            this.setState(state);
        })
        this.getSnaps();
    }
    addSnaps = (snaps, allowNewSec) => {
        if (allowNewSec == undefined) {
            allowNewSec = true;
        }
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var todate = new Date();
        var today = { day: todate.getUTCDate(), month: todate.getUTCMonth(), year: todate.getUTCFullYear() };
        var state = this.state;
        if (snaps.length == undefined) {
            //its a single snap
            snaps = [snaps];
        }
        snaps.forEach((snap) => {
            var dt = new Date(snap.taken_on);
            var takenOn = { day: dt.getUTCDate(), month: dt.getUTCMonth(), year: dt.getUTCFullYear() };
            if (state.sections.length) {
                var secInd = 0;
                var isSorted = false;
                var reqSec = state.sections.find((sec, ind) => {
                    if (JSON.stringify(sec.date) == JSON.stringify(takenOn)) {
                        secInd = ind;
                        return true;
                    }
                    else {

                        if (takenOn.year < sec.date.year) {
                            secInd = ind + 1;
                        }
                        else if (takenOn.year == sec.date.year) {
                            if (takenOn.month < sec.date.month) {
                                secInd = ind + 1;
                            }
                            else if (takenOn.month == sec.date.month) {
                                if (takenOn.day < sec.date.day) {
                                    secInd = ind + 1;
                                }
                            }
                        }

                        return false;
                    }
                })
                if (secInd != null) {
                    if (reqSec != undefined) {
                        //sec already exists, add here
                        var newSnap = { url: snap.url, id: snap.id, date: takenOn, time: dt.getTime() }
                        var posFound = state.sections[secInd].snaps.find((snp, ind) => {
                            if (snp.time < dt.getTime()) {
                                state.sections[secInd].snaps.splice(ind, 0, newSnap);
                                return true;
                            }
                            return false;
                        })
                        if (posFound == undefined) {
                            state.sections[secInd].snaps.push(newSnap);
                        }
                    }
                    else {
                        if (allowNewSec) {
                            //create new sec
                            var title = takenOn.day + " " + months[takenOn.month];
                            if (state.sections[secInd - 1] != undefined && state.sections[secInd - 1].date.year != takenOn.year) {
                                //Date from seperate year
                                title = title + " " + takenOn.year;
                            }
                            var sec = {
                                title, location: "Somewhere on Earth", snaps: [
                                    { url: snap.url, id: snap.id, date: takenOn, time: dt.getTime() }
                                ], date: takenOn
                            }
                            if (JSON.stringify(sec.date) == JSON.stringify(today)) {
                                sec.title == "Today"
                            }
                            state.sections.splice(secInd, 0, sec);
                        }
                        else { console.log("Snap to be loaded later"); }
                    }
                }
                else {
                    console.error("err: index of sec is null");
                }
            }
            else {
                //create first section
                var title = takenOn.day + " " + months[takenOn.month];
                var sec = {
                    title, location: "Somewhere on Earth", snaps: [
                        { url: snap.url, id: snap.id, date: takenOn }
                    ], date: takenOn
                }
                if (JSON.stringify(sec.date) == JSON.stringify(today)) {
                    sec.title == "Today"
                }
                state.sections = [sec];
            }
        })
        this.setState(state);
    }
    getSnaps = () => {
        //this.sortByDays(from);
        var state = this.state;
        recs.find({}).sort({ taken_on: -1 }).skip(this.state.showCount).limit(10).exec((err, data) => {
            state.showCount += data.length;
            this.setState(state);
            this.addSnaps(data);
        })
    }
    /*sortByDays = (from) => {
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var state = this.state;
        if(from==0){
            state.sections=[];
            state.showCount=0;
        }
        console.log("sorting..",state.showCount);
        recs.find({}).sort({ taken_on: -1 }).skip(state.showCount).limit(10).exec((err, data) => {
            var sections = this.state.sections;
            var todate = new Date();
            var today = { day: todate.getUTCDate(), month: todate.getUTCMonth(), year: todate.getUTCFullYear() };
           
            if(sections[sections.length-1]==undefined){
                var section = { title: "Today", location: "Somewhere on Earth", date: today, snaps: [] }
                var counter = JSON.stringify(today);
            }
            else{
                var section = sections[sections.length-1]
                var counter = JSON.stringify(section.date);
            }

            state.showCount+=data.length;

            data.forEach(snap => {
                var dt = new Date(snap.taken_on);
                var takenOn = { day: dt.getUTCDate(), month: dt.getUTCMonth(), year: dt.getUTCFullYear() };
                if (counter == JSON.stringify(takenOn)) {
                    //it belongs to the current section
                    section.snaps.push({ url: snap.url, id: snap.id })
                }
                else {
                    //create a new section and flush the old one
                    //New day!
                    if (section.snaps.length) {
                        console.log("flushing sec",section.title)
                        if(sections[sections.length-1]!=undefined&&(JSON.stringify(section.date)==JSON.stringify(sections[sections.length-1].date))){
                            console.log("appending last sec",section);
                            sections[sections.length-1]=section;
                        }
                        else{
                            sections.push(section);
                        }
                    }
                    counter = JSON.stringify(takenOn);
                    var title = takenOn.day + " " + months[takenOn.month];
                    if(section.date.year!=takenOn.year){
                        //Date from seperate year
                        title=title+" "+takenOn.year;
                    }
                    section = {
                        title, location: "Somewhere on Earth", snaps: [
                            { url: snap.url, id: snap.id }
                        ], date: takenOn
                    }
                }
            })
            //flush the last sec
            if (section.snaps.length) {
                if(sections[sections.length-1]!=undefined&&(JSON.stringify(section.date)==JSON.stringify(sections[sections.length-1].date))){
                    sections[sections.length-1]=section;
                }
                else{
                    sections.push(section);
                }
            }
            
            state.sections = sections;
            this.setState(state);
        })
    }*/
    sortViews = (view="months") => {
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var html = [];
        var date = null;
        var sec = null;
        this.state.sections.forEach((s, key) => {
            var orgDt=JSON.stringify(s.date);
            if (key == 0) {
                date = s.date;
                delete date.day;
                var title = months[s.date.month];
                if(view=="years"){
                    console.log("sorting by years");
                    delete date.month;
                    title=date.year;
                }
                sec = { title, snaps: s.snaps, date }
            }
            else {
                delete s.date.day;
                if(view=="years"){
                    delete s.date.month;
                }
                if (JSON.stringify(date) == JSON.stringify(s.date)) {
                    //same sec
                    sec.snaps = sec.snaps.concat(s.snaps);
                }
                else {
                    //create new sec, nd flush old one
                    html.push(<ThumbsGrid snaps={sec.snaps} key={key} thumbSize={this.state.thumbSize + 'rem'} title={sec.title} 
                    onThumbClick={(id)=>{
                        this.props.preview(id)
                    }}  />);
                    
                    var title = months[s.date.month];
                    if(s.date.year!=date.year){
                        //mention year
                        title+=" "+s.date.year;
                    }
                    date = s.date;
                    if(view=="years"){
                        delete date.month;
                        title=date.year;
                    }
                    sec = { title, snaps: s.snaps, date }
                }
            }
            s.date=JSON.parse(orgDt);
        })
        //flush last sec
        html.push(<ThumbsGrid snaps={sec.snaps} key={'last'} thumbSize={this.state.thumbSize + 'rem'} title={sec.title} onThumbClick={(id)=>{
            this.props.preview(id)
        }} />);
        return html;
    }
    getSections = () => {
        var html = [];
        if (this.state.thumbSize > 8) {
            this.state.sections.forEach((sec, key) => {
                html.push(<ThumbsGrid snaps={sec.snaps} key={key} thumbSize={this.state.thumbSize + 'rem'} title={sec.title} location={sec.location} onThumbClick={(id)=>{
                    this.props.preview(id)
                }} />)
            })
        }
        else if (this.state.thumbSize > 3) {
            html = this.sortViews("months");
        }
        else {
            html = this.sortViews("years");
        }
        html.push(
            <div style={{ margin: '2rem' }} className="center" key="loading" >
                <Loading size="l" onVisible={() => {
                    this.getSnaps();
                }} />
            </div>
        )
        return (html)
    }
    render() {
        if (this.state.count == null) {
            return (
                <div id="welcome" className="center-col">
                    LOADING..
         </div>
            )
        }
        else {
            if (this.state.count) {

                return (
                    <div id="tl">
                        <div id="tl_sidebar"></div>
                        <div style={{ overflow: 'auto', padding: '1rem', paddingTop: '7rem' }}>
                            {this.getSections()}
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
                            addSnap((c, snaps) => {
                                console.log('new snaps', c)
                                if (c)
                                    this.addSnaps(snaps);
                            });
                        }}>Add</div>
                    </div>
                )

            }
        }

    }
}

export default Timeline