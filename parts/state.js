import { createStore } from 'redux'
import { Photos } from "./gPhotos.js";
import { Device, devEvents, addDevice, airSyncInit, init1, reveal } from "./devices.js";

const MAX_LOADING_TIME = 6000;

function getUrl(url) {
    return url.split('*').join('.')
}

function setUrl(url) {
    return url.split('.').join('*')
}

function reducers(state = 0, action) {
    switch (action.type) {
        case 'INIT': {
            var keys = Object.keys(window.srcs.get());
            var sources = {};
            keys.forEach(key => {
                var devId = getUrl(key);
                var info = window.srcs.get(key);
                sources[devId] = {
                    id: devId,
                    isActive: true,
                    info,
                    sessionId: null,
                    snaps: {},
                    timeline: { list: null, skip: 0, isLoaded: false },
                    tags: null
                }
                console.log('setting up device', devId);
                addDevice(devId, info.secret);
            });
            var st = ({
                info: window.info.get(),
                nav: { page: 'timeline', relay: null },
                sources,
                thumbSize: 11,
                localPeers: {},
                preview: { isActive: false, id: null, context: null },
                window: { isActive: false, content: null, relay: null }
            })
            if (st.info.uid == undefined) {
                st.nav = { page: 'welcome', relay: null }
            }
            return st;
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
    timelineLoadCount: 0,
    isTagsCatalogInit: false,
    isTimelineInit: false,
    reduceThumbSize: function () {
        var st = store.getState();
        if (st.thumbSize > 3) {
            st.thumbSize -= 1;
            store.dispatch({ type: 'UPDATE', state: st });
        }
    },
    increaseThumbSize: function () {
        var st = store.getState();
        if (st.thumbSize < 20) {
            st.thumbSize += 1;
            store.dispatch({ type: 'UPDATE', state: st });
        }
    },
    getThumbSize: function () {
        return store.getState().thumbSize;
    },
    init: function () {
        var info = window.info.get();
        if (info.uid != undefined && info.host != undefined) {
            airPeer.start(info.uid, info.host, 'moments', info.username + ':' + info.devicename);
            airSyncInit(airPeer);
        }
        store.dispatch({ type: 'INIT' });
    },
    init0: function (dat) {
        if (dat.icon == undefined) {
            dat.icon = 'default'
        }
        if (dat.username == undefined) {
            dat.username = 'user'
        }
        if (dat.devicename == undefined) {
            dat.devicename = 'device'
        }
        window.info.set('uid', dat.uid);
        window.info.set('host', dat.host);
        window.info.set('username', dat.username);
        window.info.set('devicename', dat.devicename);
        window.info.set('icon', dat.icon);
        if (dat.uid != undefined && dat.host != undefined) {
            airPeer.start(dat.uid, dat.host, 'moments', dat.username + ':' + dat.devicename);
            airSyncInit(airPeer);
        }
        store.dispatch({ type: 'INIT' });
    },
    init1,
    reveal,
    refreshDevice: function (devId) {
        if (devId != 'local') {
            var dev = new Device(devId);
            dev.refresh();
        }
    },
    parseAirId: function (airId) {
        var ids = airId.split(':');
        return {
            uid: ids[0],
            host: ids[1],
            sessionId: ids[2]
        }
    },
    addLocalPeer: function (peer) {
        var airId = peer.uid + ':' + peer.host + ':' + peer.sessionId;
        var st = store.getState();
        //if (airId != airPeer.getMyAirIds().local) {
        st.localPeers[airId] = {
            username: peer.name.split(':')[0],
            devicename: peer.name.split(':')[1],
            uid: peer.uid,
            host: peer.host,
            sessionId: peer.sessionId,
            icon: peer.icon
        }
        store.dispatch({ type: 'UPDATE', state: st });
        //}
    },
    removeLocalPeer: function (peer) {
        var airId = peer.uid + ':' + peer.host + ':' + peer.sessionId;
        var st = store.getState();
        delete st.localPeers[airId];
        store.dispatch({ type: 'UPDATE', state: st });
    },
    getLocalPeers: function (cb) {
        var st = store.getState();
        var list = [];
        var len = Object.keys(st.localPeers).length;
        var counter = 0;
        Object.keys(st.localPeers).forEach((airId) => {
            var ids = this.parseAirId(airId);
            var peerId = ids.uid + ':' + ids.host;
            var data = {
                uid: st.localPeers[airId].uid,
                host: st.localPeers[airId].host,
                sessionId: st.localPeers[airId].sessionId,
                icon: st.localPeers[airId].icon,
                username: st.localPeers[airId].username,
                devicename: st.localPeers[airId].devicename,
                isAdded: true
            }
            if (st.sources[peerId] == undefined) {
                //new unknown device
                data.isAdded = false;
            }
            else {
                data.icon = st.sources[peerId].info.icon;
            }
            list.push(data);
            counter++;
            if (counter >= len) {
                cb(list);
            }

        })
        if (!len) {
            cb([]);
        }
    },
    activateDevice: function (devId) {
        var st = store.getState();
        if (st.sources[devId] != undefined) {
            st.sources[devId].isActive = true;
            store.dispatch({ type: 'UPDATE', state: st });
        }
    },
    deactivateDevice: function (devId) {
        var st = store.getState();
        if (st.sources[devId] != undefined) {
            st.sources[devId].isActive = false;
            store.dispatch({ type: 'UPDATE', state: st });
        }
    },
    getDeviceInfo1: function (devId) {
        /**
         * returns formatted info
         */
        var st = store.getState();
        if (st.sources[devId] != undefined) {
            var name = null;
            var _icon = null;
            var isActive = st.sources[devId].isActive;
            if (devId == 'local') {
                name = st.info.devicename;
                _icon = st.info.icon;
            }
            else if (devId == 'gPhotos') {/////
                name = st.sources[devId].info.devicename;
                _icon = st.sources[devId].info.icon;
            }/////
            else {
                var info = st.sources[devId].info;
                name = info.devicename;
                _icon = info.icon;
            }
            var icon = "assets://icons/SystemEntity_Computer.png";
            if (_icon != 'default') {
                icon = `assets://avatars/${_icon}.png`;
            }
            return ({ icon, name, isActive })
        }
        else {
            return null;
        }
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
    tagSnap: function (devId, snapId, tagId) {
        var dev = new Device(devId);
        dev.addTag(snapId, tagId);
    },
    untagSnap: function (devId, snapId, tagId) {
        var dev = new Device(devId);
        dev.removeTag(snapId, tagId);
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
            this.timelineLoadCount++;
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
            else {
                count++;
            }
        })
        window.setTimeout(() => {
            if (!isDone) {
                console.warn('tl loader still waiting after 6 secs, finalizing..');
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
            if (st.sources[srcId].isActive) {
                if (st.sources[srcId].timeline.list != null) {
                    st.sources[srcId].timeline.list.forEach((_item) => {
                        var item = { id: srcId + '/' + _item.id, taken_on: _item.taken_on }
                        list.push(item);
                    })
                }
            }
        })
        list.sort((a, b) => { return b.taken_on - a.taken_on });
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
        /**
         * we only load those devIds that is not init yet (null)
         */
        this.isTagsCatalogInit = true;
        var srcIds = getSourceIds();
        var st = store.getState();
        srcIds.forEach((devId) => {
            if (st.sources[devId].tags == null) {
                //will load this one
                console.log('getting tags catalog for:', devId);
                var dev = new Device(devId);
                dev.getTagsCatalog((list) => {
                    /**
                     * @list
                     * [tagId,...]
                     */
                    if (list != null) {
                        var _st = store.getState();
                        _st.sources[devId].tags = {};
                        list.forEach((tagId) => {
                            _st.sources[devId].tags[tagId] = null;
                        })
                        store.dispatch({ type: 'UPDATE', state: _st });
                    }
                })
            }
        })
    },
    getTagsCatalog: function () {
        /**
        * @list
        * [tagId,...]
        */
        var srcIds = getSourceIds();
        var st = store.getState();
        var list = [];
        srcIds.forEach((devId) => {
            if (st.sources[devId].tags != null) {
                Object.keys(st.sources[devId].tags).forEach((tagId) => {
                    if (!list.includes(tagId)) {
                        list.push(tagId);
                    }
                })
            }
        })
        return list;
    },
    loadTagsList: function (tagId) {
        console.log('loading tag list', tagId);
        var srcIds = getSourceIds();
        var st = store.getState();
        srcIds.forEach((devId) => {
            if (st.sources[devId].tags != null && st.sources[devId].tags[tagId] == null) {
                var dev = new Device(devId);
                dev.getTagsList(tagId, (list) => {
                    console.log('got tag list', list);
                    if (list != null) {
                        var _st = store.getState();
                        _st.sources[devId].tags[tagId] = list;
                        store.dispatch({ type: 'UPDATE', state: _st });
                    }
                })
            }
        })
    },
    getTagsList: function (tagId) {
        var srcIds = getSourceIds();
        var st = store.getState();
        var list = [];
        srcIds.forEach((devId) => {
            if (st.sources[devId].tags != null && st.sources[devId].tags[tagId] != null && st.sources[devId].tags[tagId] != undefined) {
                st.sources[devId].tags[tagId].forEach(snap => {
                    list.push({ id: devId + '/' + snap.id, added_on: snap.added_on });
                })
            }
        })
        list.sort((a, b) => { return b.added_on - a.added_on });
        return list;
    },
    loadSnapInfo: function (snapId) {
        var devId = snapId.split('/')[0];
        var snapKey = snapId.split('/')[1];
        var dev = new Device(devId);
        dev.getSnapInfo(snapKey, (snap) => {
            var st = store.getState();
            st.sources[devId].snaps[snapKey] = snap;
            store.dispatch({ type: 'UPDATE', state: st });
        })
    },
    getSnapInfo: function (snapId) {
        var devId = snapId.split('/')[0];
        var snapKey = snapId.split('/')[1];
        var st = store.getState();
        if (st.sources[devId] != undefined) {
            if (st.sources[devId].isActive) {
                var _snap = st.sources[devId].snaps[snapKey];
                if (_snap != undefined) {
                    var snap = { ..._snap };
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
        changeSnap: function (id) {
            var s = store.getState();
            if (s.preview.isActive) {
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
    },
    updatePeer: function (devId, updates) {
        var willUpdate = false;
        var s = store.getState();
        if (updates.sessionId != undefined && s.sources[devId].sessionId != updates.sessionId) {
            console.log('updating peer', updates.sessionId, s.sources[devId].sessionId);
            s.sources[devId].sessionId = updates.sessionId;
            willUpdate = true;
        }
        if (updates.username != undefined && s.sources[devId].info.username != updates.username) {
            console.log('updating peer', updates.username, s.sources[devId].info.username);
            s.sources[devId].info.username = updates.username;
            window.srcs.set(setUrl(devId) + '.username', updates.username);
            willUpdate = true;
        }
        if (updates.devicename != undefined && s.sources[devId].info.devicename != updates.devicename) {
            console.log('updating peer', updates.devicename, s.sources[devId].info.devicename);
            s.sources[devId].info.devicename = updates.devicename;
            window.srcs.set(setUrl(devId) + '.devicename', updates.devicename);
            willUpdate = true;
        }
        if (updates.icon != undefined && s.sources[devId].info.icon != updates.icon) {
            console.log('updating peer', updates.icon, s.sources[devId].info.icon);
            s.sources[devId].info.icon = updates.icon;
            window.srcs.set(setUrl(devId) + '.icon', updates.icon);
            willUpdate = true;
        }
        if (willUpdate) {
            store.dispatch({ type: 'UPDATE', state: s });
        }
    }
}

devEvents.on('newDevice', (info) => {
    console.log('NEW DEVICE');
    /**
     * @info
     * uid
     * host
     * username
     * devicename
     * icon
     * secret
     */
    info.type = 'airPeer'
    var s = store.getState();
    var peerId = info.uid + ':' + info.host;
    window.srcs.set(setUrl(peerId), info);
    addDevice(peerId, info.secret);
    s.sources[peerId] = {
        id: peerId,
        isActive: true,
        info,
        sessionId: null,
        snaps: {},
        timeline: { list: null, skip: 0, isLoaded: false },
        tags: null
    }
    store.dispatch({ type: 'UPDATE', state: s });
})
devEvents.on('deviceConnected', (devId, updates) => {
    console.warn('DEVICE CONNECTED', devId, updates);
    /**
     * ## if the tl page is still on early (first) load, we load it again forcefully.
     * not done for count > 3 for the sake of UX, (done automatically when user is ready to load more)
     * TODO: reload tags list and cat, if the current page is such
     */
    state.updatePeer(devId, updates);
    if (state.timelineLoadCount < 3) {
        console.warn("loading tl again after new dev");
        state.loadTimelineList();
    }
    var st = store.getState();
    if (st.nav.page == 'tags') {
        state.loadTagsCatalog();
        if (st.nav.relay != null) {
            state.loadTagsList(st.nav.relay);
        }
    }
})
devEvents.on('deviceUpdate', (devId, updates) => {
    state.updatePeer(devId, updates);
})
devEvents.on('deviceDisconnected', () => {

})
devEvents.on('addTimelineSnaps', (devId, _snaps) => {
    /**
     * Here we only update timeline
     */
    //console.log('adding new snaps to timeline',_snaps);
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
                store.dispatch({ type: 'UPDATE', state: st });
            }
        }
        else {
            console.warn('prevList is null')
        }
    }
})
devEvents.on('removeTimelineSnaps', (devId, snapIds) => {
    //console.warn('removing snap from state',devId,snapIds)
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
devEvents.on('updateSnap', (devId, snap) => {
    var st = store.getState();
    var snapId = snap.id;
    st.sources[devId].snaps[snapId] = snap;
    store.dispatch({ type: 'UPDATE', state: st });
})
devEvents.on('updateTagsCatalog', (devId, updates) => {
    /**
     * @updates
     * add: [tagId,...]
     * remove: [tagId,...]
     */
    var st = store.getState();
    if (st.sources[devId].tags != null) {
        if (updates.add != undefined) {
            updates.add.forEach(tagId => {
                st.sources[devId].tags[tagId] = null;
            })
        }
        if (updates.remove != undefined) {
            updates.remove.forEach(tagId => {
                delete st.sources[devId].tags[tagId];
            })
        }
        store.dispatch({ type: 'UPDATE', state: st });
    }
})
devEvents.on('updateTagsList', (devId, updates) => {
    /**
     * @updates
     * [
     *  {
     *    id: tagId
     *    add: [{},...],
     *    remove: [snapId,...]
     *  },
     *  ...
     * ]
     */
    var st = store.getState();
    if (st.sources[devId].tags != null) {
        updates.forEach((update) => {
            var tagId = update.id;
            if (st.sources[devId].tags[tagId] != undefined && st.sources[devId].tags[tagId] != null) {
                if (update.add != undefined) {
                    st.sources[devId].tags[tagId] = st.sources[devId].tags[tagId].concat(update.add);
                }
                else if (update.remove != undefined) {
                    st.sources[devId].tags[tagId] = st.sources[devId].tags[tagId].filter((snap) => {
                        return !update.remove.includes(snap.id);
                    })
                }
            }
        })
        store.dispatch({ type: 'UPDATE', state: st });
    }
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

airPeer.on('localPeerFound', (peer) => {
    if (peer.app == 'moments')
        state.addLocalPeer(peer);
})

airPeer.on('localPeerRemoved', (peer) => {
    if (peer.app == 'moments')
        state.removeLocalPeer(peer);
})

export default state;