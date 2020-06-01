const airEvents = new EventEmitter();

var air = null;

class AirSync extends EventEmitter {
    constructor(peerId) {

    }
}

function airSyncInit(airPeer) {
    air = airPeer;
}

export { AirSync, airEvents, airSyncInit };