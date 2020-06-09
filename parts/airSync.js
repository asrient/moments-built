const airEvents = new EventEmitter();

var air = null;
var username = null;
var devicename = null;
var icon = null;

function code(n = 5) {
    return crypto.randomBytes(n).toString('hex');
}

function parseAirId(airId) {
    var ids = airId.split(':');
    return {
        uid: ids[0],
        host: ids[1],
        sessionId: ids[2]
    }
}

const seperator = ";;";
const sepLen = Buffer.byteLength(seperator);

function parseMessage(msg) {
    var buff = Buffer.from(msg);
    var data = {};
    var offset = buff.indexOf(seperator);
    var body = buff.slice(offset + sepLen);
    var head = buff.slice(0, offset).toString();
    var opts = head.split(";");
    data.body = body;
    opts.forEach((opt, ind) => {
        var key = opt.split('=')[0];
        var val = opt.split('=')[1];
        key = key.trim();
        data[key] = val;
    })
    return data;
}

function buildMessage(obj) {
    var sep = ";";
    var msg = "";
    Object.keys(obj).forEach((item) => {
        if (item != 'body') {
            msg += item + "=" + obj[item] + sep;
        }
    })
    msg += sep;
    var buff = Buffer.from(msg);
    if (obj.body != undefined) {
        if (!Buffer.isBuffer(obj.body)) {
            obj.body = Buffer.from(obj.body);
        }
        return Buffer.concat([buff, obj.body])
    }
    else
        return buff;
}

class AirSync extends EventEmitter {
    /**
     * @EVENTS
     * connected
     * disconnected
     * request
     * sessionUpdate
     */
    constructor(peerId, secret) {
        super();
        this.peerId = peerId;
        this.uid = peerId.split(':')[0];
        this.host = peerId.split(':')[1];
        this.secret = secret;
        this.sessionId = null;
        this.lastPing = 0;
        this.isConnected = false;

        air.on('request', (req) => {
            var data = parseMessage(req.body);
            var from = req.from;
            if (from.split(':')[0] == this.uid && from.split(':')[1] == this.host) {
                if (data.type == 'INIT2') {
                    this._handleInit2(from.split(':')[2], data.encdata, req.respond);
                }
                else if (from.split(':')[2] == this.sessionId) {
                    this.emit('request', data.type, data.payload, req.respond);
                }
            }
        })
        setTimeout(() => {//////
            this.init2();
        }, 500); //200
    }
    updatePeer(updates) {
        /**
         * @updates
         * sessionId
         * username
         * devicename
         * icon
         * lastPing
         */
        if (updates.lastPing != undefined) {
            this.lastPing = updates.lastPing;
        }
        if (updates.sessionId != undefined) {
            this.sessionId = updates.sessionId;
        }
        if (updates.username != undefined) {
            this.username = updates.username;
        }
        if (updates.devicename != undefined) {
            this.devicename = updates.devicename;
        }
        if (updates.icon != undefined) {
            this.icon = updates.icon;
        }
        if (this.isConnected) {
            this.emit('sessionUpdate', updates);
        }
        else if (updates.sessionId != null) {
            this.isConnected = true;
            this.emit('connected', updates);
        }
    }
    _scheduleInit2() {
        setTimeout(this.init2, 1000 * 30);
    }
    _handleInit2 = (sessionId, encdata, respond) => {
        //console.log('handling init2')
        var prev = null;
        if (this.sessionId != null) {
            prev = this.sessionId.split('.')[0]
        }
        var next = sessionId.split('.')[0];
        var dt = new Date();
        var timeDiff = dt.getTime() - this.lastPing;
        var willDo = true;
        if (next != 'local' && prev == 'local') {
            if (timeDiff < 12 * 1000) {
                willDo = false;
                //console.error("Not handling INIT2 cuz req sessionId is global nd time diff is short");
            }
        }
        if (willDo) {
            var secret = this.secret;
            //decrypt data here;
            var dec = encdata;//
            respond(200, buildMessage({
                decdata: dec,
                devicename,
                username,
                icon
            }));
            if (this.sessionId != sessionId) {
                this.init2(true, sessionId);
                //console.log("handle INIT2: new sessionId, force INIT2 ing..");
            }
        }
        else {
            respond(300, buildMessage({ decdata: 'none' }));
        }
    }
    init2 = (force = false, onlySessionId = null) => {
        //console.log('init2-ing..')
        var dt = new Date;
        var time = dt.getTime();
        if ((this.lastPing + 1000 * 60 * 1.5) < time) {
            //Its about 5 mins since we got auth.. consider the peer offline
            this.updatePeer({ sessionId: null, lastPing: time });
        }
        if (((this.lastPing + 1000 * 40) < time) || force || this.sessionId == null) {
            var secret = this.secret;
            var data = code();
            var enc = data;//
            //encrypt here
            var reqId = this.peerId;
            if (onlySessionId != null) {
                reqId += ':' + onlySessionId;
            }
            air.request(reqId, buildMessage({ type: 'INIT2', encdata: enc }), (ress) => {
                if (ress.status == 200) {
                    var res = parseMessage(ress.body);
                    var airId = ress.from;
                    var sessionId = ress.from.split(':')[2];
                    var dec = res.decdata;//
                    //decrypt here
                    if (dec == data) {
                        //authorized!
                        dt = new Date;
                        time = dt.getTime();
                        var update = { sessionId, lastPing: time }
                        if (res.devicename != undefined) {
                            update.devicename = res.devicename;
                        }
                        if (res.username != undefined) {
                            update.username = res.username;
                        }
                        if (res.icon != undefined) {
                            update.icon = res.icon;
                        }
                        //console.log(update);
                        this.updatePeer(update);
                        this._scheduleInit2();
                    }
                    else {
                        console.warn("INIT2 BLOCKED: hash did not match!", dec, data);
                    }
                }
                //TODO: If it keeps unauthorizing.. find a way to UNINIT1 the peer
            })
        }
        else {
            //console.log("skipping INIT2..");
        }
    }
    request(type, payload = null, cb = function () { }) {
        if (this.sessionId != null) {
            air.request(this.peerId + ':' + this.sessionId, buildMessage({ type, payload }), cb);
        }
        else {
            cb(null);
        }
        this.init2(false);
    }
}

