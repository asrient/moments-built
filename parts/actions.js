import $ from "jquery";
import addSnap from "./addSnap.js";
import deleteSnap from "./deleteSnap.js";

var crypto = pine.include('crypto');

function code(n = 5) {
    return crypto.randomBytes(n).toString('hex');
}

function actions(act, data) {
    if (act == 'ADD_SNAP') {
        addSnap((c, snaps) => {
            if (c) {
                window.state.addSnaps('local', snaps);
                //Broadcast event to other devices here
            }
        });
    }
    else if (act == "DELETE_SNAP") {
        //only one id at a time
        var b = data.split(':');
        if (b[0] == 'local') {
            deleteSnap([data], () => {
                window.state.removeSnaps('local', [data]);
                //Broadcast event to other devices here
            });
        }
        else {
            var type = window.srcs.get(b[0] + ".type");
            if (type == 'airdevice') {
                //
            }
            else {
                console.warn("Cannot delete from cloud");
            }
        }
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
    else if (act == "CLOSE_WINDOW") {
        window.state.window.close();
    }
    else if (act == "ACTIVATE_SOURCE") {
        window.srcs.set(data + '.isActive', true);
        window.state.init();
    }
    else if (act == "DEACTIVATE_SOURCE") {
        window.srcs.set(data + '.isActive', false);
        window.state.init();
    }
    else if (act == "REGISTER_GOOGLEPHOTOS") {
        var srcId = code(2);
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
        window.state.init();
    }
    else if (act == "GOOGLE_PHOTOS_LOGIN") {
        window.actions("CLOSE_WINDOW");
        var win = pine.app.createWindow();
        //win.setSkipTaskbar(true);
        win.setAlwaysOnTop(true);
        win.setMaximizable(false);
        win.setMinimizable(false);
        win.setSize(500, 700);
        win.center();
        win.setMovable(false);
        win.setResizable(false);
        win.loadURL('https://moments.kikoing.co.in/auth', { userAgent: 'Chrome' });
        pine.ipc.once('LOGIN_SUCCESS', (e, arg) => {
            win.close();
        })
        pine.ipc.once('LOGIN_ERROR', (e, arg) => {
            window.setTimeout(() => { win.close(); }, 4000)
        })
    }
    else if (act == "DELETE_SOURCE") {
        var src = window.srcs.get(data);
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

    }
}

export default actions;