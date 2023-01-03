const mongoose = require("mongoose");

const tournament_schema = new mongoose.Schema({
  GuildId: {
    type: mongoose.Schema.Types.ObjectId,
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
    enum: ["BGMI", "FreeFire Max", "CODM"],
  },
  GameType: {
    type: String,
    required: true,
    trim: true,
    enum: ["Solo", "Duo", "Squad"],
  },
  Map: {
    type: String,
    required: [true, "Please Provide Map"],
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  Total_Players: {
    type: Number,
    required: [true, "Please Enter Players"],
    enum: [20, 40, 60, 80, 100],
  },
  EntryFee: {
    type: Number,
    required: true,
    min: 0,
    maxlength: 2,
  },
  Perkill_Prize: {
    type: Number,
    required: true,
    min: 0,
    maxlength: 2,
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
        trim: true,
        minlength: 2,
        maxlength: 30,
      },
      InGameName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30,
      },
      Kills: {
        type: Number,
        min: [0, "Kills Must Be at Least 0"],
        max: [100, "Kills Can Be at Max 100"],
        default: null,
      },
      Is_EntryFee_Refunded: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  ],
  Match_Status: {
    type: String,
    required: true,
    enum: ["Scheduled", "Started", "Completed"],
  },
  RoomDetails: {
    Name: {
      type: String,
      default: null,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    Password: {
      type: String,
      default: null,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    YT_Video_id: {
      type: String,
      default: null,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
  },
  Date_Time: {
    type: Date,
    required: [true, "Please Enter Date & Time"],
  },
});

const tournamentschema = mongoose.model("tournament", tournament_schema);
module.exports = tournamentschema;
