const Feed = require('rss-to-json');
const request = require('request');



function loadFeed() {
    return new Promise((resolve, reject) => {
        Feed.load('http://www.stuttgarter-nachrichten.de/vfb.rss.feed', function(err, rss){
            var data = {
                logo: "img/stn-logo.png",
                feed: rss
            };
            resolve(data);
        });
    });
}

module.exports = {
    loadFeed,
};