import { createStore, combineReducers } from 'redux'
import { Photos } from "./gPhotos.js";

function reducers(state = 0, action) {
    switch (action.type) {
        case 'INIT': {
            var keys = Object.keys(window.srcs.get());
            var sources = [];
            keys.forEach(key => {
                if (window.srcs.get(key + '.isActive'))
                    sources.push({
                        id: key,
                        timeline: { snaps: [], skip: 0, nextPageToken: null, isLoading: false },
                        tags: {}
                    })
            });
            return ({
                nav:{page:'timeline',relay:null},
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
    openPage:function(page,relay){
        var data = store.getState();
        data.nav.page=page;
        data.nav.relay=relay;
        store.dispatch({ type: 'UPDATE', state: data });
    },
    tags: {
        list: function () {
            var list = [];
            var data = store.getState();
            data.sources.forEach((src, srcInd) => {
                Object.keys(src.tags).forEach((tagId) => {
                    var ind = list.findIndex((tag) => {
                        return tag.id == tagId
                    })
                    if (ind < 0) {
                        //add this tag, not in the list
                        src.tags[tagId].id = tagId;
                        list.push(src.tags[tagId]);
                    }
                    else {
                        //already in the list, add snaps
                        list[ind].snaps = list[ind].snaps.concat(src.tags[tagId].snaps);
                        if (list[ind].modified_on < src.tags[tagId].modified_on) {
                            list[ind].modified_on = src.tags[tagId].modified_on;
                        }
                    }
                })
            })
            list.sort((a, b) => {
                return a.modified_on - b.modified_on;
            })
            return list;
        },
        getList: function (only = null) {
            var data = store.getState();
            //console.log("getting list", window.tags.get());
            data.sources.forEach((srcd, srcInd) => {

                if (only == null || only == srcd.id) {
                    //console.log("getting ", srcd.id);
                    var src = window.srcs.get(srcd.id);
                    if (src.type == 'local') {
                        var tags = window.tags.clone();

                        var noTags = Object.keys(tags).length;
                        Object.keys(tags).forEach((tagId, tagInd) => {
                            //console.log(tagId, tags[tagId].snaps);
                            var snaps = tags[tagId].snaps;
                            var snapRecs = [];
                            var len = snaps.length;
                            var count = 0;
                            snaps.forEach((snapId) => {
                                recs.findOne({ id: snapId }, (err, snap) => {
                                    if (snap != null) {
                                        snapRecs.push(snap);
                                    }
                                    if (count >= len - 1) {
                                        //last snap
                                        tags[tagId].snaps = snapRecs;
                                        if (tagInd == noTags - 1) {
                                            //last tag
                                            data = store.getState();
                                            //console.log(tags);
                                            data.sources[srcInd].tags = tags;
                                            store.dispatch({ type: 'UPDATE', state: data });
                                        }
                                    }
                                    count++;
                                })
                            })
                        })
                    }
                    else {
                        //for other sources
                    }
                }

            })
        },
        updateList: function (srcId = 'local') {
            //update a tag of a particular source
            //use it after formation of a new tag or deletion of an existing one
            //can also be used after renaming a tag or changing its properties like color or icon
            console.log("DECRIPETED: use addSnaps/ removeSnaps instead")
            this.getList(srcId)
        },
        tagSnap: function (snap, tagId) {
            //use it to add a snap to tag snaps
            console.log("DECRIPETED: use addSnaps instead")
            var srcId = snap.id.split(':')[0];
            var data = store.getState();
            var srcInd = data.sources.findIndex((src) => {
                return (srcId == src.id)
            })
            if (srcInd >= 0) {
                if (data.sources[srcInd].tags[tagId] != undefined) {
                    if (data.sources[srcInd].tags[tagId].snaps != null) {
                        data.sources[srcInd].tags[tagId].snaps.push(snap);
                        store.dispatch({ type: 'UPDATE', state: data });
                    }
                }
            }
        },
        addSnaps: function (snaps) {
            var data = store.getState();
            snaps.forEach((snap) => {
                var srcId = snap.id.split(':')[0];
                var srcInd = data.sources.findIndex((src) => {
                    return (srcId == src.id)
                })
                if (srcInd >= 0) {
                    snap.tags.forEach((tagId) => {
                        if (data.sources[srcInd].tags[tagId] != undefined) {
                            var snapInd = data.sources[srcInd].tags[tagId].snaps.findIndex((snp) => {
                                return (snp.id == snap.id)
                            })
                            if (snapInd < 0) {
                                //snap not in the tag list yet
                                data.sources[srcInd].tags[tagId].snaps.push(snap);
                            }
                            else {
                                console.error("add snap to tag: snap already in the list, not adding again.");
                            }
                        }
                        else {
                            //tag not in the list, create new tag
                            var dt = new Date();
                            data.sources[srcInd].tags[tagId] = { snaps: [snap], modified_on: dt.getTime() }
                        }
                    })

                }
            })
            store.dispatch({ type: 'UPDATE', state: data });
        },
        removeSnaps: function (snapIds) {
            var data = store.getState();
            snapIds.forEach((snapId) => {
                var srcId = snapId.split(':')[0];
                var srcInd = data.sources.findIndex((src) => {
                    return (srcId == src.id)
                })
                Object.keys(data.sources[srcInd].tags).forEach((tagId) => {
                    data.sources[srcInd].tags[tagId].snaps = data.sources[srcInd].tags[tagId].snaps.filter((snap) => {
                        return (snapId != snap.id)
                    })
                    if (!data.sources[srcInd].tags[tagId].snaps.length) {
                        //it was the last item and its removed, remove the tag
                        console.log("last item is removed, remove the tag");
                        delete data.sources[srcInd].tags[tagId];
                    }
                })
            })
            store.dispatch({ type: 'UPDATE', state: data });
        },
        untagSnap: function (snapId, tagId) {
            console.log("DECRIPETED: use removeSnaps instead")
            //use it to remove a snap from tag snaps
            var srcId = snapId.split(':')[0];
            var data = store.getState();
            var srcInd = data.sources.findIndex((src) => {
                if (srcId == src.id)
                    return true
                else
                    return false
            })
            if (srcInd >= 0) {
                if (data.sources[srcInd].tags[tagId] != undefined) {
                    if (data.sources[srcInd].tags[tagId].snaps != null) {
                        var snapInd = data.sources[srcInd].tags[tagId].snaps.findIndex((snap) => {
                            return (snap.id == snapId)
                        })
                        if (snapInd >= 0) {
                            data.sources[srcInd].tags[tagId].snaps.splice(snapInd, 1);
                        }
                        store.dispatch({ type: 'UPDATE', state: data });
                    }
                }
            }
        }
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
        this.tags.removeSnaps(ids);
    },
    updateSnap: function (snapId, next) {
        var srcId = snapId.split(':')[0];
        this.timeline.removeSnaps(srcId, [snapId]);
        this.tags.removeSnaps([snapId]);
        this.timeline.addSnaps(srcId, [next]);
        this.tags.addSnaps([next]);
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