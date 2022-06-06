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
  Total_Players: {
    type: Number,
    required: [true, "Please Enter Players"],
    maxLength: [3, "Too much players"],
  },
  Prize_Pool: {
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
      Kills: {
        type: Number,
        min: [0, "Kills Must Be at Least 20"],
        max: [20, "Kills Can Be at Max 20"],
        default: null,
      },
    },
  ],
  Is_Finished: {
    type: Boolean,
    default: false,
  },
  Date_Time: {
    type: Date,
    required: [true, "Please Enter Date & Time"],
  },
});

const tournamentschema = mongoose.model("tournament", tournament_schema);
module.exports = tournamentschema;
