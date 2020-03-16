import $ from "jquery";
import addSnap from "./addSnap.js";
import deleteSnap from "./deleteSnap.js";

function actions(act,data){
if(act=='ADD_SNAP'){
    addSnap((c, snaps) => {
        if (c){
            window.state.addSnaps('local',snaps);
            //Broadcast event to other devices here
        }
    });
}
else if(act=="DELETE_SNAP"){
    deleteSnap(data, () => {
        window.state.removeSnaps('local',data);
        //Broadcast event to other devices here
    })
}
}

export default actions;