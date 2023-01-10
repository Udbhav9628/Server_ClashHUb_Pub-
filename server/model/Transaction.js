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
    minlength: 2,
    maxlength: 200,
  },
  Message: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
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

const TransactionModal = mongoose.model("Transaction", Transaction_schema);
module.exports = TransactionModal;
