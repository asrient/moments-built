import { createStore } from 'redux'
import { Photos } from "./gPhotos.js";
import { Device, devEvents, addDevice } from "./devices.js";

const MAX_LOADING_TIME = 6000;

function reducers(state = 0, action) {
    switch (action.type) {
        case 'INIT': {
            var keys = Object.keys(window.srcs.get());
            var sources = {};
            keys.forEach(key => {
                if (window.srcs.get(key + '.isActive'))
                    sources[key] = {
                        id: key,
                        sessionId: null,
                        snaps: {},
                        timeline: { list: null, skip: 0, isLoaded: false },
                        tags: null
                    }
                addDevice(window.srcs.get(key));
            });
            return ({
                nav: { page: 'timeline', relay: null },
                sources,
                preview: { isActive: false, id: null, context: null },
                window: { isActive: false, content: null, relay: null }
            })
        }
        case 'UPDATE': {
            return action.state
        }
        default:
            return state
    }
}

let store = createStore(reducers);

function getSourceIds() {
    var st = store.getState();
    return Object.keys(st.sources);
}

var state = {
    getState: store.getState,
    subscribe: store.subscribe,
    isTimelineLoading: false,
    init: function () {
        store.dispatch({ type: 'INIT' })
    },
    openPage: function (page, relay) {
        var data = store.getState();
        data.nav.page = page;
        data.nav.relay = relay;
        store.dispatch({ type: 'UPDATE', state: data });
    },
    addSnaps: function (srcId, snaps) {

    },
    removeSnaps: function (srcId, ids) {

    },
    updateSnap: function (snapId, next) {

    },
    loadTimelineList: function () {
        var srcIds = getSourceIds();
        var res = {};
        var count = 0;
        var st = store.getState();
        var isDone = false;
        var done = () => {
            var thresholdDate = 0;
            Object.keys(res).forEach((srcId, srcInd) => {
                var lastTaken_on = res[srcId][res[srcId].length - 1].taken_on
                if (!srcInd) {
                    thresholdDate = lastTaken_on;
                }
                else {
                    if (lastTaken_on > thresholdDate) {
                        thresholdDate = lastTaken_on;
                    }
                }
            })
            Object.keys(res).forEach((srcId, srcInd) => {
                res[srcId].forEach((item) => {
                    if (item.taken_on >= thresholdDate) {
                        st.sources[srcId].timeline.skip++;
                        if (st.sources[srcId].timeline.list != null) {
                            st.sources[srcId].timeline.list.push(item);
                        }
                        else {
                            st.sources[srcId].timeline.list = item;
                        }
                    }
                })
            })
            store.dispatch({ type: 'UPDATE', state: st });
        }
        srcIds.forEach((srcId) => {
            var dev = new Device(srcId);
            if (!st.sources[srcId].timeline.isLoaded) {
                dev.loadTimelineList(st.sources[srcId].timeline.skip, (list) => {
                    /**
                     * list format:
                     * [{id:"tre76y",taken_on:5745567567},...]
                     */
                    if (list != null) {
                        if (!list.length) {
                            st.sources[srcId].timeline.isLoaded = true;
                        }
                        else {
                            res[srcId] = list;
                        }
                    }
                    count++;
                    if (count >= srcIds.length && !isDone) {
                        isDone = true;
                        done();
                    }
                })
            }
        })
        this.window.setTimeout(() => {
            if (!isDone) {
                console.log('tl loader still waiting after 6 secs, finalizing..');
                isDone = true;
                done();
            }
        }, MAX_LOADING_TIME);
    },
    getTimelineList: function () {
        var st = store.getState();
        var srcIds = getSourceIds();
        var list = [];
        srcIds.forEach((srcId) => {
            st.sources[srcId].list.forEach((item) => {
                item.id = srcId + '/' + item.id;
                list.push(item);
            })
        })
        list.sort((a, b) => { return b.taken_on - a.taken_on });
        return list;
    },
    loadTagsCatalog: function () {

    },
    getTagsCatalog: function () {

    },
    loadTagsList: function () {

    },
    getTagsList: function () {

    },
    loadSnapInfo: function (snapId) {
        var devId = snapId.split('/')[0];
        var snapKey = snapId.split('/')[1];
        var dev = new Device(devId);
        dev.getSnapInfo(snapKey,(snap)=>{
            var st = store.getState();
            st.sources[devId].snaps[snapKey]=snap;
            store.dispatch({ type: 'UPDATE', state: st });
        })
    },
    getSnapInfo: function (snapId) {
        var devId = snapId.split('/')[0];
        var snapKey = snapId.split('/')[1];
        var st = store.getState();
        if (st.sources[devId] != undefined) {
            var snap = st.sources[devId].snaps[snapKey];
            if (snap != undefined) {
                snap.id = snapId;
                snap.file_key = devId + '/' + snap.file_key;
                snap.thumbnail_key = devId + '/' + snap.thumbnail_key;
                return snap;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },
    preview: {
        open: function (id, context = null) {
            var s = store.getState();
            s.preview.isActive = true;
            s.preview.id = id;
            s.preview.context = context;
            store.dispatch({ type: 'UPDATE', state: s });
        },
        close: function () {
            var s = store.getState();
            s.preview.isActive = false;
            s.preview.id = null;
            s.preview.context = null;
            store.dispatch({ type: 'UPDATE', state: s });
        }
    },
    window: {
        open: function (content, relay) {
            var s = store.getState();
            s.window.isActive = true;
            s.window.content = content;
            s.window.relay = relay;
            store.dispatch({ type: 'UPDATE', state: s });
        },
        close: function () {
            var s = store.getState();
            s.window.isActive = false;
            s.window.content = null;
            s.window.relay = null;
            store.dispatch({ type: 'UPDATE', state: s });
        }
    }
}

devEvents.on('newDevice', () => {

})
devEvents.on('deviceConnected', () => {

})
devEvents.on('deviceDisconnected', () => {

})
devEvents.on('addSnaps', () => {

})
devEvents.on('removeSnaps', () => {

})
devEvents.on('updateSnap', () => {

})
devEvents.on('updateTagsCatalog', () => {

})
devEvents.on('updateTagsList', () => {

})
devEvents.on('updateTimelineList', () => {

})


export default state;