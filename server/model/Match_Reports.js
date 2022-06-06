const mongoose = require("mongoose");

const Match_Reports_Sechma = new mongoose.Schema({
  MatchId: {
    type: mongoose.Schema.Types.ObjectId, //it will take
    ref: "tournament",
    required: true,
  },
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdata",
    required: true,
  },
  Description: {
    type: String,
    trim: true,
  },
  Report_Date_Time: {
    type: Date,
    required: [true, "Please Enter Report Date & Time"],
  },
});

const Report_schema = mongoose.model("Match_Reports", Match_Reports_Sechma);
module.exports = Report_schema;
