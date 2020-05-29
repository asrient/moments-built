
const devices = {};
const devEvents = new EventEmitter();

class Local {
    constructor() {
        this.type = 'local';
    }
    getTimelineList(cb, skip, token) {

    }
    getTagsCatalog(cb) {

    }
    getTagsList(cb) {

    }
    getSnapInfo(sanpId, cb) {

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

class Peer {
    constructor() {
        this.type = 'airPeer';
    }
    getTimelineList(cb, skip, token) {

    }
    getTagsCatalog(cb) {

    }
    getTagsList(cb) {

    }
    getSnapInfo(sanpId, cb) {

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

}

class Device {
    constructor(devId) {
        this.devId = devId;
        if (devices[devId] == undefined) {
            console.error('Cannot init device manager, unknown devId');
        }
        this.dev = devices[devId];
    }
    getTimelineList(cb, skip, token) {

    }
    getTagsCatalog(cb) {

    }
    getTagsList(cb) {

    }
    getSnapInfo(sanpId, cb) {

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