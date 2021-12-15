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
  },
  Wallet_Coins: {
    type: Number,
    default: 0,
  },
  Date: {
    type: Date,
    default: Date.now(),
  },
});

const userschema = mongoose.model("userdata", userdata_schema);
module.exports = userschema;
