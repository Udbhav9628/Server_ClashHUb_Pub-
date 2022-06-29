const express = require("express");
const route = express.Router();
const Guild_Schema = require("../model/Guild");
const Get_User_id = require("../Middleware/getuserid");
const Checkisadmin = require("../Middleware/Isadmin");
const { body, validationResult } = require("express-validator");

//Read
route.get("/fetchallGuild", Get_User_id, async (req, res) => {
  try {
    const Data = await Guild_Schema.find();
    res.send(Data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Get User's Guild Details
//To Do - Find by is istead of findone if possible
route.get("/getUserGuildDetails", Get_User_id, async (req, res) => {
  try {
    let Guild = await Guild_Schema.findOne({ OwnerId: req.user.id });
    if (!Guild) {
      return res.status(200).send({
        status: false,
        Message: "Guild Does not Exist , Create First",
      });
    } else {
      return res.status(200).send({
        status: true,
        Message: Guild,
      });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Create User Unique Guild
route.post(
  "/createUserUniqueGuild",
  Get_User_id,
  [
    body("GuildName", "Guild Name must be atleaset 3 char").isLength({
      min: 3,
    }),
    body("GuildID", "Guild ID must be atleaset 3 char").isLength({
      min: 3,
    }),
    body(
      "GuildDescription",
      "Guild Description must be atleaset 3 char"
    ).isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let isGuildallreadyAvailable = await Guild_Schema.findOne({
        OwnerId: req.user.id,
      });
      if (isGuildallreadyAvailable) {
        return res.status(503).send("One User can have one guild only");
      } else {
        let Guild = await Guild_Schema.findOne({
          GuildID: req.body.GuildID,
        });
        if (Guild) {
          return res.status(501).send("ID already Taken, Chose Another");
        } else {
          const new_Guild = new Guild_Schema({
            OwnerId: req.user.id,
            GuildID: req.body.GuildID,
            GuildName: req.body.GuildName,
            GuildDescription: req.body.GuildDescription,
          });
          await new_Guild.save();
          return res.status(200).send("created sucessfully");
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(505).send(error.message);
    }
  }
);

route.put("/Join_Guild/:id", Get_User_id, async (req, res) => {
  try {
    const GuildFollower = await Guild_Schema.findById(req.params.id);
    if (!GuildFollower) {
      return res.status(404).send("GuildFollower Not Found");
    } else {
      const User_Details = {
        FollowersId: req.user.id,
        FollowersName: req.user.Name,
      };
      GuildFollower.Followers.push(User_Details);
      await GuildFollower.save();
      return res.status(200).send("Joined Successfully");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

module.exports = route;
