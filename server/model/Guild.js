const mongoose = require("mongoose");

const Guild_Schema = new mongoose.Schema({
  OwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdata",
    required: true,
  },
  GuildName: {
    type: String,
    required: [true, "Please Enter Guild's Name"],
    trim: true,
  },
  GuildDescription: {
    type: String,
    required: [true, "Please Enter Guild's Description"],
    trim: true,
  },
  Members: [
    {
      UserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userdata",
      },
    },
  ],
});

const GuildSchema = mongoose.model("Guild", Guild_Schema);
module.exports = GuildSchema;
