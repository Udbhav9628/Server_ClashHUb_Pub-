const express = require("express");
const route = express.Router();
const tournamentschema = require("../model/tournament");
const UserModal = require("../model/userdata");
const { v4: uuidv4 } = require("uuid");
const TransactionModal = require("../model/Transaction");
const GuildTransaction = require("../model/GuildTransaction");
const Get_User_id = require("../Middleware/getuserid");
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
    return res.status(200).send({ Data });
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
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
    return res.status(200).send(Data);
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Get Matches which have videos only
route.get("/GetVideosMatches", Get_User_id, async (req, res) => {
  try {
    const Result_Per_Page = 20;
    const Current_Page = Number(req.query.Page) || 1;
    const Skip = Result_Per_Page * (Current_Page - 1);
    const Data = await tournamentschema
      .find({
        "RoomDetails.YT_Video_id": { $ne: null },
        UserId: { $ne: req.user.id },
      })
      .sort({
        Date_Time: -1,
      })
      .limit(Result_Per_Page)
      .skip(Skip);
    return res.status(200).send(Data);
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

// TO DO - Fix Problem any Logedin used get any club Matches Using his authtoken
route.get("/getGuildtournaments/:id", Get_User_id, async (req, res) => {
  try {
    const Data = await new Guild_Matches_Api_Feature(
      tournamentschema,
      req.query,
      req.params.id
    ).Filter();
    return res.status(200).send({ Data });
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Join Match Route - put Request
route.put("/Jointournament/:id", Get_User_id, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const match = await tournamentschema.findById(req.params.id);
    if (!match) {
      return res.status(404).send("Something wrong");
    } else {
      const isJoined = match.Joined_User.find(
        (user) => user.UserId.toString() === req.user.id.toString()
      );
      if (isJoined) {
        return res
          .status(200)
          .json({ Sucess: false, Msg: "You Have already Joined" });
      } else {
        if (match.Joined_User.length >= match.Total_Players) {
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
            let New_Amount = User.Wallet_Coins - match.EntryFee;
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
                    Wallet_Coins: -parseInt(match.EntryFee),
                  },
                },
                { new: true, runValidators: true, session }
              );
              const New_Transaction = new TransactionModal({
                User: req.user.id,
                Transaction_Id: match._id, // Match Id
                Message:
                  `Joined` +
                  ` ${req.body.MatchIdLast2_char} ${match.Game_Name} Match`,
                Amount: match.EntryFee,
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
    return res.status(500).send("Something Goes Wrong");
  } finally {
    session.endSession();
  }
});

//Create -- Admin Route
route.post("/createtournament", Get_User_id, async (req, res) => {
  try {
    let Guild = await Guild_Schema.findById(req.body.Guild_Id);
    if (!Guild) {
      return res.status(200).send({
        status: false,
        Message: "Guild Does not Exist , Create First",
      });
    } else {
      if (Guild.Followers.length < 250 && Number(req.body.EntryFee) > 25) {
        return res
          .status(200)
          .send(
            "Club Needs At least 250 Followers To Take Entry Fees More Then Rs 25"
          );
      }
      if (Number(req.body.Perkill_Prize) > Number(req.body.EntryFee)) {
        return res
          .status(200)
          .send(
            "Per Kill Prize is More Then Entry Fees , It Should be less or Equals to Entry Fee"
          );
      }
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
      new_tournament.save().then(() => {
        return res.status(200).send("Match Published Sucessfully");
      });
    }
  } catch (error) {
    return res.status(500).send("SomeThing Went Wrong");
  }
});

//Update Result -- Admin Route
//Check
route.put("/UpdateResult/:id", Get_User_id, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(200).send("Match Does Not Exist");
    } else if (tournament_found.UserId.toString() === req.user.id.toString()) {
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
      if (tournament_found.Match_Status === "Completed") {
        return res.status(200).send("Match Result Already Published");
      }
      let Total_Kills = 0;
      req.body.Joined_User.forEach((data) => {
        Total_Kills = Total_Kills + Number(data.Kills);
      });
      if (Total_Kills > tournament_found.Joined_User.length - 1) {
        return res
          .status(200)
          .send(
            "Total Kills of All Player Combined can't be more then No of Total Player Joined in this Match - 1, Because 1 Player Remains Alive N"
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
      let Guild_Amount = Total_earning;
      if (tournament_found.Joined_User.length > 1) {
        Guild_Amount = Guild_Amount + tournament_found.Perkill_Prize;
      }
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
            ` Players in ${req.body._id} ${response.Game_Name}`,
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
    } else {
      return res.status(500).send("Something wrong");
    }
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).send("Something Goes Wrong");
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
    } else if (tournament_found.UserId.toString() === req.user.id.toString()) {
      const date = new Date(tournament_found.Date_Time);
      const milliseconds = date.getTime();
      if (Date.now() + 600000 >= milliseconds) {
        return res
          .status(200)
          .send(
            "OH HO! You Are Late, You Can Enter Room Details till 10 Min Before Match Start Time"
          );
      }
      if (tournament_found.Match_Status !== "Started") {
        await tournamentschema.findByIdAndUpdate(
          req.params.id,
          {
            RoomDetails: {
              Name: req.body.Name,
              Password: req.body.Password,
              YT_Video_id: null,
            },
            Match_Status: "Started",
          },
          { new: true, runValidators: true }
        );
        return res.status(200).send("Room Details Updated Sucessfully");
      } else {
        return res.status(200).send("Started Already");
      }
    } else {
      return res.status(500).send("Not Allowed");
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Update Video Details
route.put("/UpdateVideo_Details/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Something Went Wrong");
    } else if (tournament_found.UserId.toString() === req.user.id.toString()) {
      if (
        tournament_found.Match_Status === "Started" ||
        tournament_found.Match_Status === "Completed"
      ) {
        const tournament = await tournamentschema.findOne({
          "RoomDetails.YT_Video_id": req.body.YT_Video_id,
        });
        if (tournament) {
          return res.status(200).send("This Video Already Exist");
        }
        if (tournament_found.RoomDetails.YT_Video_id === null) {
          req.body;
          await tournamentschema.findByIdAndUpdate(
            req.params.id,
            {
              RoomDetails: {
                Name: tournament_found.RoomDetails.Name,
                Password: tournament_found.RoomDetails.Password,
                YT_Video_id: req.body.YT_Video_id,
              },
            },
            { new: true, runValidators: true }
          );
          return res.status(200).send("Shared Sucessfully");
        }
      } else {
        return res
          .status(200)
          .send("Enter Room Details First Before Broadcasting");
      }
    } else {
      return res.status(500).send("Not Allowed");
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
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
      return res.status(500).send("Something Goes Wrong");
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
      return res.status(200).send("Not Allowed");
    } else {
      await tournamentschema.findByIdAndDelete(req.params.id);
      return res.send("Deleted Sucessfully");
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

module.exports = route;
