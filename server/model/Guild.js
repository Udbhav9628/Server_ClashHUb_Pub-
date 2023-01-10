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
    minlength: 2,
    maxlength: 30,
  },
  GuildID: {
    type: String,
    required: [true, "Please Enter Guild's ID"],
    trim: true,
    minlength: 1,
    maxlength: 30,
  },
  Profile_Pic: {
    type: String,
    required: [true, "Please Enter Profile_Pic"],
    trim: true,
    minlength: 1,
    maxlength: 50,
  },
  GuildDescription: {
    type: String,
    required: [true, "Please Enter Guild's Description"],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  Followers: [
    {
      FollowersId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userdata",
      },
      FollowersName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30,
      },
    },
  ],
  How_Many_Followers: {
    type: Number,
    required: true,
  },
});

const GuildSchema = mongoose.model("Guild", Guild_Schema);
module.exports = GuildSchema;
