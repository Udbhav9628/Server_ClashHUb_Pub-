const express = require("express");
const route = express.Router();
const Withdrawls = require("../model/Withdrawls");
const Get_User_id = require("../Middleware/getuserid");
const UserModal = require("../model/userdata");

//RazorPayX Payout Route
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
//   } catch (error) {
//     return res.status(500).send("Something Goes Wrong");
//   }
// });

route.post("/createWithdrawls", Get_User_id, async (req, res) => {
  try {
    const Iswithdrawlpending = await Withdrawls.findOne({
      User: req.user.id,
      Is_Club: req.body.Is_Club,
      Status: "Pending",
    });

    const User = await UserModal.findById(req.user.id);
    let WalletCoine_User_have = 0;
    if (req.body.Is_Club) {
      WalletCoine_User_have = User.Club_Wallet_Coins;
    } else {
      WalletCoine_User_have = User.Wallet_Coins;
    }

    if (Iswithdrawlpending) {
      return res
        .status(200)
        .send("One Withdrawal is already Pending, Let That complete first");
    } else if (WalletCoine_User_have < req.body.Amount) {
      return res.status(200).send("Low Ballance");
    } else {
      const new_Withdrawls = new Withdrawls({
        User: req.user.id,
        Message: `Withdrawal of ${req.body.Amount} is`,
        UPI_Id: req.body.UPI_Id,
        Amount: req.body.Amount,
        Is_Club: req.body.Is_Club,
        Status: "Pending",
        WithdrawlReq_Date: Date.now(),
      });
      const data = await new_Withdrawls.save();
      return res
        .status(200)
        .send(
          "Withdrawal Requested, Money Will be send to UPI Within 24 Hours"
        );
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

route.get(
  "/getAll_Gamer_Wallet_Withdrawrequest",
  Get_User_id,
  async (req, res) => {
    try {
      let PendigWithdrawls = await Withdrawls.find({
        User: req.user.id,
        Is_Club: false,
      });
      if (PendigWithdrawls) {
        return res.status(200).send(PendigWithdrawls);
      }
    } catch (error) {
      return res.status(500).send("Something Goes Wrong");
    }
  }
);

route.get(
  "/getAll_Club_Wallet_Withdrawrequest",
  Get_User_id,
  async (req, res) => {
    try {
      let PendigWithdrawls = await Withdrawls.find({
        User: req.user.id,
        Is_Club: true,
      });
      if (PendigWithdrawls) {
        return res.status(200).send(PendigWithdrawls);
      }
    } catch (error) {
      return res.status(500).send("Something Goes Wrong");
    }
  }
);

module.exports = route;
