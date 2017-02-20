// Script by Algram https://github.com/Algram/woodhouse

const fritzbox = require('./models/fritzbox');
const crypto = require('crypto');
const request = require('request');


function getDevices() {
    return new Promise((resolve, reject) => {
        fritzbox.find().sort().exec(function (err, results) {

            if (!err) {
                resolve(results[0].memberDevices)

            }
        });
    });
}

function getFritzBoxData() {
    return new Promise((resolve, reject) => {
        request('http://fritz.box', (err, res, firstBody) => {
            if (err) reject(Error(err));



            const options = {
                url: 'http://fritz.box',
                form: {
                    lp: 'netDev',
                    username: ''
                }
            };

            request.post(options, (err, res, secondBody) => {
                if (err) reject(Error(err));

                const sessionIdPosStart = secondBody.indexOf('"sid":') + 8;
                const sessionId = secondBody.substring(sessionIdPosStart, sessionIdPosStart + 16);

                const options = {
                    url: 'http://fritz.box/data.lua',
                    form: {
                        sid: sessionId,
                        lang: 'en',
                        page: 'netDev',
                        type: 'all',
                        xhr: 1,
                        no_sidrenew: ''
                    }
                };

                request.post(options, (err, res, thirdBody) => {
                    if (err) reject(Error(err));
                    const thirdBodyParsed = JSON.parse(thirdBody);
                    resolve(thirdBodyParsed.data);
                });
            });
        });
    });
}

function getCurrentlyHomeDevices() {
    return new Promise(resolve => {

        // GET DEVICES FROM DB
        getDevices().then(data => {
            const memberDevices = data;
            let activeMemberDevices = [];

            getFritzBoxData().then(data => {
                activeMemberDevices = memberDevices.map(device => {
                    if (data.active.some(activeDevice => activeDevice.ipv4 === device.ip)) {
                        return device;
                    }

                    return null;
                });

                activeMemberDevices = activeMemberDevices.filter(n => n !== null);

                resolve(activeMemberDevices);
            });
        });

    });
}




module.exports = {
    getDevices,
    getFritzBoxData,
    getCurrentlyHomeDevices

};