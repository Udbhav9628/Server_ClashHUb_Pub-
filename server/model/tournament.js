const mongoose = require("mongoose");

const tournament_schema = new mongoose.Schema({
  GuildId: {
    //Associating Notes with user just like foreign key in mysql
    type: mongoose.Schema.Types.ObjectId, //it will take only object id from req.body which will come from jwt token
    ref: "Guild",
    required: true,
  },
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdata",
    required: true,
  },
  Game_Name: {
    type: String,
    required: [true, "Please Enter Game Name"],
    trim: true,
  },
  GameType: {
    type: String,
    required: true,
    enum: ["Solo", "Duo", "Squad"],
  },
  Map: {
    type: String,
    required: [true, "Please Provide Map"],
    trim: true,
  },
  Total_Players: {
    type: Number,
    required: [true, "Please Enter Players"],
    enum: [20, 40, 60, 80, 100],
  },
  EntryFee: {
    type: Number,
    required: true,
  },
  Perkill_Prize: {
    type: Number,
    required: true,
  },
  Joined_User: [
    {
      UserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userdata",
      },
      UserName: {
        type: String,
        required: true,
      },
      InGameName: {
        type: String,
        required: true,
      },
      Kills: {
        type: Number,
        min: [0, "Kills Must Be at Least 0"],
        max: [100, "Kills Can Be at Max 100"],
        default: null,
      },
    },
  ],
  Match_Status: {
    type: String,
    required: true,
    enum: ["Scheduled", "Started", "Completed"], //Started means room id password updated only
  },
  RoomDetails: {
    Name: {
      type: String,
      maxlength: 35,
      default: null,
      trim: true,
    },
    Password: {
      type: String,
      maxlength: 15,
      default: null,
      trim: true,
    },
    YT_Video_id: {
      type: String,
      maxlength: 50,
      default: null,
      trim: true,
    },
  },
  EntryFee_Refunded: {
    type: Boolean,
    required: true,
    default: false,
  },
  Date_Time: {
    type: Date,
    required: [true, "Please Enter Date & Time"],
  },
});

const tournamentschema = mongoose.model("tournament", tournament_schema);
module.exports = tournamentschema;
