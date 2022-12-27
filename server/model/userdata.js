const mongoose = require("mongoose");

const userdata_schema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 60,
  },
  UserName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 2,
    maxlength: 30,
  },
  PhotoUrl: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  FCMToken: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  User_Uid: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  Wallet_Coins: {
    type: Number,
    default: 0,
    min: [0, "Coins Can be atleast 0"],
    max: [10000, "You Can't add More then 1000 coins"],
  },
  Club_Wallet_Coins: {
    type: Number,
    default: 0,
    min: [0, "Coins Can be atleast 0"],
    max: [10000, "Can't More then 1000 coins"],
  },
  Join_Date: {
    type: Date,
    default: Date.now(),
  },
});

const userschema = mongoose.model("userdata", userdata_schema);
module.exports = userschema;
