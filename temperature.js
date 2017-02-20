var ds18b20 = require('ds18b20');



function getHomeTemperature() {
    return new Promise((resolve, reject) => {
        ds18b20.temperature(process.env.wire, function(err, value) {
            resolve(value);
        });


    });
}

module.exports = {
    getHomeTemperature,
};