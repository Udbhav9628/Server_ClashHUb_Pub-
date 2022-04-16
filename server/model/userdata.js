const mongoose = require("mongoose");

const userdata_schema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
    // select:false -- Need to do later refer project video
  },
  Wallet_Coins: {
    type: Number,
    default: 0,
    min: [0, "Coins Can be atleast 0"],
    max: [1000, "You Can't add More then 1000 coins"],
  },
  Date: {
    type: Date,
    default: Date.now(),
  },
  Role: {
    type: String,
    default: "user",
  },
});

const userschema = mongoose.model("userdata", userdata_schema);
module.exports = userschema;
