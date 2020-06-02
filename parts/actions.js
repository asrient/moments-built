import $ from "jquery";
import addSnap from "./addSnap.js";

function code(n = 5) {
    return crypto.randomBytes(n).toString('hex');
}

function actions(act, data) {
    if (act == 'ADD_SNAP') {
        addSnap();
    }
    else if (act == 'OPEN_PAGE') {
        var relay = null;
        var pg = data;
        if (data.split(':')[0] == 'tags') {
            pg = 'tags';
            relay = data.split(':')[1];
            if (relay == undefined) {
                relay = null;
            }
        }
        window.state.openPage(pg, relay);
    }
    else if (act == 'ADD_PEER') {
        window.state.init1(data);
    }
    else if (act == "DELETE_SNAPS") {
        var devs = {}
        data.forEach(snapId => {
            var devId = snapId.split('/')[0];
            var id = snapId.split('/')[1];
            if (devs[devId] != undefined) {
                devs[devId].push(id);
            }
            else {
                devs[devId] = [id];
            }
        });
        Object.keys(devs).forEach((devId) => {
            window.state.removeSnaps(devId, devs[devId]);
        })
    }
    else if (act == "TAG_SNAP") {
        /*var dt = new Date();
        var snapId = data.snapId;
        var tagId = data.tagId;
        var srcId = snapId.split(':')[0];
        if (srcId == 'local') {
            recs.findOne({ id: snapId }, (err, snap) => {
                if (snap != null && !snap.tags.includes(tagId)) {
                    recs.update({ id: snapId }, { "$push": { "tags": tagId } }, {}, () => {
                        snap.tags.push(tagId);
                        if (window.tags.get(tagId) != undefined) {
                            window.tags.union(tagId + ".snaps", snapId);
                            window.tags.set(tagId + ".modified_on", dt.getTime());
                        }
                        else {
                            //new tag!
                            window.tags.set(tagId, { snaps: [snapId], modified_on: dt.getTime() });
                        }
                        window.state.updateSnap(snapId, snap);
                        //shoot this event to other devs too
                    })
                }
                else {
                    console.warn("snap already tagged")
                }
            })

        }
        else {
            //steps for other sources
        }*/
    }
    else if (act == "UNTAG_SNAP") {
        /* var dt = new Date();
         var snapId = data.snapId;
         var tagId = data.tagId;
         var srcId = snapId.split(':')[0];
         if (srcId == 'local') {
             recs.findOne({ id: snapId }, (err, snap) => {
                 if (snap != null && snap.tags.includes(tagId)) {
                     recs.update({ id: snapId }, { "$pull": { "tags": tagId } }, {}, () => {
                         var snaps = window.tags.get(tagId + ".snaps");
                         snaps = snaps.filter((id) => {
                             return id != snapId;
                         });
                         if (snaps.length) {
                             window.tags.set(tagId + ".snaps", snaps);
                         }
                         else {
                             //no snaps left in the tag, remove it
                             //console.log("no snaps left in the tag, remove it from db");
                             window.tags.del(tagId);
                         }
                         var tagInd = snap.tags.findIndex((tg) => {
                             return tg == tagId;
                         })
                         if (tagInd >= 0) {
                             snap.tags.splice(tagInd, 1);
                         }
                         window.state.updateSnap(snapId, snap);
                         //shoot this event to other devs too
                     })
                 }
             })
 
         }
         else {
             //steps for other sources
         }*/
    }
    else if (act == "PREVIEW_SNAP") {
        window.state.preview.open(data.id, data.context);
    }
    else if (act == "CLOSE_PREVIEW") {
        window.state.preview.close();
    }
    else if (act == "ADD_DEVICE") {
        window.state.window.open('ADD_DEVICE', data);
    }
    else if (act == "ADD_TAG") {
        window.state.window.open('ADD_TAG', data);
    }
    else if (act == "CLOSE_WINDOW") {
        window.state.window.close();
    }
    else if (act == "ACTIVATE_SOURCE") {
        //window.srcs.set(data + '.isActive', true);
        //window.state.init();
    }
    else if (act == "DEACTIVATE_SOURCE") {
        //window.srcs.set(data + '.isActive', false);
        //window.state.init();
    }
    else if (act == "REGISTER_GOOGLEPHOTOS") {
        /*var srcId = code(2);
        window.srcs.set(srcId, {
            "name": "Google Photos",
            "icon": "source://icons/google-photos.svg",
            "isActive": true,
            "count": 0,
            "type": "cloud/google",
            "id": data.id,
            "access_token": data.access_token,
            "expiry_date": data.expiry_date,
            "token_type": "Bearer"
        })
        window.state.init();*/
    }
    else if (act == "GOOGLE_PHOTOS_LOGIN") {
        /////////////////////////////////////////////////
        /*window.actions("CLOSE_WINDOW");
        var loginWin = pine.app.createWindow();
        //loginWin.setSkipTaskbar(true);
        loginWin.setAlwaysOnTop(true);
        loginWin.setMaximizable(false);
        loginWin.setMinimizable(false);
        loginWin.setSize(500, 700);
        loginWin.center();
        loginWin.setMovable(false);
        loginWin.setResizable(false);
        loginWin.loadURL('https://moments.kikoing.co.in/auth', { userAgent: 'Chrome' });
        pine.ipc.once('LOGIN_SUCCESS', (e, arg) => {
            loginWin.close();
        })
        pine.ipc.once('LOGIN_ERROR', (e, arg) => {
            window.setTimeout(() => { loginWin.close(); }, 4000)
        })*/
    }
    else if (act == "DELETE_SOURCE") {
        /* var src = window.srcs.get(data);
         if (src.type == 'cloud/google') {
             $.get('https://moments.kikoing.co.in/remove?id=' + src.id, (data) => {
                 if (data != undefined) {
                     if (data.result == 'SUCCESS') {
                         window.srcs.del(data);
                         window.state.init();
                     }
                     else {
                         console.error("FAILED to remove source [cloud/google]", data);
                     }
                 }
             })
         }
         else {
             //Steps for other sources
             window.srcs.del(data);
             window.state.init();
         }
 */
    }
}

export default actions;