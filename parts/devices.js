import deleteSnaps from "./deleteSnap.js";
import { AirSync, airEvents, airSyncInit, init1, reveal } from "./airSync.js";

const QUERY_LIMIT = 10;

const devices = {};
const devEvents = new EventEmitter();

class Peer extends AirSync {
    constructor(peerId, secret) {
        super(peerId, secret);
        this.type = 'airPeer';
        this.local = devices.local;
        this.on('request', (reqType, data, respond) => {
            const catagory = reqType.split(':')[0];
            const key = reqType.split(':')[1];
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.warn('data could not be parsed', e)
            }
            if (catagory == 'UPDATE') {
                console.warn('UPDATE', reqType, data);
                devEvents.emit(key, this.peerId, data);
                respond(200, 'OK');
            }
            else if (catagory == 'ACTION') {
                if (key == 'addSnaps') {
                    if (data.snaps != undefined) {
                        //TODO: get file, save it then call local addSnaps
                    }
                }
                else if (key == 'removeSnaps') {
                    if (data.snapIds != undefined) {
                        this.local.removeSnaps(data.snapIds);
                    }
                }
                else if (key == 'addTag') {
                    if (data.snapId != undefined && data.tagId != undefined) {
                        this.local.addTag(data.snapId, data.tagId);
                    }
                }
                else if (key == 'removeTag') {
                    if (data.snapId != undefined && data.tagId != undefined) {
                        this.local.removeTag(data.snapId, data.tagId);
                    }
                }
            }
            else if (catagory == 'GET') {
                if (key == 'timelineList') {
                    if (data.skip != undefined) {
                        this.local.getTimelineList(data.skip, (list) => {
                            respond(200, JSON.stringify(list));
                        })
                    }
                }
                else if (key == 'snapInfo') {
                    if (data.snapId != undefined) {
                        this.local.getSnapInfo(data.snapId, (snap) => {
                            respond(200, JSON.stringify(snap));
                        })
                    }
                }
                else if (key == 'tagsCatalog') {
                    this.local.getTagsCatalog((list) => {
                        respond(200, JSON.stringify(list));
                    })
                }
                else if (key == 'tagsList') {
                    if (data.tagId != undefined) {
                        this.local.getTagsList(data.tagId, (list) => {
                            respond(200, JSON.stringify(list));
                        })
                    }
                }
            }
            else if (catagory == 'RESOURCE') {
                this.local.getFile(key, (mime, buff) => {
                    if (mime != null) {
                        respond(200, buff);
                    }
                    else {
                        respond(404, 'Not Found');
                    }
                })
            }
        })
        this.on('connected', (info) => {
            devEvents.emit('deviceConnected', this.peerId, info);
        })
        this.on('sessionUpdate', (info) => {
            devEvents.emit('deviceUpdate', this.peerId, info);
        })
    }
    _getData(topic, reqObj = null, cb = function () { }) {
        if (reqObj != null) {
            reqObj = JSON.stringify(reqObj);
        }
        this.request('GET:' + topic, reqObj, (res) => {
            if (res != null) {
                if (res.status == 200) {
                    res.parseBody();
                    cb(JSON.parse(res.body));
                }
                else {
                    cb(null);
                }
            }
            else {
                cb(null);
            }
        });
        //TODO: Add a timeout for the req, and cb(null)
    }
    _sendAction(topic, reqObj = null) {
        if (reqObj != null) {
            reqObj = JSON.stringify(reqObj);
        }
        this.request('ACTION:' + topic, reqObj);
    }
    getTimelineList(skip = 0, cb) {
        this._getData('timelineList', { skip }, cb);
    }
    getTagsCatalog(cb) {
        this._getData('tagsCatalog', null, cb);
    }
    getTagsList(tagId, cb) {
        this._getData('tagsList', { tagId }, cb);
    }
    getSnapInfo(snapId, cb) {
        this._getData('snapInfo', { snapId }, cb);
    }
    getSnapInfoBatch(snapIds, cb) {

    }
    addSnaps(snaps) {
        this._sendAction('addSnaps', { snaps });
    }
    removeSnaps(snapIds) {
        this._sendAction('removeSnaps', { snapIds });
    }
    addTag(snapId, tagId) {
        this._sendAction('addTag', { snapId, tagId });
    }
    removeTag(snapId, tagId) {
        this._sendAction('removeTag', { snapId, tagId });
    }
    getFile(key, cb) {
        this.request('RESOURCE:' + key, null, (res) => {
            if (res != null) {
                if (res.status == 200) {
                    cb('TYPE', Buffer.from(res.body));
                }
                else {
                    console.error('failed to get resource', res.status, res.body);
                    cb(null);
                }
            }
            else {
                cb(null);
            }
        })
    }
    refresh(){
        this.init2(true);
    }
    update(topic, data) {
        if (typeof data == 'object') {
            data = JSON.stringify(data);
        }
        this.request('UPDATE:' + topic, data);
    }
}

