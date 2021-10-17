const mongoose = require('mongoose');

const Noteschema = new mongoose.Schema({
    User:{
        type:mongoose.Schema.Types.ObjectId, // | Main thing is by doing this we can search particular user notes and then perform CRUD on that| Basicaly Linking The Notes Model to Userlogin Model, so that we can show the user of its own notes only , so every user (which will be dintinguise by Object id) will see his nostes only.
        ref:'Userlogin'
    },
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
    },
    Date:{
        type:Date,
        default: Date.now
    }
});

const Notesch = mongoose.model('Note',Noteschema);
module.exports = Notesch;