import deleteSnaps from "./deleteSnap.js";

const QUERY_LIMIT = 10;

const devices = {};
const devEvents = new EventEmitter();

class Peer {
    constructor() {
        this.type = 'airPeer';
        /**
         * this.peer=AirSync(info);
         * this.peer.on('request',(req,respond)=>{
         * req.body.parse();
         * const reqType = req.body.type;
         * const catagory = reqType.split(':')[0];
         * const key = reqType.split(':')[1];
         * if(catagory=='UPDATE'){
         * devEvents.emit(key, 'local', req.body.data);
         * }
         * else if(catagory=='ACTION'){
         * ...
         * }
         * else if(catagory=='GET'){
         * ...
         * }
         * else if(catagory=='RESOURCE'){
         * ...
         * }
         * })
         */
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
    getFile(key, cb) {

    }
    update(topic, data) {
        /**
         * this.peer.request({type: 'UPDATE:'+topic, data})
         */
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
        //TODO: emit tags catalog updates
        //TODO: emit tags lists updates
        recs.insert(snaps, () => {
            Object.keys(devices).forEach((devId) => {
                devices[devId].update('addTimelineSnaps', snaps);
            })
        })
    }
    removeSnaps(snapIds) {
        //remove records
        //emit tag cat, tag lists and tl changes events
        deleteSnaps(snapIds, (snaps) => {
            //TODO: emit tags catalog updates
            //TODO: emit tags lists updates
            /**
             * this.getTagsCatalog((catalog)=>{
             * ...
             * ```devices[devId].update('updateTagsCatalog', catalog);```
             * })
             */
            Object.keys(devices).forEach((devId) => {
                devices[devId].update('removeTimelineSnaps', snapIds);
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

function addDevice(info) {
    if (devices[info.id] == undefined) {
        console.log('adding dev', info)
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

export { Device, devEvents, addDevice };