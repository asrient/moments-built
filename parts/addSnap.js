/**
 * @ASRIENT 25.1.20
 */

var fs = pine.include('fs');
var crypto = pine.include('crypto');


function copy(pth,ind=0,cb=function(){}) {
    var id = crypto.randomBytes(5).toString('hex') + '.jpg';
    console.log('copying',pth,'to',id);
    fs.copyFile(pth, pine.paths.data + '/apps/moments/files/media/' + id, (err) => {
        console.log('copying done',err)
        var dt = new Date;
        recs.insert({ path: id, added_on: dt.getTime() })
        cb(ind);
    });
}

function start(cb=function(){}) {
    pine.dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        buttonLabel: "Import",
        title: "Copy to Moments app",
        defaultPath: pine.paths.pictures,
        filters: [
            { name: 'Snaps', extensions: ['jpg', 'png', 'gif','mkv', 'avi', 'mp4'] },
        ]
    }).then(result => {
        if (!result.canceled) {
            result.filePaths.forEach((pth,index) => {
              copy(pth,index,(ind)=>{
                 if(ind+1==result.filePaths.length){
                     //after last snap
                     console.log('import done');
                     cb(ind+1);
                 }
              });
            });
        }
        else{
            cb(0);
        }
    }).catch(err => {
        console.log(err)
    })
}


export default start;