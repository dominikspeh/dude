const RaspiCam = require("raspicam");



function makePhoto() {
    var photoname = Math.floor(Date.now() / 1000);

    const config = {
        mode: "photo",
        rot: 180,
        output: "images/photo-"+photoname+".jpg" };

    const camera = new RaspiCam(config);

    return new Promise((resolve, reject) => {
        camera.start({rotate: 180} );

        camera.on("exit", function(){
            resolve(config.output);
        });




    });
}

module.exports = {
    makePhoto,
};