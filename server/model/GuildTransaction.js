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
  },
  Message: {
    type: String,
    required: true,
    trim: true,
  },
  Amount: {
    type: Number,
    required: true,
  },
  Type: {
    type: Boolean,
    required: true, //True For Added, False For Deduction
  },
  Date: {
    type: Date,
    required: true,
  },
});

const Guild_TransactionModal = mongoose.model(
  "Guild_Transaction",
  Guild_Transaction_schema
);
module.exports = Guild_TransactionModal;
