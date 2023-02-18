const express = require("express");
const route = express.Router();
const Get_User_id = require("../Middleware/getuserid");
const { v4: uuidv4 } = require("uuid");
const userschema = require("../model/userdata");
const UserModal = require("../model/userdata");
const TransactionModal = require("../model/Transaction");
const GuildTransaction = require("../model/GuildTransaction");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const tournamentschema = require("../model/tournament");
const Order_Id_Schema = require("../model/Payment_Orders");
const mongoose = require("mongoose");

const instance = new Razorpay({
  key_id: process.env.Key,
  key_secret: process.env.SECREAT,
});

// RazerPay Route
route.post("/MakePayment", Get_User_id, async (req, res) => {
  try {
    var options = {
      amount: Number(req.body.Amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    const New_Order = new Order_Id_Schema({
      UserId: req.user.id,
      order_Id: order.id,
    });
    await New_Order.save();
    return res.status(200).json({ order, key_id: process.env.Key });
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Get Payment Status
route.get("/GetPaymentStatus/:Order_Id", Get_User_id, async (req, res) => {
  try {
    let Is_Transc_Available = await TransactionModal.find({
      User: req.user.id,
      Transaction_Id: req.params.Order_Id,
    });
    if (!Is_Transc_Available) {
      return res
        .status(253)
        .send(
          "Processing Payment, Amount Will be Added To Wallet Shortly!, If Not You can reach out to us, we will make Refund, We are really sorry for inconvenience"
        );
    } else {
      return res.status(200).send("Successful!, Amount Added to Gamer Wallet");
    }
  } catch (error) {
    return res.status(500).send("Something Went Wrong");
  }
});

route.post("/itsasecreat", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const SECREAT = process.env.VERIFY_SECREAT;
    const expectedSignature = crypto
      .createHmac("sha256", SECREAT)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (
      expectedSignature === req.headers["x-razorpay-signature"] &&
      req.body.payload.payment.entity.status === "captured"
    ) {
      const User = await Order_Id_Schema.findOne({
        order_Id: req.body.payload.payment.entity.order_id,
      });
      if (User) {
        await UserModal.findByIdAndUpdate(
          User.UserId,
          {
            $inc: {
              Wallet_Coins: req.body.payload.payment.entity.amount / 100,
            },
          },
          { new: true, runValidators: true, session }
        );
        const New_Transaction = new TransactionModal({
          User: User.UserId,
          Transaction_Id: req.body.payload.payment.entity.order_id,
          Message: `Added Rs${
            req.body.payload.payment.entity.amount / 100
          } to Wallet`,
          Amount: req.body.payload.payment.entity.amount / 100,
          Type: true,
          Date: Date.now(),
        });
        await New_Transaction.save({ session });
        await Order_Id_Schema.findByIdAndDelete(User._id);
        await session.commitTransaction();
      }
    }
  } catch (error) {
    await session.abortTransaction();
  } finally {
    session.endSession();
    return res.json({ status: "ok" });
  }
});

route.get("/GetUserWalletBallance", Get_User_id, async (req, res) => {
  try {
    let user = await userschema.findById(req.user.id);
    if (!user) {
      return res.status(500).send("Somethig goes wrong");
    } else {
      return res.status(200).json({ Ballance: user.Wallet_Coins });
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Get Club Wallet Coins
route.get("/ClubWalletBallance", Get_User_id, async (req, res) => {
  try {
    let user = await userschema.findById(req.user.id);
    if (!user) {
      return res.status(500).send("User Not Exist May be");
    } else {
      return res.status(200).json({ Ballance: user.Club_Wallet_Coins });
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

route.get("/getUserTransactions", Get_User_id, async (req, res) => {
  try {
    const Result_Per_Page = 10;
    const Current_Page = Number(req.query.Page) || 1;
    const Skip = Result_Per_Page * (Current_Page - 1);
    let Transcation = await TransactionModal.find({ User: req.user.id })
      .limit(Result_Per_Page)
      .skip(Skip)
      .sort({
        Date: -1,
      });
    if (Transcation) {
      return res.status(200).send(Transcation);
    } else {
      return res.status(404).send("Not found");
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

route.get("/getClubTransactions/:Guildid", Get_User_id, async (req, res) => {
  try {
    const Result_Per_Page = 10;
    const Current_Page = Number(req.query.Page) || 1;
    const Skip = Result_Per_Page * (Current_Page - 1);
    let Transcation = await GuildTransaction.find({
      GuildId: req.params.Guildid,
    })
      .limit(Result_Per_Page)
      .skip(Skip);
    if (Transcation) {
      res.status(200).send(Transcation);
    } else {
      return res.status(404).send("Not found");
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

route.get("/GetMoneyRefund/:Match_Id", Get_User_id, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const MatchId = req.params.Match_Id;
    const Match = await tournamentschema.findOne({
      $or: [
        {
          _id: MatchId,
          "Joined_User.UserId": req.user.id,
          Date_Time: { $lt: Date.now() },
          Match_Status: "Scheduled",
        },
        {
          _id: MatchId,
          "Joined_User.UserId": req.user.id,
          Date_Time: { $lt: Date.now() - 14400000 },
          Match_Status: "Started",
        },
      ],
    });
    if (Match) {
      const Is_Refunded_Already = Match.Joined_User.find(
        (user) => user.Is_EntryFee_Refunded === true
      );
      if (Is_Refunded_Already) {
        return res
          .status(200)
          .send("Already Refunded, Check Gamer Wallet Transactions");
      }
      await UserModal.findByIdAndUpdate(
        req.user.id,
        {
          $inc: {
            Wallet_Coins: Match.EntryFee,
          },
        },
        { new: true, runValidators: true, session }
      );
      const Found_Index = Match.Joined_User.findIndex(
        (x) => x.UserId.toString() === req.user.id.toString()
      );
      Match.Joined_User[Found_Index].Is_EntryFee_Refunded = true;
      await Match.save({ session });
      const New_Transaction = new TransactionModal({
        User: req.user.id,
        Transaction_Id: uuidv4(),
        Message: `Refunded ${Match.EntryFee} For ${Match.Game_Name}`,
        Amount: Match.EntryFee,
        Type: true,
        Date: Date.now(),
      });
      await New_Transaction.save({ session });
      await session.commitTransaction();
      return res
        .status(200)
        .send("Sucessfully Refunded, Amount Added to Gamer Wallet");
    } else {
      return res.status(404).send("Something went wrong");
    }
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).send("Something Goes Wrong");
  } finally {
    session.endSession();
  }
});

module.exports = route;
