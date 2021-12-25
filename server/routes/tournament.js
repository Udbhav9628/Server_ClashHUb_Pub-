const express = require("express");
const route = express.Router();
const tournamentschema = require("../model/tournament");
const UserModal = require("../model/userdata");
const Get_User_id = require("../Middleware/getuserid");
const { body, validationResult } = require("express-validator");
// const Errror_Handler = require("../utils/errorhandler");

//Create -- Admin Route
route.post(
  "/createtournament",
  Get_User_id,
  [
    body("Game_Name", "Game_Name must be atleaset 3 char").isLength({ min: 3 }),
    body("Prize_Pool", "Prize_Pool must be atleaset 3 char").isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const new_tournament = new tournamentschema({
        User: req.user.id, //Whats we get from Get_User_id /Saved user payload
        Game_Name: req.body.Game_Name,
        Total_Players: req.body.Total_Players,
        Prize_Pool: req.body.Prize_Pool,
        Date_Time: req.body.Date_Time,
      });
      new_tournament.save().then((data) => {
        res.json({ data });
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//Read
route.get("/fetchalltournament", async (req, res) => {
  try {
    const Data = await tournamentschema.find();
    res.send({ Data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Update -- Admin Route
route.put("/Updatetournament/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      // return next(new Errror_Handler("Something Went Wrong", 404));
      return res.status(404).send("Not Found");
    } else if (tournament_found.User.toString() !== req.user.id) {
      //objectid is uhi not present just unhi that's why tostring is coverting it into string//why using to string
      return res.status(404).send("Not Allowed");
    } else {
      await tournamentschema.findByIdAndUpdate(
        req.params.id,
        {
          Game_Name: req.body.Game_Name,
          Total_Players: req.body.Total_Players,
          Prize_Pool: req.body.Prize_Pool,
        },
        { new: true }
      );
      res.send("Updated Sucessfully");
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
      return res.status(404).send("Not allowed jjjjj");
    } else if (tournament_found.User.toString() !== req.user.id) {
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

// Get Tournament Details
route.get("/gettournamentdetails/:id", Get_User_id, async (req, res) => {
  try {
    const Data = await tournamentschema.find({ User: req.user.id });
    res.send({ Data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Join Match Route - put Request
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
        await match.save();
        const User = await UserModal.findByIdAndUpdate(
          req.user.id,
          {
            Wallet_Coins: req.body.New_Ballance,
          },
          { new: true }
        );
        res.status(200).send("Match Joined Successfully , Wallet Updated");
      }
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
