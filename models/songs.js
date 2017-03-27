const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    name: String,
    user: String,
    url: String,
    path: String

}, { timestamps: true });


const songs = mongoose.model('songs', songSchema);


module.exports = songs;
