import { createStore, combineReducers } from 'redux'
import { Photos } from "./gPhotos.js";

function reducers(state = 0, action) {
    switch (action.type) {
        case 'INIT': {
            console.log(window.srcs.get())
            var keys = Object.keys(window.srcs.get());
            var sources = [];
            keys.forEach(key => {
                sources.push({ id: key, timeline: { snaps: [], skip: 0, nextPageToken: null, isLoading: false } })
            });
            return ({ sources })
        }
        case 'UPDATE': {
            return action.state
        }
        default:
            return state
    }
}

let store = createStore(reducers);

store.subscribe(() => console.log(store.getState()));

var state = {
    getState: store.getState,
    subscribe: store.subscribe,
    init: function () {
        store.dispatch({ type: 'INIT' })
    },
    timeline: {
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
            snaps.forEach((snap) => {
                var posFound = tl.snaps.find((snp, ind) => {
                    if (snp.taken_on < snap.taken_on) {
                        tl.snaps.splice(ind, 0, snap);
                        return true;
                    }
                    return false;
                })
                if (posFound == undefined) {
                    console.warn("Snap to be added not in scope");
                }
            })
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

    }
}


export default state;