class Local {
    constructor() {
        this.type = 'local';
    }
    getTimelineList(skip, cb) {
        recs.find({}).sort({ taken_on: -1 }).skip(skip).limit(QUERY_LIMIT).exec((err, snaps) => {
            var list = [];
            snaps.forEach(snap => {
                list.push({ id: snap.id, taken_on: snap.taken_on })
            });
            cb(list);
        })
    }
    getTagsCatalog(cb) {
        var catalog = window.tags.get();
        console.log('cat', catalog)
        cb(Object.keys(catalog));
    }
    getTagsList(tagId, cb) {
        recs.find({ 'tags.id': tagId }).sort({ taken_on: -1 }).exec((err, snaps) => {
            var list = [];
            snaps.forEach((snap) => {
                var tag = snap.tags.find((tag) => {
                    return tag.id == tagId;
                })
                list.push({ id: snap.id, added_on: tag.added_on })
            })
            cb(list);
        });
    }
    getSnapInfo(snapId, cb) {
        recs.findOne({ id: snapId }, (err, snap) => {
            cb(snap);
        })
    }
    getSnapInfoBatch(snapIds, cb) {

    }
    _sendUpdate(topic, data) {
        Object.keys(devices).forEach((devId) => {
            devices[devId].update(topic, data);
        })
    }
    addSnaps(snaps) {
        //write record to file
        //emit tag cat, tag lists and tl changes events
        recs.insert(snaps, () => {
            Object.keys(devices).forEach((devId) => {
                devices[devId].update('addTimelineSnaps', snaps);
                //TODO: emit tags catalog updates
                //TODO: emit tags lists updates
            })
        })
    }
    removeSnaps(snapIds) {
        //remove records
        //emit tag cat, tag lists and tl changes events
        deleteSnaps(snapIds, (snaps) => {
            /**
             * this.getTagsCatalog((catalog)=>{
             * ...
             * ```devices[devId].update('updateTagsCatalog', catalog);```
             * })
             */
            var catRemove = [];
            var tagRemoves = {};
            snaps.forEach((snap) => {
                snap.tags.forEach((tag) => {
                    if (window.tags.get(tag.id) == 1) {
                        window.tags.del(tag.id);
                        catRemove.push(tag.id);
                    }
                    else {
                        window.tags.set(tag.id, window.tags.get(tag.id) - 1);
                        if (tagRemoves[tag.id] != undefined) {
                            tagRemoves[tag.id].push(snap.id);
                        }
                        else {
                            tagRemoves[tag.id] = [snap.id];
                        }
                    }
                })
            })
            if (catRemove.length) {
                this._sendUpdate('updateTagsCatalog', { remove: catRemove });
            }
            if (Object.keys(tagRemoves).length) {
                var updates = [];
                Object.keys(tagRemoves).forEach((tagId) => {
                    var snapIds = tagRemoves[tagId];
                    updates.push({ id: tagId, remove: snapIds })
                })
                this._sendUpdate('updateTagsList', updates);
            }
            this._sendUpdate('removeTimelineSnaps', snapIds);
        });
    }
    addTag(snapId, tagId) {
        this.getSnapInfo(snapId, (snap) => {
            if (tagId != undefined) {
                var _tagInd = snap.tags.findIndex((tag) => { return tag.id == tagId });
                if (_tagInd == -1) {
                    //tag dosent already exists, proceed
                    var time = new Date().getTime()
                    snap.tags.push({ id: tagId, added_on: time });
                    recs.update({ id: snapId }, snap, {}, () => {
                        this._sendUpdate('updateSnap', snap);
                    })
                    var catExists = window.tags.has(tagId);
                    if (catExists) {
                        window.tags.set(tagId, window.tags.get(tagId) + 1);
                    }
                    else {
                        window.tags.set(tagId, 1);
                        this._sendUpdate('updateTagsCatalog', { add: [tagId] });
                    }
                    this._sendUpdate('updateTagsList', [{ id: tagId, add: [{ id: snapId, added_on: time }] }]);
                }
                else {
                    console.error("not adding tag, already tagged with the tagId", tagId);
                }
            }
        })
    }
    removeTag(snapId, tagId) {
        this.getSnapInfo(snapId, (snap) => {
            if (tagId != undefined) {
                var _tagInd = snap.tags.findIndex((tag) => { return tag.id == tagId });
                if (_tagInd >= 0) {
                    //tag dosent already exists, proceed
                    var time = new Date().getTime()
                    snap.tags.splice(_tagInd, 1);
                    recs.update({ id: snapId }, snap, {}, () => {
                        this._sendUpdate('updateSnap', snap);
                    })
                    var catCount = window.tags.get(tagId);
                    if (catCount > 1) {
                        window.tags.set(tagId, window.tags.get(tagId) - 1);
                    }
                    else {
                        //it was the only snap in the cat
                        window.tags.del(tagId);
                        this._sendUpdate('updateTagsCatalog', { remove: [tagId] });
                    }
                    this._sendUpdate('updateTagsList', [{ id: tagId, remove: [snapId] }]);
                }
                else {
                    console.error("not removing tag, not tagged with the tagId", tagId);
                }
            }
        })
    }
    getFile(key, cb) {
        var url = window.resources.getPath(key);
        if (url != null) {
            var type = MIME.lookup(url);
            fs.readFile(url, (err, data) => {
                if (data != null) {
                    cb(type, data);
                }
                else {
                    cb(null)
                }
            })
        }
        else {
            cb(null)
        }
    }
    refresh(){
        //Nothing to refresh from local, empty func is intentional
    }
    update(topic, body) {
        // send update to this device
        devEvents.emit(topic, 'local', body);
    }
}

