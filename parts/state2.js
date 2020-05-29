import { createStore } from 'redux'
import { Photos } from "./gPhotos.js";
import { Device, devEvents, addDevice } from "./devices.js";

function reducers(state = 0, action) {
    switch (action.type) {
        case 'INIT': {
            var keys = Object.keys(window.srcs.get());
            var sources = [];
            keys.forEach(key => {
                if (window.srcs.get(key + '.isActive'))
                    sources.push({
                        id: key,
                        snaps: {},
                        timeline: { list: null, skip: 0, isLoaded: false },
                        tags: null
                    })
                //TODO: initialize device manger, devices.add(key,)
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

var state = {
    getState: store.getState,
    subscribe: store.subscribe,
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

    },
    getTimelineList: function () {

    },
    loadTagsCatalog: function () {

    },
    getTagsCatalog: function () {

    },
    loadTagsList: function () {

    },
    getTagsList: function () {

    },
    loadSnapInfo: function (sanpId) {

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