function airSyncInit(airPeer, _icon) {
    air = airPeer;
    username = air.name.split(':')[0];
    devicename = air.name.split(':')[1];
    icon = _icon;
    air.on('request', (req) => {
        var data = parseMessage(req.body);
        if (data.type == 'REVEAL') {
            var reply = {
                username,
                devicename,
                icon
            }
            req.respond(200, buildMessage(reply));
        }
        else if (data.type == 'INIT1') {
            handleInit1(req.from, data, req.respond);
        }
    })
}

function handleInit1(airId, req, respond) {
    console.log("HANDLING INIT1 REQUEST");
    var idObj = parseAirId(airId);
    var dt = new Date;
    var time = dt.getTime();
    var peer = {
        uid: idObj.uid,
        host: idObj.host,
        secret: req.secret,
        username: req.devicename,
        devicename: req.devicename,
        icon: req.icon,
        addedOn: time
    }
    var reply = {
        username,
        devicename,
        icon
    }
    respond(200, buildMessage(reply));
    airEvents.emit('init1', peer);
}

function init1(airId) {
    console.log("REQUESTING INIT1...");
    var secret = code();
    var uid = airId.split(':')[0];
    var host = airId.split(':')[1];
    var sessionId = airId.split(':')[2];

    username = air.name.split(':')[0];
    devicename = air.name.split(':')[1];
    var req = {
        type: 'INIT1',
        username,
        devicename,
        icon,
        secret
    };
    air.request(airId, buildMessage(req), (ress) => {
        var res = parseMessage(ress.body);
        var dt = new Date;
        var time = dt.getTime();
        var peer = {
            uid,
            host,
            secret,
            username: res.devicename,
            devicename: res.devicename,
            icon: res.icon,
            addedOn: time
        }
        airEvents.emit('init1', peer);
    })
}

function reveal(airId, cb) {
    air.request(airId, buildMessage({ type: 'REVEAL' }), (ress) => {
        var res = parseMessage(ress.body);
        cb(ress.from, res);
    })
}

function updateInfo(info) {
    if (info.icon != undefined) {
        icon = info.icon;
    }
    if (info.username != undefined) {
        username = info.username;
    }
    if (info.devicename != undefined) {
        devicename = info.devicename;
    }
}

/**
 * @AirEVENTS
 * init1
 * 
 */
export { AirSync, airEvents, airSyncInit, init1, reveal, updateInfo };