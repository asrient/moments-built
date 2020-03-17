import $ from "jquery";
const imgTypes = ['image/jpeg', 'image/png'];

class Photos {
    id = null;
    srcId=null;
    constructor(srcId) {
        this.srcId=srcId;
        if (window.srcs.get(srcId) != undefined)
            this.id = window.srcs.get(srcId+".id");
    }
    snapRec(data) {
        var id = this.srcId+":"+data.id;
        var dt = new Date(data.mediaMetadata.creationTime);
        var rec = { id, filename: data.filename, url: data.baseUrl, added_on: dt.getTime(), taken_on: dt.getTime() }
        rec.width = data.mediaMetadata.width;
        rec.height = data.mediaMetadata.height;
        rec.thumb_url = data.baseUrl + "=w250-h250";
        if (imgTypes.includes(data.mimeType)) {
            //its a photo
            rec.type = "image";
            rec.make = data.mediaMetadata.photo.cameraMake;
            rec.model = data.mediaMetadata.photo.cameraModel;
        }
        else {
            rec.type = "video";
            rec.url = data.baseUrl + "=dv";
            rec.make = data.mediaMetadata.video.cameraMake;
            rec.model = data.mediaMetadata.video.cameraModel;
        }
        return rec;
    }
    getAccessToken(cb) {
        if (this.id != null) {
            var dt = new Date();
            var rec = window.srcs.get(this.srcId);
            if (rec.expiry_date <= dt.getTime()) {
                //get the token
                $.get('https://moments.kikoing.co.in/token?id=' + this.id, (data) => {
                    if (data != undefined || data != null) {
                        if (data.result == 'SUCCESS') {
                            var dt = new Date();
                            rec.access_token = data.body.access_token;
                            rec.expiry_date = dt.getTime() + data.body.expires_in;
                            window.srcs.set(this.srcId, rec);
                            cb(rec.access_token);
                        }
                    }
                })
            }
            else {
                cb(rec.access_token);
            }
        }
    }
    getLibrary(pageToken = null, cb) {
        this.getAccessToken((token) => {
            var body = { pageSize: 10 };
            if (pageToken != null) {
                body.pageToken = pageToken;
            }
            $.ajax({
                url: "https://photoslibrary.googleapis.com/v1/mediaItems",
                method: "GET",
                dataType: "json",
                data: body,
                crossDomain: true,
                contentType: "application/json",
                cache: false,
                beforeSend:  (xhr)=> {
                    /* Authorization header */
                    xhr.setRequestHeader("Authorization", "Bearer " + token);
                },
                success:  (data,status)=> {
                   // console.log("response from lib api",data,status);
                    var snaps = [];
                    data.mediaItems.forEach((rec) => {
                        snaps.push(this.snapRec(rec));
                    })
                    var nextPageToken = null;
                    if (data.nextPageToken != undefined) {
                        nextPageToken = data.nextPageToken;
                    }
                    cb(snaps, nextPageToken);
                },
                error:  (jqXHR, textStatus, errorThrown)=> {
                    cb(null);
                }
            });
        })

    }
    getSnap(id) {
        this.getAccessToken((token) => {
            $.ajax({
                url: "https://photoslibrary.googleapis.com/v1/mediaItems/" + id,
                method: "GET",
                crossDomain: true,
                contentType: "application/json",
                cache: false,
                beforeSend: function (xhr) {
                    /* Authorization header */
                    xhr.setRequestHeader("Authorization", "Bearer " + token);
                },
                success: function (data) {
                    cb(this.snapRec(data));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    cb(null);
                }
            });
        })

    }
}

export {Photos}