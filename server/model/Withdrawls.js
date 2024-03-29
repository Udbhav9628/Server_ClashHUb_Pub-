const mongoose = require("mongoose");

const Withdrawls_schema = new mongoose.Schema({
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdata",
    required: true,
  },
  Transaction_Id: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  Message: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 60,
  },
  UPI_Id: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 60,
  },
  Amount: {
    type: Number,
    required: true,
    min: 0,
    max: 10000,
  },
  Is_Club: {
    type: Boolean,
    required: true,
  },
  Status: {
    type: String,
    required: true,
    enum: [
      "Pending",
      "Completed",
      "Rejected",
      "Rejected Low Balance",
      "Rejected Invalid UPI",
    ],
  },
  WithdrawlReq_Date: {
    type: Date,
    required: true,
  },
  WithdrawlComp_Date: {
    type: Date,
    default: null,
  },
});

const WithdrawlsModal = mongoose.model("Withdrawl", Withdrawls_schema);
module.exports = WithdrawlsModal;
