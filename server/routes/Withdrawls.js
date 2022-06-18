const express = require("express");
const route = express.Router();
const Withdrawls = require("../model/Withdrawls");
const Get_User_id = require("../Middleware/getuserid");

route.post("/createWithdrawls", Get_User_id, async (req, res) => {
  try {
    const Iswithdrawlpending = await Withdrawls.findOne({
      User: req.user.id,
      Status: "Pending",
    });
    if (Iswithdrawlpending) {
      return res
        .status(200)
        .send("One Withdrawls is already Pending, Let Them complete first");
    } else {
      const new_Withdrawls = new Withdrawls({
        User: req.user.id,
        Message: `Withdrawls of ${req.body.Amount} is Pending`,
        Amount: req.body.Amount,
        Status: "Pending",
        WithdrawlReq_Date: Date.now(),
      });
      const data = await new_Withdrawls.save();
      return res.status(200).send("Created Sucessfully");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

route.get("/getPendingWithdrawrequest", Get_User_id, async (req, res) => {
  try {
    let PendigWithdrawls = await Withdrawls.find({
      User: req.user.id,
      Status: "Pending",
    });
    if (PendigWithdrawls) {
      return res.status(200).send(PendigWithdrawls);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

module.exports = route;
