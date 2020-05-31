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
    isTimelineInit: false,
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
        var dev = new Device(srcId);
        dev.addSnaps(snaps);
    },
    removeSnaps: function (srcId, ids) {
        var dev = new Device(srcId);
        dev.removeSnaps(ids);
    },
    updateSnap: function (snapId, next) {

    },
    loadTimelineList: function () {
        this.isTimelineLoading = true;
        this.isTimelineInit = true;
        var srcIds = getSourceIds();
        var res = {};
        var count = 0;
        var st = store.getState();
        var isDone = false;
        var done = () => {
            var thresholdDate = 0;
            Object.keys(res).forEach((srcId, srcInd) => {
                if (res[srcId].length) {
                    var lastTaken_on = res[srcId][res[srcId].length - 1].taken_on
                    if (!srcInd) {
                        thresholdDate = lastTaken_on;
                    }
                    else {
                        if (lastTaken_on > thresholdDate) {
                            thresholdDate = lastTaken_on;
                        }
                    }
                }
            })
            Object.keys(res).forEach((srcId, srcInd) => {
                if (st.sources[srcId].timeline.list == null) {
                    st.sources[srcId].timeline.list = [];
                }
                res[srcId].forEach((item) => {
                    if (item.taken_on >= thresholdDate) {
                        st.sources[srcId].timeline.skip++;
                        st.sources[srcId].timeline.list.push(item);
                    }
                })
            })
            this.isTimelineLoading = false;
            store.dispatch({ type: 'UPDATE', state: st });
        }
        srcIds.forEach((srcId) => {
            var dev = new Device(srcId);
            if (!st.sources[srcId].timeline.isLoaded) {
                dev.getTimelineList(st.sources[srcId].timeline.skip, (list) => {
                    /**
                     * list format:
                     * [{id:"tre76y",taken_on:5745567567},...]
                     */
                    if (list != null) {
                        if (!list.length) {
                            st.sources[srcId].timeline.isLoaded = true;
                        }
                        res[srcId] = list;
                    }
                    count++;
                    if (count >= srcIds.length && !isDone) {
                        isDone = true;
                        done();
                    }
                })
            }
        })
        window.setTimeout(() => {
            if (!isDone) {
                console.log('tl loader still waiting after 6 secs, finalizing..');
                isDone = true;
                done();
            }
        }, MAX_LOADING_TIME);
    },
    getTimelineList: function () {
        console.log('getting tl list');
        var st = store.getState();
        var srcIds = getSourceIds();
        var list = [];
        srcIds.forEach((srcId) => {
            if (st.sources[srcId].timeline.list != null) {
                st.sources[srcId].timeline.list.forEach((_item) => {
                    var item = { id: srcId + '/' + _item.id, taken_on: _item.taken_on }
                    list.push(item);
                })
            }
        })
        list.sort((a, b) => { return b.taken_on - a.taken_on });
        console.log(list);
        return list;
    },
    isTimelineLoaded: function () {
        var st = store.getState();
        var srcIds = getSourceIds();
        var allLoaded = true;
        srcIds.forEach((srcId) => {
            if (!st.sources[srcId].timeline.isLoaded) {
                allLoaded = false;
            }
        })
        return allLoaded;
    },
    loadTagsCatalog: function () {

    },
    getTagsCatalog: function () {

    },
    loadTagsList: function (tagId) {

    },
    getTagsList: function () {

    },
    loadSnapInfo: function (snapId) {
        var devId = snapId.split('/')[0];
        var snapKey = snapId.split('/')[1];
        var dev = new Device(devId);
        dev.getSnapInfo(snapKey, (snap) => {
            var st = store.getState();
            st.sources[devId].snaps[snapKey] = snap;
            console.log('loading snap info')
            store.dispatch({ type: 'UPDATE', state: st });
        })
    },
    getSnapInfo: function (snapId) {
        console.log('getting snap info')
        var devId = snapId.split('/')[0];
        var snapKey = snapId.split('/')[1];
        var st = store.getState();
        if (st.sources[devId] != undefined) {
            var _snap = st.sources[devId].snaps[snapKey];
            if (_snap != undefined) {
                var snap = JSON.parse(JSON.stringify(_snap));
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
        changeSnap:function(id){
            var s = store.getState();
            if(s.preview.isActive){
                s.preview.id = id;
                store.dispatch({ type: 'UPDATE', state: s });
            }
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
devEvents.on('addTimelineSnaps', (devId, _snaps) => {
    /**
     * Here we only update timeline
     */
    console.log('adding new snaps to timeline');
    var st = store.getState();
    var isChanged = false;
    var snaps = _snaps.map((snap) => {
        return ({ id: snap.id, taken_on: snap.taken_on });
    })
    if (st.sources[devId] != undefined) {
        //make sure tl list is initialised
        if (st.sources[devId].timeline.list != null) {
            var prevList = st.sources[devId].timeline.list;
            if (st.sources[devId].timeline.isLoaded) {
                isChanged = true;
                st.sources[devId].timeline.list = prevList.concat(snaps);
                st.sources[devId].timeline.skip = st.sources[devId].timeline.skip + snaps.length;
            }
            else {
                var lastTakenOn = prevList[prevList.length - 1].taken_on;
                snaps.forEach((snap) => {
                    if (snap.taken_on >= lastTakenOn) {
                        isChanged = true;
                        st.sources[devId].timeline.list.push(snap);
                        st.sources[devId].timeline.skip++;
                    }
                })
            }
            if (isChanged) {
                st.sources[devId].timeline.list.sort((a, b) => {
                    return b.taken_on - a.taken_on;
                })
                console.log('posting changes..', st.sources[devId].timeline.list)
                store.dispatch({ type: 'UPDATE', state: st });
            }
        }
        else {
            console.warn('prevList is null')
        }
    }
})
devEvents.on('removeTimelineSnaps', (devId, snapIds) => {
    console.log('removing snaps from timeline');
    var st = store.getState();
    var isChanged = false;
    if (st.sources[devId] != undefined) {
        var prevList = st.sources[devId].timeline.list;
        if (prevList != null) {
            st.sources[devId].timeline.list = prevList.filter((snap) => {
                if (snapIds.includes(snap.id)) {
                    isChanged = true;
                    st.sources[devId].timeline.skip--;
                    return false;
                }
                else
                    return true;
            })
        }
    }
    if (isChanged) {
        store.dispatch({ type: 'UPDATE', state: st });
    }
})
devEvents.on('updateSnap', () => {

})
devEvents.on('updateTagsCatalog', () => {

})
devEvents.on('updateTagsList', () => {

})

win.webContents.session.protocol.interceptBufferProtocol('resource', (request, callback) => {
    var url = request.url.split('resource://')[1];
    var devId = url.split('/')[0];
    var fileKey = url.split('/')[1];
    var dev = new Device(devId);
    dev.getFile(fileKey, (type, data) => {
        if (type != null) {
            callback(data);
        }
    })
}, (error) => {
    if (error) console.error('Failed to register protocol', error)
})

export default state;