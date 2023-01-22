const express = require("express");
const route = express.Router();
const admin = require("firebase-admin");
const tournamentschema = require("../model/tournament");
const UserModal = require("../model/userdata");
const serviceAccount = require("../../firebase.json");
const Get_User_id = require("../Middleware/getuserid");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

route.post("/RoomNotifications/:Match_Id", Get_User_id, async (req, res) => {
  try {
    const Found_Match = await tournamentschema.findById(req.params.Match_Id);
    if (
      Found_Match.UserId.toString() === req.user.id.toString() &&
      Found_Match.Joined_User.length > 0
    ) {
      const All_Players_Id = [];
      const tokens = [];
      Found_Match.Joined_User.forEach(async (Player) => {
        All_Players_Id.push(Player.UserId);
      });
      await Promise.all(
        All_Players_Id.map(async (Player_id) => {
          const UserFCMToken = await UserModal.findById(Player_id).select(
            "FCMToken"
          );
          tokens.push(UserFCMToken.FCMToken);
        })
      );
      const { title, body } = req.body;
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title,
          body,
        },
      });
      return res.status(200).send("Notification Sended Sucessfully!");
    } else {
      return res.status(505).send("Unautherized Access");
    }
  } catch (err) {
    return res.status(500).send("Something went wrong!");
  }
});

module.exports = route;
