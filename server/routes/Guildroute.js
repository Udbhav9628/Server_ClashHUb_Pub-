const express = require("express");
const route = express.Router();
const tournamentschema = require("../model/tournament");
const UserModal = require("../model/userdata");
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
        return res.status(500).send("One User can one have guild only");
      } else {
        let Guild = await Guild_Schema.findOne({
          GuildID: req.body.GuildID,
        });
        if (Guild) {
          res.status(500).send("ID already Taken, Chose Another");
          return;
        }
        const new_Guild = new Guild_Schema({
          OwnerId: req.user.id,
          GuildID: req.body.GuildID,
          GuildName: req.body.GuildName,
          GuildDescription: req.body.GuildDescription,
        });
        new_Guild.save().then((data) => {
          res.json({ data });
        });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

module.exports = route;
