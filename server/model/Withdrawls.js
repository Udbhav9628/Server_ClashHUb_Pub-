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
    maxlength: 50,
  },
  Amount: {
    type: Number,
    required: true,
    min: 0,
    max: 10000,
  },
  Status: {
    type: String,
    required: true,
    enum: ["Pending", "Completed", "Rejected"],
  },
  WithdrawlReq_Date: {
    type: Date,
    required: true,
  },
  WithdrawlComp_Date: {
    type: Date,
  },
});

const WithdrawlsModal = mongoose.model("Withdrawl", Withdrawls_schema);
module.exports = WithdrawlsModal;
