/**
 * @ASRIENT 25.1.20
 */


const media = {
    getType: function (pth) {
        return (MIME.lookup(filesDir + '/' + pth));
    },
    Image: class {
        file = null;
        proceed = false;
        constructor(pth) {
            this.file = filesDir + '/' + pth;
            const types = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!types.includes(MIME.lookup(this.file))) {
                this.file = null;
            }
        }
        getInfo = (cb) => {
            function getDate(dt) {
                dt = dt.split(" ");
                var date = dt[0];
                var time = dt[1];
                date = date.split(':');
                time = time.split(':');
                var dt = new Date(date[0], date[1], date[2], time[0], time[1], time[2]);
                return (dt.getTime());
            }
            new Exif({ image: this.file }, function (err, info) {
                if (err) {
                    info = { "image": {}, "thumbnail": {}, "exif": {}, "gps": {} };
                }
                if (info.exif.DateTimeOriginal != undefined) {
                    info.date = getDate(info.exif.DateTimeOriginal);
                }
                else if (info.exif.CreateDate != undefined) {
                    info.date = getDate(info.exif.CreateDate);
                }
                else if (info.image.ModifyDate != undefined) {
                    info.date = getDate(info.image.ModifyDate);
                }
                if (info.image.Orientation) {
                    info.orientation = info.image.Orientation;
                }
                if (info.image.Make) {
                    info.make = info.image.Make.toString();
                }
                if (info.image.Model) {
                    info.model = info.image.Model.toString();
                }
                if (info.exif.ExifImageWidth) {
                    info.width = info.exif.ExifImageWidth;
                }
                if (info.exif.ExifImageHeight) {
                    info.height = info.exif.ExifImageHeight;
                }
                cb(info);

            });
        }
        fixOrientation = (out = this.file, cb) => {
            if (out != this.file) {
                out = filesDir + '/' + out;
            }
            sharp(this.file)
                .rotate()
                .toFile(out, (err) => {
                    cb(1)
                })
        }
        resize = (size = 150, out = this.file, cb) => {
            if (out != this.file) {
                out = filesDir + '/' + out;
            }
            sharp(this.file)
                .rotate()
                .resize({ height: size })
                .toFile(out, (err) => {
                    cb(1)
                });
        }
    },
    Video: class {
        file = null;
        proceed = false;
        constructor(pth) {
            this.filesDir = filesDir;
            this.file = filesDir + '/' + pth;
            const types = ['video/mp4', 'video/avi', 'video/3gp', 'video/avi'];
            if (!types.includes(MIME.lookup(this.file))) {
                this.file = null;
            }
        }
        editor() {
            if (this.file != null) {
                //return new FFmpeg(this.file);
            }
        }
        getInfo(cb) {
            /*new FFmpeg.Metadata(
                this.file,
                (metadata, err)=> {
                    cb(metadata);
                }
            );*/
        }
    }
}



const imgTypes = ['image/jpeg', 'image/jpg', 'image/png'];

function imgFormat(rec, cb) {
    rec.type = "image";
    var img = new media.Image('tmp/' + rec.filename);
    img.getInfo((info) => {
        console.log("gps:", info.gps);
        if (info.date != undefined) {
            rec.taken_on = info.date;
        }
        if (info.make != undefined) {
            rec.make = info.make;
        }
        if (info.model != undefined) {
            rec.model = info.model;
        }
        if (info.width != undefined) {
            rec.width = info.width;
        }
        if (info.height != undefined) {
            rec.height = info.height;
        }
        img.fixOrientation('media/' + rec.filename, () => {
            rec.file_key = window.resources.register( filesDir + '/media/' + rec.filename);
            img.resize(200, 'thumbs/' + rec.filename, () => {
                rec.file_key = window.resources.register( filesDir + '/thumbs/' + rec.filename);
                cb(rec);
            })
        })
    })
}

function vidFormat(rec, cb) {
    rec.type = "video";
    var vid = new media.Video('tmp/' + rec.filename);
    var editor = vid.editor();
    editor.on('codecData', function (data) {
        console.log(data);
    })
        .on('end', () => {
            // The 'end' event is emitted when FFmpeg finishes
            // processing.
            rec.thumb_url = 'files://thumbs/' + rec.id + '.jpg';
            cb(rec);
            console.log('Processing finished successfully');
        })
        .saveToFile(vid.filesDir + '/media/' + rec.filename)
        .screenshots({
            // Will take screens at 20%, 40%, 60% and 80% of the video
            count: 4,
        }, vid.filesDir + '/thumbs/', () => {
            console.log("thumbs generated!")
        });
}

function copy(pth, ind = 0, cb = function () { }) {
    fs.stat(pth, (err, stat) => {
        if (err == null) {
            var taken_on = stat.birthtimeMs;
            var ext = pth.split('.');
            ext = '.' + ext[ext.length - 1];
            console.log("ext:", ext);
            var size = stat.size;
            var id = crypto.randomBytes(5).toString('hex');
            console.log('copying', pth, 'to', id);
            var tmp = 'tmp/' + id + ext;
            var tmpPath = filesDir + '/' + tmp;
            fs.copyFile(pth, tmpPath, (err) => {
                var dt = new Date();
                var rec = {
                    id,
                    filename: id + ext,
                    tags: [],
                    size,
                    added_on: dt.getTime(),
                    taken_on
                };
                var mime = media.getType(tmp);
                if (imgTypes.includes(mime)) {
                    imgFormat(rec, (rec) => {
                        fs.unlink(tmpPath, () => {
                            cb(ind, rec);
                        })
                    })
                }
                else {
                    vidFormat(rec, (rec) => {
                        //recs.insert(rec);
                        cb(ind, rec);
                    })
                }
            });
        }
        else {
            console.error("err in obtaining stats", err)
            cb(0);
        }
    })

}

function start() {
    electron.remote.dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        buttonLabel: "Import",
        title: "Copy to Moments",
        defaultPath: dirs.pictures,
        filters: [
            { name: 'Snaps', extensions: ['jpg', 'png', 'gif', 'mkv', 'avi', 'mp4'] },
        ]
    }).then(result => {
        if (!result.canceled) {
            var snaps = [];
            result.filePaths.forEach((pth, index) => {
                copy(pth, index, (ind, rec) => {
                    snaps.push(rec);
                    if (ind + 1 == result.filePaths.length) {
                        //after last snap
                        console.log('import done');
                        window.state.addSnap('local', snaps);
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