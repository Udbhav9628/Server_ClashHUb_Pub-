const mongoose = require("mongoose");

const Payment_Orders_Schema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdata",
    required: true,
  },
  order_Id: {
    type: String,
    required: [true, "Please Provide order_Id"],
    minlength: 2,
    maxlength: 500,
  },
});

const Order_Id_Schema = mongoose.model("Payments_Order", Payment_Orders_Schema);
module.exports = Order_Id_Schema;
