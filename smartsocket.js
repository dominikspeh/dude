const exec = require('child_process').exec;
const smartSockets = require("./models/smartSockets");

function getSockets() {
    return new Promise((resolve, reject) => {
        smartSockets.find().sort().exec(function (err, results) {

            if (!err) {
                resolve(results)

            }
        });
    });
}
function updateSockets(id) {
    return new Promise((resolve, reject) => {

        smartSockets.findOne({ _id: id }, (err, socket) => {
            if (err) {
                console.log(err);
            }

            if (socket.mode == 0) {
                socket.mode = 1
            }
            else {
                socket.mode = 0;
            }

            socket.save((err) => {
                resolve(socket);
            });

        });
    });
}

function turnSocket(id) {

    return new Promise((resolve, reject) => {

        updateSockets(id).then(socket => {
            exec('sudo /home/pi/raspberry-remote/send '+socket.code+' '+socket.mode, function(error, stdout, stderr) {

                if (error !== null) {
                    console.log('exec error: ' + error);
                }

                resolve(stdout);


            });

        });




    });
}
function turnOffSocket() {
    return new Promise((resolve, reject) => {

        exec('sudo /home/pi/raspberry-remote/send 10111 1 0', function(error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            resolve(stdout);

            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });


    });
}

module.exports = {
    getSockets,
    turnSocket,
    turnOffSocket
};