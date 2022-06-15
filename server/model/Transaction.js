const mongoose = require("mongoose");

const Transaction_schema = new mongoose.Schema({
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdata",
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

const TransactionModal = mongoose.model("Transaction", Transaction_schema);
module.exports = TransactionModal;
