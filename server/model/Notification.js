const mongoose = require("mongoose");

const Notification_schema = new mongoose.Schema({
  Notification_Header: {
    type: String,
    required: true,
    trim: true,
  },
  Main_Message: {
    type: String,
    required: true,
    trim: true,
  },
  Redirect_Link: {
    type: String,
    trim: true,
  },
  Receivers: [
    {
      UserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userdata",
      },
    },
  ],
  Is_Read: {
    type: Boolean,
    default: false,
  },
  Date: {
    type: Date,
    default: Date.now(),
  },
});