class GPhotos {

}

function addDevice(id, secret) {
    if (devices[id] == undefined) {
        if (id == 'local') {
            devices[id] = new Local();
        }
        else if (id == 'gPhotos') {
            devices[id] = new GPhotos();
        }
        else {
            devices[id] = new Peer(id, secret);
        }
    }
}

airEvents.on('init1', (info) => {
    devEvents.emit('newDevice', info);
})

class Device {
    constructor(devId) {
        this.devId = devId;
        if (devices[devId] == undefined) {
            console.error('Cannot init device manager, unknown devId', devId);
        }
        this.dev = devices[devId];
    }
    getTimelineList(skip, cb) {
        this.dev.getTimelineList(skip, cb);
    }
    getTagsCatalog(cb) {
        this.dev.getTagsCatalog(cb);
    }
    getTagsList(tagId, cb) {
        this.dev.getTagsList(tagId, cb);
    }
    getSnapInfo(snapId, cb) {
        this.dev.getSnapInfo(snapId, cb);
    }
    getSnapInfoBatch(snapIds, cb) {

    }
    addSnaps(snaps) {
        this.dev.addSnaps(snaps);
    }
    removeSnaps(snapIds) {
        this.dev.removeSnaps(snapIds);
    }
    addTag(snapId, tagId) {
        this.dev.addTag(snapId, tagId);
    }
    removeTag(snapId, tagId) {
        this.dev.removeTag(snapId, tagId);
    }
    getFile(key, cb) {
        this.dev.getFile(key, cb);
    }
    refresh(){
        this.dev.refresh();
    }
}

/**
 * @updateTagsList
 * [
 *  {
 *    id: tagId
 *    add: [{},...],
 *    remove: [snapId,...]
 *  },
 *  ...
 * ]
 */

/**
 * @EVENTS
 * newDevice
 * deviceConnected
 * deviceDisconnected
 * addTimelineSnaps
 * removeTimelineSnaps
 * updateSnap
 * updateTagsCatalog
 * updateTagsList
 */

export { Device, devEvents, addDevice, airSyncInit, init1, reveal };