const express = require("express");
const route = express.Router();
const tournamentschema = require("../model/tournament");
const UserModal = require("../model/userdata");
const Get_User_id = require("../Middleware/getuserid");
const { body, validationResult } = require("express-validator");
const Guild_Schema = require("../model/Guild");
const {
  Api_Feature,
  MyMatches_Api_Feature,
  Guild_Matches_Api_Feature,
} = require("../utils/ApiFeature");

// const Errror_Handler = require("../utils/errorhandler");

// fetch all tournaments
route.get("/fetchalltournament", Get_User_id, async (req, res) => {
  try {
    const ResultPerPage = 2;
    const Data = await new Api_Feature(
      tournamentschema,
      req.query,
      req.user.id,
      ResultPerPage
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
    res.send(Data);
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
    res.send({ Data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get Specific Tournament Details
//For Web Only
route.get("/gettournamentdetails/:id", Get_User_id, async (req, res) => {
  try {
    const Data = await tournamentschema.find({ User: req.user.id });
    res.send({ Data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Join Match Route - put Request
//Two await in single route check if is ok
route.put("/Jointournament/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Not Found");
    }
    // else if (tournament_found.User.toString() !== req.user.id) {
    //   // need to modify
    //   return res.status(404).send("You Have already Joined The Match");
    // }
    else {
      const User_Details = {
        UserId: req.user.id, //logged in user id
        UserName: req.user.Name,
      };
      const match = await tournamentschema.findById(req.params.id);
      const isJoined = match.Joined_User.find(
        (user) => user.UserId.toString() === req.user.id.toString()
      );
      if (isJoined) {
        res.status(200).send("You Have already Joined");
      } else {
        match.Joined_User.push(User_Details);
        match.Joined_Player = match.Joined_User.length;
        const User = await UserModal.findById(req.user.id);
        if (User) {
          let New_Amount = User.Wallet_Coins - req.body.Amount_to_be_paid;
          await UserModal.findByIdAndUpdate(
            req.user.id, ////comming from jwt token
            {
              Wallet_Coins: New_Amount,
            },
            { new: true }
          );
          await match.save();
          //Join User will be saved after wallet ballance updated - but one problem what if wallet ballance updated but error occured while performing match.save() function
          res.status(200).send("Wallet Updated , Match Joined Successfully");
        } else {
          res.status(500).send("User Not Found");
        }
      }
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Create -- Admin Route
route.post(
  "/createtournament",
  Get_User_id,
  [
    body("Game_Name", "Game_Name must be atleaset 3 char").isLength({ min: 3 }),
    body("Prize_Pool", "Prize_Pool must be atleaset 3 char").isLength({
      min: 1,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
          Total_Players: req.body.Total_Players,
          Prize_Pool: req.body.Prize_Pool,
          Date_Time: req.body.Date_Time,
        });
        new_tournament.save().then((data) => {
          res.json({ data });
        });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//Update -- Admin Route
route.put("/Updatetournament/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Not Found");
    } else if (tournament_found.UserId.toString() !== req.user.id.toString()) {
      return res.status(404).send("Not Allowed");
    } else {
      const response = await tournamentschema.findByIdAndUpdate(
        req.params.id,
        {
          Game_Name: req.body.Game_Name,
          Total_Players: req.body.Total_Players,
          Prize_Pool: req.body.Prize_Pool,
          Joined_User: req.body.Joined_User,
          Is_Finished: true,
        },
        { new: true, runValidators: true }
      );
      response.Joined_User.forEach(async (Player) => {
        await UserModal.findByIdAndUpdate(
          Player.UserId,
          {
            $inc: {
              Wallet_Coins: Player.Kills * parseInt(response.Prize_Pool),
            },
          },
          { new: true }
        );
      });
      return res.send("Result Updated Sucessfully");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete-- Admin Route
route.delete("/Deletetournament/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Not allowed");
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
