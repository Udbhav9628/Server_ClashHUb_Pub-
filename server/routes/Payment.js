const express = require("express");
const route = express.Router();
const Get_User_id = require("../Middleware/getuserid");
const PaytmChecksum = require("../Middleware/PaytmChecksum");
const { v4: uuidv4 } = require("uuid");
const userschema = require("../model/userdata");
const UserModal = require("../model/userdata");

route.post("/MakePayment", Get_User_id, async (req, res) => {
  try {
    // const { Amount, Email } = req.body;
    // const Total_Amount = json.toString(Amount);
    // console.log(Total_Amount);

    var paytmParams = {};

    paytmParams["MID"] = "nRiwPv36348291111478";
    paytmParams["WEBSITE"] = "WEBSTAGING";
    paytmParams["CHANNEL_ID"] = "WAP";
    paytmParams["INDUSTRY_TYPE_ID"] = "Retail";
    paytmParams["ORDER_ID"] = uuidv4();
    paytmParams["CUST_ID"] = req.user.id;
    paytmParams["TXN_AMOUNT"] = "10";
    paytmParams["CALLBACK_URL"] = "http://localhost:5000/api/callback";
    paytmParams["EMAIL"] = "udbhav9628@gmail.com";
    paytmParams["MOBILE_NO"] = "8750778918";

    var paytmChecksum = PaytmChecksum.generateSignature(
      paytmParams,
      "4qFV6GxVwJnozi3j"
    );

    paytmChecksum
      .then(function (checksum) {
        console.log("generateSignature Returns: " + checksum);
        let PaytmParams = {
          ...paytmParams,
          ChecksumHash: checksum,
        };
        return res.status(200).json(PaytmParams);
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

route.get("/GetUserWalletBallance", Get_User_id, async (req, res) => {
  try {
    let user = await userschema.findById(req.user.id);
    if (!user) {
      return res.status(500).send("User Not Exist May be");
    } else {
      return res.status(200).json({ Ballance: user.Wallet_Coins });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

route.put("/AddingCoins", Get_User_id, async (req, res) => {
  try {
    const User = await UserModal.findById(req.user.id);
    if (User) {
      let New_Amount =
        parseInt(User.Wallet_Coins) + parseInt(req.body.New_Ballance);
      await UserModal.findByIdAndUpdate(
        req.user.id,
        {
          Wallet_Coins: New_Amount,
        },
        { new: true }
      );
      res.status(200).send("Wallet Updated");
    } else {
      res.status(500).send("User Not Found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
