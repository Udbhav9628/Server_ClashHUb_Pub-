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

//| Login Required | fetch specific id note | id required of Note you want to update
//CRUD - Read specific id note
route.get("/UpdateNotes/:id", fetchuser, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.User.toString() !== req.user.id) {
      //if notes id and Notes user not match not allowed to update notes
      return res.status(404).send("Not Allowed");
    }
    const specificnotes = await Notes.findById(req.params.id);
    res.send(specificnotes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//| Login Required | Update  existing note | id required of Note you want to update
//CRUD - Update
route.put("/UpdateNotes/:id", fetchuser, async (req, res) => {
  try {
    const notefound = await Notes.findById(req.params.id);
    if (!notefound) {
      return res.status(404).send("Not Found");
    }
    if (notefound.User.toString() !== req.user.id) {
      //if notes id and Notes user not match not allowed to update notes
      return res.status(404).send("Not Allowed");
    }
    const updated_notes = await Notes.findByIdAndUpdate(
      req.params.id,
      {
        Title: req.body.Title,
        Description: req.body.Description,
        Tag: req.body.Tag,
      },
      { new: true }
    );
    res.send(updated_notes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//| Login Required | Delete existing note | id required of Note you want to delete
//CRUD - Delete
route.delete("/DeleteNotes/:id", fetchuser, async (req, res) => {
  try {
    const notefound = await Notes.findById(req.params.id);
    if (!notefound) {
      return res.status(404).send("Not Found");
    }
    if (notefound.User.toString() !== req.user.id) {
      //if notes id and Notes user not match not allowed to delete notes
      return res.status(404).send("Not Allowed");
    }
    await Notes.findByIdAndDelete(req.params.id);
    res.send("Note Deleted sucessfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
