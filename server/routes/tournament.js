const express = require("express");
const route = express.Router();
const tournamentschema = require("../model/tournament");
const Get_User_id = require("../Middleware/getuserid");
const { body, validationResult } = require("express-validator");

//Home Route
route.get("/", (req, res) => {
  res.send("Home Route");
});

//Create
route.post(
  "/createtournament",
  Get_User_id,
  [
    body("Title", "Title must be atleaset 3 char").isLength({ min: 3 }),
    body("Description", "Description must be atleaset 3 char").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const new_tournament = new tournamentschema({
        User: req.user.id,
        Title: req.body.Title,
        Description: req.body.Description,
        Total_Players: req.body.Total_Players,
        Prizes: req.body.Prizes,
      });
      new_tournament.save().then((data) => {
        res.send(data);
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//Read
route.get("/fetchalltournament", Get_User_id, async (req, res) => {
  try {
    const Data = await tournamentschema.find({ User: req.user.id });
    res.send({ Data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Update
route.put("/Updatetournament/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Not Found");
    }else if (tournament_found.User.toString()!== req.user.id) { //objectid is uhi not present just unhi that's why tostring is coverting it into string
      return res.status(404).send("Not Allowed");
    }else{
      const updated_data = await tournamentschema.findByIdAndUpdate(req.params.id,{
        Title: req.body.Title,
        Description: req.body.Description,
        Total_Players: req.body.Total_Players,
        Prizes: req.body.Prizes,
      },
      { new: true }
      );
      res.send(updated_data);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

route.delete("/Deletetournament/:id", Get_User_id, async (req, res) => {
  try {
    const tournament_found = await tournamentschema.findById(req.params.id);
    if (!tournament_found) {
      return res.status(404).send("Not Found");
    }else if (tournament_found.User.toString()!== req.user.id) { //objectid is uhi not present just unhi that's why tostring is coverting it into string
      return res.status(404).send("Not Allowed");
    }else{
      const updated_data = await tournamentschema.findByIdAndDelete(req.params.id);
      res.send({Message:"Note Deleted Sucessfully"});
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
