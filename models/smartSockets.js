const mongoose = require('mongoose');

const socketSchema = new mongoose.Schema({
    name: String,
    code: String,
    mode: String

}, { timestamps: true });


const smartSocket = mongoose.model('smartSocket', socketSchema);


module.exports = smartSocket;
