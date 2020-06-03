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
                //...
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
                //...
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

    }
    getTagsList(tag, cb) {

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
    updateSnap(snap) {

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

    }
    getTagsList(tag, cb) {

    }
    getSnapInfo(snapId, cb) {
        recs.findOne({ id: snapId }, (err, snap) => {
            cb(snap);
        })
    }
    getSnapInfoBatch(snapIds, cb) {

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
            Object.keys(devices).forEach((devId) => {
                devices[devId].update('removeTimelineSnaps', snapIds);
                //TODO: emit tags catalog updates
                //TODO: emit tags lists updates
            })
        });
    }
    updateSnap(snap) {

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

    }
    getTagsList(tag, cb) {

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
    updateSnap(snap) {

    }
    getFile(key, cb) {
        this.dev.getFile(key, cb);
    }
}

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