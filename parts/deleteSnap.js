/**
 * @ASRIENT 24.2.20
 */

function removeSnap(id, cb) {
    console.log("removing:", id);
    recs.findOne({ id }, (err, snap) => {
        if (snap != null) {
            var fileKey=snap.file_key;
            var thumbnailKey=snap.thumbnail_key;
            var filePth=window.resources.getPath(fileKey);
            var thumbnailPth=window.resources.getPath(thumbnailKey);
            fs.unlink(filePth, () => {
                fs.unlink(thumbnailPth, () => {
                    recs.remove({ id }, {}, () => {
                        window.resources.unregister(fileKey);
                        window.resources.unregister(thumbnailKey);
                        cb(snap);
                    })
                })
            })
        }
        else {
            console.error(err);
            cb();
        }
    })

}

function start(snapIds, cb = function () { }) {
    var snaps=[];
    snapIds.forEach((snapId, index) => {
        removeSnap(snapId, (snap) => {
            snaps.push(snap);
            if (index == (snapIds.length - 1)) {
                cb(snaps);
            }
        })
    });
}

export default start;