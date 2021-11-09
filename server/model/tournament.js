const mongoose = require('mongoose');

const tournament_schema = new mongoose.Schema({
    User:{//Associating Notes with user just like foreign key in mysql
        type:mongoose.Schema.Types.ObjectId,//it will take only object id from req.body which will come from jwt token
        ref:'userdata'
    },
    Title:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Total_Players:{
        type: Number,
        required:true
    },
    Prizes:{
        type: String,
        required:true
    },
    Date:{
        type:Date,
        default: Date.now()
    }
});

const tournamentschema = mongoose.model('tournament',tournament_schema);
module.exports = tournamentschema;