const mongoose = require('mongoose');

const Userschema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique:true
    },
    Password:{
        type:String,
        required:true,
        unique:false
    },
    Date:{
        type:Date,
        default: Date.now
    }
});

const usersch = mongoose.model('Userlogin',Userschema);
module.exports = usersch;