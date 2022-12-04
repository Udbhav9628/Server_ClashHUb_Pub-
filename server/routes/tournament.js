const express = require("express");
const route = express.Router();
const tournamentschema = require("../model/tournament");
const UserModal = require("../model/userdata");
const { v4: uuidv4 } = require("uuid");
const TransactionModal = require("../model/Transaction");
const GuildTransaction = require("../model/GuildTransaction");
const Get_User_id = require("../Middleware/getuserid");
const { body, validationResult } = require("express-validator");
const Guild_Schema = require("../model/Guild");
const {
  Api_Feature,
  MyMatches_Api_Feature,
  Guild_Matches_Api_Feature,
} = require("../utils/ApiFeature");
const mongoose = require("mongoose");

// fetch all tournaments
route.get("/fetchalltournament", Get_User_id, async (req, res) => {
  try {
    const Data = await new Api_Feature(
      tournamentschema,
      req.query,
      req.user.id
    ).Filter();
    res.send({ Data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//My Matches - Get Logged In User Joined Matches
route.get("/GetJoinedMatches", Get_User_id, async (req, res) => {
  try {
    const Data = await new MyMatches_Api_Feature(
      tournamentschema,
      req.query,
      req.user.id
    ).Filter();
    res.status(200).send(Data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//For App Only
route.get("/getGuildtournaments/:id", Get_User_id, async (req, res) => {
  try {
    const Data = await new Guild_Matches_Api_Feature(
      tournamentschema,
      req.query,
      req.params.id
    ).Filter();
    res.status(200).send({ Data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Join Match Route - put Request
route.put("/Jointournament/:id", Get_User_id, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    const match = await tournamentschema.findById(req.params.id);
    if (!match) {
      return res.status(404).send("Not Found");
    } else {
      const isJoined = match.Joined_User.find(
        (user) => user.UserId.toString() === req.user.id.toString()
      );
      if (isJoined) {
        return res
          .status(200)
          .json({ Sucess: false, Msg: "You Have already Joined" });
      } else {
        if (match.Joined_User.length === match.Total_Players) {
          return res.status(200).json({ Sucess: false, Msg: "Slots Full" });
        } else {
          const date = new Date(match.Date_Time);
          const Match_Time = date.getTime();
          if (Date.now() >= Match_Time) {
            return res.status(200).json({
              Sucess: false,
              Msg: "Can't Join, Match Started Allready",
            });
          }
          const User = await UserModal.findById(req.user.id);
          if (User) {
            let New_Amount = User.Wallet_Coins - req.body.Amount_to_be_paid;
            if (
              New_Amount >= 0 &&
              match.Joined_User.length < match.Total_Players
            ) {
              const User_Details = {
                UserId: req.user.id,
                UserName: req.user.Name,
                InGameName: req.body.InGameName,
              };
              match.Joined_User.push(User_Details);
              await match.save({ session });
              await UserModal.findByIdAndUpdate(
                req.user.id,
                {
                  $inc: {
                    Wallet_Coins: -parseInt(req.body.Amount_to_be_paid),
                  },
                },
                { new: true, runValidators: true, session }
              );
              const New_Transaction = new TransactionModal({
                User: req.user.id,
                Transaction_Id: match._id, // Match Id
                Message:
                  `Deducted ${req.body.Amount_to_be_paid} For Joining` +
                  ` ${match.Game_Name}`,
                Amount: req.body.Amount_to_be_paid,
                Type: false, //means deducted
                Date: Date.now(),
              });
              await New_Transaction.save({ session });
              await session.commitTransaction();
              return res.status(200).json({
                Sucess: true,
                Msg: "Entry Fee Deducted, Match Joined Successfully",
              });
            } else {
              return res.status(200).json({
                Sucess: false,
                Msg: "Low Balance, Add Some Coins First",
              });
            }
          } else {
            res.status(404).send("Something Went Wrong");
          }
        }
      }
    }
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).send(error.message);
  } finally {
    session.endSession();
  }
});

//Create -- Admin Route
route.post(
  "/createtournament",
  Get_User_id,
  [
    body("Game_Name", "Game_Name must be atleaset 3 char").isLength({ min: 3 }),
    body("Perkill_Prize", "Perkill_Prize must be atleaset 1 char").isLength({
      min: 1,
    }),
    body("EntryFee", "EntryFee must be atleaset 1 char").isLength({
      min: 1,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json({ errors: errors.array() });
    }
    try {
      let Guild = await Guild_Schema.findById(req.body.Guild_Id);
      if (!Guild) {
        return res.status(200).send({
          status: false,
          Message: "Guild Does not Exist , Create First",
        });
      } else {
        const new_tournament = new tournamentschema({
          GuildId: Guild._id,
          UserId: req.user.id,
          Game_Name: req.body.Game_Name,
          GameType: req.body.GameType,
          Map: req.body.GameMap,
          Total_Players: req.body.Total_Players,
          EntryFee: req.body.EntryFee,
          Perkill_Prize: req.body.Perkill_Prize,
          Match_Status: "Scheduled",
          Date_Time: req.body.Date_Time,
        });
        new_tournament.save().then((data) => {
          return res.status(200).json({ data });
        });
      }
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
);

//Update Result -- Admin Route
//Check
route.put("/UpdateResult/:id", Get_User_id, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Not Found");
    } else if (tournament_found.UserId.toString() !== req.user.id.toString()) {
      return res.status(500).send("Not Allowed");
    } else {
      const date = new Date(tournament_found.Date_Time);
      const MatchTime_In_MS = date.getTime();
      const now = new Date().getTime();
      const Time_Gap = now - MatchTime_In_MS;
      if (
        Time_Gap > 14400000 &&
        tournament_found.Match_Status === "Started" &&
        Time_Gap > 1 //Means Match Started
      ) {
        return res
          .status(200)
          .send(
            "OH HO! Match Has Been Cancelled Because You Did Not Publish Result within Time Limit, Time Limit is Within 4 Hours of Match Start Time"
          );
      }
      const response = await tournamentschema.findByIdAndUpdate(
        req.params.id,
        {
          Joined_User: req.body.Joined_User,
          Match_Status: "Completed",
        },
        { new: true, runValidators: true, session }
      );
      //Club Earning
      const Total_earning =
        response.Joined_User.length *
        (response.EntryFee - parseInt(response.Perkill_Prize));
      const Guild_Amount = Total_earning;

      if (Guild_Amount > 0) {
        await UserModal.findByIdAndUpdate(
          req.user.id,
          {
            $inc: {
              Club_Wallet_Coins: Guild_Amount,
            },
          },
          { new: true, runValidators: true, session }
        );

        const New_Guild_Transaction = new GuildTransaction({
          MatchId: response._id,
          GuildId: response.GuildId,
          Transaction_Id: uuidv4(),
          Message:
            "Added For " +
            response.Joined_User.length +
            ` Players in ${response.Game_Name}`,
          Amount: Guild_Amount,
          Type: true,
          Date: Date.now(),
        });
        await New_Guild_Transaction.save({ session });
      }

      response.Joined_User.forEach(async (Player) => {
        if (Player.Kills * parseInt(response.Perkill_Prize) > 0) {
          await UserModal.findByIdAndUpdate(
            Player.UserId,
            {
              $inc: {
                Wallet_Coins: Player.Kills * parseInt(response.Perkill_Prize),
              },
            },
            { new: true, runValidators: true, session }
          );
          const New_Transaction = new TransactionModal({
            User: Player.UserId,
            Transaction_Id: response._id, // Match Id
            Message:
              "Added For " + Player.Kills + ` Kills in ${response.Game_Name}`,
            Amount: Player.Kills * parseInt(response.Perkill_Prize),
            Type: true,
            Date: Date.now(),
          });
          await New_Transaction.save({ session });
        }
      });
      await session.commitTransaction();
      return res.status(200).send("Result Published");
    }
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).send(error.message);
  } finally {
    session.endSession();
  }
});

//Update Room Details
route.put("/UpdateRoom_Details/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Not Found");
    } else if (tournament_found.UserId.toString() !== req.user.id.toString()) {
      return res.status(500).send("Not Allowed");
    } else {
      const date = new Date(tournament_found.Date_Time);
      const milliseconds = date.getTime();
      if (Date.now() + 600000 >= milliseconds) {
        return res
          .status(200)
          .send(
            "OH HO! You Are Late, You Can Enter Room Details till 10 Min Before Match Start Time"
          );
      }
      await tournamentschema.findByIdAndUpdate(
        req.params.id,
        {
          RoomDetails: req.body,
          Match_Status: "Started",
        },
        { new: true, runValidators: true }
      );
      return res.status(200).send("Room Details Updated Sucessfully");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

route.get(
  "/Fetch_Match_Room_Details/:Matchid",
  Get_User_id,
  async (req, res) => {
    try {
      const match = await tournamentschema.findById(req.params.Matchid);
      if (!match) {
        return res.status(404).send("Not Found");
      } else {
        const isJoined = match.Joined_User.find(
          (user) => user.UserId.toString() === req.user.id.toString()
        );
        if (isJoined) {
          if (match.Match_Status !== "Scheduled") {
            res.status(200).json({
              Sucess: true,
              RoomId: match.RoomDetails.Name,
              RoomPass: match.RoomDetails.Password,
            });
          } else {
            res.status(200).json({
              Sucess: false,
            });
          }
        } else {
          res.status(500).send("You Have Not Joined This Match Yet");
        }
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

// Delete-- Admin Route
route.delete("/Deletetournament/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Not found");
    } else if (tournament_found.User.toString() !== req.user.id.toString()) {
      //objectid is uhi not present just unhi that's why tostring is coverting it into string
      return res.status(200).send("Not Allowed");
    } else {
      await tournamentschema.findByIdAndDelete(req.params.id);
      res.send("Deleted Sucessfully");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
