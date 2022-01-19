const mongoose = require("mongoose");

const Kills_Schema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdata",
    required: true,
  },
  TournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tournament",
    required: true,
  },
  Kills: {
    type: Number,
    min: [0, "Kills Must Be at Least 0"],
    max: [20, "Kills Can Be at Max 20"],
    default: null,
  },
});

const KillSchema = mongoose.model("Kill", Kills_Schema);
module.exports = KillSchema;
