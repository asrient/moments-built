/**
 * @ASRIENT 24.2.20
 */

const imgTypes = ['image/jpeg', 'image/png'];

function removeSnap(id, cb) {
    console.log("removing:", id);
    recs.findOne({ id }, (err, snap) => {
        if (snap != null) {
            var tags = snap.tags;
            tags.forEach((tagId) => {
                var _snps=window.tags.get(tagId+'.snaps');
                var snps=_snps.filter((snp)=>{
                    return snp!=snap.id;
                })
                //console.log("removing snap from tag...",tagId,snps);
                if(snps.length){
                    //console.log("removed snap from tag",tagId);
                    window.tags.set(tagId+'.snaps',snps);
                }
                else{
                    //console.log("deleting tag too");
                    window.tags.del(tagId);
                }
            })
            fs.unlink('media/' + snap.filename, () => {
                fs.unlink('thumbs/' + snap.filename, () => {
                    recs.remove({ id }, {}, () => {
                        cb();
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

function start(snaps, cb = function () { }) {
    snaps.forEach((snap, index) => {
        removeSnap(snap, () => {
            if (index == (snaps.length - 1)) {
                cb(snaps.length);
            }
        })
    });

}

export default start;