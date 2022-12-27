const mongoose = require("mongoose");

const Guild_Transaction_schema = new mongoose.Schema({
  MatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tournament",
    required: true,
  },
  GuildId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guild",
    required: true,
  },
  Transaction_Id: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 40,
  },
  Message: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 100,
  },
  Amount: {
    type: Number,
    required: true,
    min: 0,
    max: 10000,
  },
  Type: {
    type: Boolean,
    required: true,
    default: null, //True For Added, False For Deduction
  },
  Date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

const Guild_TransactionModal = mongoose.model(
  "Guild_Transaction",
  Guild_Transaction_schema
);
module.exports = Guild_TransactionModal;
