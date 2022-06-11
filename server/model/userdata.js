const mongoose = require("mongoose");

const userdata_schema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    trim: true,
  },
  UserName: {
    type: String,
    required: true,
    trim: true,
  },
  Phone_No: {
    type: Number,
    required: true,
  },
  FCMToken: {
    type: String,
    required: true,
  },
  User_Uid: {
    type: String,
    required: true,
  },
  Wallet_Coins: {
    type: Number,
    default: 500,
    min: [0, "Coins Can be atleast 0"],
    max: [1000, "You Can't add More then 1000 coins"],
  },
  Join_Date: {
    type: Date,
    default: Date.now(),
  },
  Role: {
    type: String,
    default: "user",
    //select:false -- Need to do later refer project video
    //Trim -- Need to do later refer project video
  },
});

const userschema = mongoose.model("userdata", userdata_schema);
module.exports = userschema;
