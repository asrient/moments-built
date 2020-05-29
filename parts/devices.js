const QUERY_LIMIT = 10;

const devices = {};
const devEvents = new EventEmitter();

class Peer {
    constructor() {
        this.type = 'airPeer';
    }
    getTimelineList(skip, cb) {

    }
    getTagsCatalog(cb) {

    }
    getTagsList(tag, cb) {

    }
    getSnapInfo(snapId, cb) {

    }
    getSnapInfoBatch(snapIds, cb) {

    }
    addSnaps(snaps) {

    }
    removeSnaps(snapIds) {

    }
    updateSnap(snap) {

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

    }
    removeSnaps(snapIds) {

    }
    updateSnap(snap) {

    }
}

function addDevice(info) {
    if (devices[info.id] == undefined) {
        var id = info.id;
        if (id == 'local') {
            devices[id] = new Local();
        }
        else if (id = 'gPhotos') {
            devices[id] = new GPhotos();
        }
        else {
            devices[id] = new Peer();
        }
    }
}

class Device {
    constructor(devId) {
        this.devId = devId;
        if (devices[devId] == undefined) {
            console.error('Cannot init device manager, unknown devId');
        }
        this.dev = devices[devId];
    }
    getTimelineList(skip, cb) {
        devices[this.devId].getTimelineList(skip, cb);
    }
    getTagsCatalog(cb) {

    }
    getTagsList(tag, cb) {

    }
    getSnapInfo(snapId, cb) {
        devices[this.devId].getSnapInfo(snapId, cb);
    }
    getSnapInfoBatch(snapIds, cb) {

    }
    addSnaps(snaps) {

    }
    removeSnaps(snapIds) {

    }
    updateSnap(snap) {

    }
}

/**
 * @EVENTS
 * newDevice
 * deviceConnected
 * deviceDisconnected
 * addSnaps
 * removeSnaps
 * updateSnap
 * updateTagsCatalog
 * updateTagsList
 * updateTimelineList
 */

export { Device, devEvents, addDevice };