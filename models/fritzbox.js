const mongoose = require('mongoose');

const fritzSchema = new mongoose.Schema({
    memberDevices: []


}, { timestamps: true });


const fritzBox = mongoose.model('fritzbox', fritzSchema);


module.exports = fritzBox;
