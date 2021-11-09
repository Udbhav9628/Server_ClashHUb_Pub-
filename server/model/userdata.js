const mongoose = require('mongoose');

const userdata_schema = new mongoose.Schema({
    Email:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    },
    Date:{
        type:Date,
        default: Date.now()
    }
});

const userschema = mongoose.model('userdata',userdata_schema);
module.exports = userschema;