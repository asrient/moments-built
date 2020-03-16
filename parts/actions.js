import $ from "jquery";
import addSnap from "./addSnap.js";
import deleteSnap from "./deleteSnap.js";

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
       else{
        var type= window.srcs.get(b[0]+".type");
        if(type=='airdevice'){
            //
        }
        else{
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
}

export default actions;