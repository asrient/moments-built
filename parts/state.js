import { createStore, combineReducers } from 'redux'
import { Photos } from "./gPhotos.js";

function reducers(state = 0, action) {
    switch (action.type) {
        case 'INIT': {
            var keys = Object.keys(window.srcs.get());
            var sources = [];
            keys.forEach(key => {
                if(window.srcs.get(key+'.isActive'))
                sources.push({ id: key, timeline: { snaps: [], skip: 0, nextPageToken: null, isLoading: false } })
                else
                console.log("src inactive",key);
            });
            console.log(sources);
            return ({ sources, preview: { isActive: false, id: null, context: null }, window: { isActive: false, content: null, relay: null } })
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
    timeline: {
        snaps: function (snapBuilder, loaderBuilder) {
            var data = store.getState();
            var snaps = [];
            data.sources.forEach((src, srcInd) => {
                src.timeline.snaps.forEach((snap, snpInd) => {
                    var newSnap = snap;
                    if (snapBuilder != undefined) {
                        newSnap = snapBuilder(snap);
                    }
                    newSnap.taken_on = snap.taken_on;
                    var lastSnp = false;
                    if (snpInd == src.timeline.snaps.length - 1) {
                        lastSnp = true;
                    }
                    var posFound = snaps.find((snp, ind) => {
                        if (snp.taken_on < snap.taken_on) {
                            snaps.splice(ind, 0, newSnap);
                            if (lastSnp) {
                                if (loaderBuilder != undefined) {
                                    var loader = loaderBuilder(src.id);
                                    snaps.splice(ind + 1, 0, loader);
                                }
                            }
                            return true;
                        }
                        return false;
                    })
                    if (posFound == undefined) {
                        snaps.push(newSnap);
                        if (lastSnp) {
                            if (loaderBuilder != undefined) {
                                var loader = loaderBuilder(src.id);
                                snaps.push(loader)
                            }
                        }
                    }
                })
            })
            return snaps;
        },
        addSnaps: function (srcId = 'local', snaps) {
            var s = store.getState();
            var srcInd = null;
            var src = s.sources.find((source, ind) => {
                if (source.id == srcId) {
                    srcInd = ind;
                    return true;
                }
                return false;
            })
            var tl = src.timeline;
            var nos = 0;
            snaps.forEach((snap) => {
                var posFound = tl.snaps.find((snp, ind) => {
                    if (snp.taken_on < snap.taken_on) {
                        tl.snaps.splice(ind, 0, snap);
                        nos++;
                        //console.log("snap added at",ind);
                        return true;
                    }
                    return false;
                })
                if (posFound == undefined) {
                    console.warn("Snap to be added not in scope");
                }
            })
            s.sources[srcInd].timeline.skip += nos;
            s.sources[srcInd].timeline = tl;
            store.dispatch({ type: 'UPDATE', state: s });
        },
        removeSnaps: function (srcId = 'local', snaps) {
            var s = store.getState();
            var srcInd = null;
            var src = s.sources.find((source, ind) => {
                if (source.id == srcId) {
                    srcInd = ind;
                    return true;
                }
                return false;
            })
            var tl = src.timeline;
            snaps.forEach((snap) => {
                var posFound = tl.snaps.find((snp, ind) => {
                    if (snp.id == snap) {
                        tl.snaps.splice(ind, 1);
                        return true;
                    }
                    return false;
                })
                if (posFound == undefined) {
                    console.warn("Snap to be removed not in scope");
                }
            })
            s.sources[srcInd].timeline = tl;
            store.dispatch({ type: 'UPDATE', state: s });
        },
        getSnaps: function (srcId = 'local') {
            var s = store.getState();
            if (srcId == 'local') {
                var srcInd = null;
                var local = s.sources.find((source, ind) => {
                    if (source.id == 'local') {
                        srcInd = ind;
                        return true;
                    }
                    return false;
                })
                var tl = local.timeline;
                recs.find({}).sort({ taken_on: -1 }).skip(tl.skip).limit(10).exec((err, data) => {
                    tl.skip = tl.skip + data.length;
                    tl.snaps = tl.snaps.concat(data);
                    s.sources[srcInd].timeline = tl;
                    store.dispatch({ type: 'UPDATE', state: s });
                })
                // console.log(tl,local);
            }
            else {
                if (window.srcs.get(srcId + ".type") == 'cloud/google') {
                    var photos = new Photos(srcId);
                    var srcInd = null;
                    var cloud = s.sources.find((source, ind) => {
                        if (source.id == srcId) {
                            srcInd = ind;
                            return true;
                        }
                        return false;
                    })
                    var tl = cloud.timeline;
                    if (!tl.isLoading) {
                        tl.isLoading = true;
                        s.sources[srcInd].timeline = tl;
                        store.dispatch({ type: 'UPDATE', state: s });
                        photos.getLibrary(tl.nextPageToken, (snaps, token) => {
                            tl.snaps = tl.snaps.concat(snaps);
                            tl.nextPageToken = token;
                            tl.isLoading = false;
                            s.sources[srcInd].timeline = tl;
                            store.dispatch({ type: 'UPDATE', state: s });
                        });
                    }
                    else {
                        console.warn("Loading already in progress");
                    }
                }
            }
        }
    },
    addSnaps: function (srcId, snaps) {
        this.timeline.addSnaps(srcId, snaps);
        //update other catagories like tags here
    },
    removeSnaps: function (srcId, ids) {
        this.timeline.removeSnaps(srcId, ids);
        //update other catagories like tags here
    },
    updateSnap: function (prev, next) {

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


export default state;