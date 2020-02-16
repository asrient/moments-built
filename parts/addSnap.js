/**
 * @ASRIENT 25.1.20
 */

var fs = pine.include('fs');
var crypto = pine.include('crypto');


function copy(pth, ind = 0, cb = function () { }) {
    fs.stat(pth, (err, stat) => {
        if (err == null) {
            var taken_on = stat.birthtimeMs;
            var id = crypto.randomBytes(5).toString('hex');
            console.log('copying', pth, 'to', id);
            fs.copyFile(pth, pine.paths.data + '/apps/moments/files/media/' + id + '.jpg', (err) => {
                console.log('copying done', err)
                var dt = new Date;
                var rec={ id, filename: id + '.jpg', url: 'files://media/' + id + '.jpg', added_on: dt.getTime(), taken_on };
                recs.insert(rec)
                cb(ind,rec);
            });
        }
        else {
            console.error("err in obtaining stats", err)
            cb(0);
        }
    })

}

function start(cb = function () { }) {
    pine.dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        buttonLabel: "Import",
        title: "Copy to Moments app",
        defaultPath: pine.paths.pictures,
        filters: [
            { name: 'Snaps', extensions: ['jpg', 'png', 'gif', 'mkv', 'avi', 'mp4'] },
        ]
    }).then(result => {
        if (!result.canceled) {
            var res=[];
            result.filePaths.forEach((pth, index) => {
                copy(pth, index, (ind,rec) => {
                    res.push(rec);
                    if (ind + 1 == result.filePaths.length) {
                        //after last snap
                        console.log('import done');
                        cb(ind + 1,res);
                    }
                });
            });
        }
        else {
            cb(0);
        }
    }).catch(err => {
        console.log(err)
    })
}


export default start;