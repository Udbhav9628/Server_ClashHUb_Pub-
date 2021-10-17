const express = require("express");
const route = express.Router();
const path = require("path");
const dotenv = require("dotenv");
const Notes = require("../model/Notes");
const fetchuser = require("../Middleware/GetuserDetails");
const { body, validationResult } = require("express-validator");
dotenv.config({ path: path.join(__dirname, "config.env") });

//Creating Notes | Login Required - Means we need authtoken in header |
//CRUD - Create
route.post(
  "/CreateNotes",
  fetchuser,
  [
    body("Title", "Title must be atleaset 3 char").isLength({ min: 3 }),
    body("Description", "Description must be atleaset 3 char").isLength({
      min: 5,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //Adding/Creating Notes
      const Newnotes = new Notes({
        User: req.user.id, //fetchuser will append/give user id whose nodes is creating/adding below
        Title: req.body.Title,
        Description: req.body.Description,
        Tag: req.body.Tag,
      });
      Newnotes.save().then((data) => {
        res.send(data);
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//| Login Required |Taking the logedin user id from Header Auth token and filter the particular user notes and show them
//CRUD - Read
route.get("/FetchAllNotes", fetchuser, async (req, res) => {
  try {
    const userid = req.user.id;
    const notes = await Notes.find({ User: userid });
    res.send({ notes });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//| Login Required | Update and existing note | id required of Note you want to update
//CRUD - Update
route.put("/UpdateNotes/:id", fetchuser, async (req, res) => {
  try {
    const notefound = await Notes.findById(req.params.id)
    if (notefound.User.toString()!==req.user.id) {  //if notes id and Notes user not match not allowed to update notes
      return res.status(404).send("Not Allowed")
    }
    console.log("In Try");
    const note_id = req.params.id;
    console.log(note_id);
    const updated_notes = await Notes.findByIdAndUpdate(note_id, {
      Title: req.body.Title,
      Description: req.body.Description,
      Tag: req.body.Tag,
    }, {new: true});
    res.send(updated_notes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
