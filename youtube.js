const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const fetchVideoInfo = require('youtube-info');
const Songs = require('./models/songs');


function downloadVideo(url) {
    return new Promise((resolve, reject) => {

        let yID = url.slice(-11);

        findSong("https://www.youtube.com/watch?v="+yID).then(function () {

            let metadata ;
            let path ;


            //Configure YoutubeMp3Downloader with your settings
            let YD = new YoutubeMp3Downloader({
                "ffmpegPath": "/usr/local/bin/ffmpeg",
                "outputPath": "./songs",
                "youtubeVideoQuality": "highest",
                "queueParallelism": 2
            });

            //Get video info and save as MP3 file
            fetchVideoInfo(yID).then(function (videoInfo) {
                metadata = videoInfo;

                path = videoInfo.title.replace(/[^A-Z0-9]+/ig, "_")+".mp3";
                YD.download(yID, path);


            });

            YD.on("finished", function() {

                saveVideo(metadata,path).then(title => {
                    resolve(title)
                }, reason => {
                    reject(reason)
                });

            });
        }, reason => {
            reject(reason)
        });
    });
}
function findSong(data) {
    return new Promise((resolve,reject) => {

        Songs.findOne({ url: data }, (err, existingSong) => {

            if (err) { reject(Error(err))}
            if (existingSong) {
                reject("Exists");
            }
            resolve("New Song");

        });


    })
}

function saveVideo(data, filepath) {
    return new Promise((resolve,reject) => {

        Songs.findOne({ url: data.url }, (err, existingSong) => {

            if (err) { reject(Error(err))}
            if (existingSong) {
                reject("Exists")
            }
            new Songs({
                name : data.title,
                user: data.owner,
                url: data.url,
                path: filepath
            }).save((err) => {
                resolve(data.title);
            });
        });


    })
}

module.exports = {
    downloadVideo,
};