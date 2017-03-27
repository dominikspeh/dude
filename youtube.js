const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const fetchVideoInfo = require('youtube-info');

function downloadVideo(url) {
    return new Promise((resolve, reject) => {

        let yID = url.slice(-11);
        let title ;


        //Configure YoutubeMp3Downloader with your settings
        let YD = new YoutubeMp3Downloader({
            "ffmpegPath": "/usr/local/bin/ffmpeg",
            "outputPath": "./songs",
            "youtubeVideoQuality": "highest",
            "queueParallelism": 2
        });

        //Get video info and save as MP3 file
        fetchVideoInfo(yID).then(function (videoInfo) {
            title = videoInfo.title;
            YD.download(yID, videoInfo.title.replace(/[^A-Z0-9]+/ig, "_")+".mp3");
        });



        YD.on("finished", function(data) {
            resolve(title)
        });
    });
}

module.exports = {
    downloadVideo,
};