const express = require("express");
const route = express.Router();
const Withdrawls = require("../model/Withdrawls");
const Get_User_id = require("../Middleware/getuserid");

// route.post("/createWithdrawls", Get_User_id, async (req, res) => {
//   try {
//     const data = {
//       account_number: "7878780080316316",
//       amount: 1000,
//       currency: "INR",
//       mode: "UPI",
//       purpose: "refund",
//       fund_account: {
//         account_type: "vpa",
//         vpa: {
//           address: "8750778918@paytm",
//         },
//         contact: {
//           name: "Udbhav Vikram Singh",
//           email: "udbhav9628@gmail.com",
//           contact: "8750778918",
//           type: "self",
//           reference_id: "Acme Contact ID 12345",
//           notes: {
//             notes_key_1: "Tea, Earl Grey, Hot",
//             notes_key_2: "Tea, Earl Grey… decaf.",
//           },
//         },
//       },
//       queue_if_low_balance: true,
//       reference_id: "Acme Transaction ID 12345",
//       narration: "Acme Corp Fund Transfer",
//       notes: {
//         notes_key_1: "Beam me up Scotty",
//         notes_key_2: "Engage",
//       },
//     };

//     await axios.post("https://reqres.in/api/users", data);
//     const response = await axios.post("https://reqres.in/api/users", data, {
//       headers: {
//         "content-type": "application/json",
//         Accept: "application/json",
//         Authorization: "ApiKey myUser:verySecretAPIKey",
//       },
//     });
//     console.log(response);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

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
      return res
        .status(200)
        .send(
          "Withdrawl Requested, You Will get Your Money in your upi Within 24 Hours"
        );
    }
  } catch (error) {
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
    return res.status(500).send(error.message);
  }
});

module.exports = route;
