const mongoose = require('mongoose');

const Noteschema = new mongoose.Schema({
    Title:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Tag:{
        type:String,
        default:"General"
    }
});

const Notesch = mongoose.model('Notes',Noteschema);
module.exports = Notesch;