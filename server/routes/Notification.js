const express = require("express");
const route = express.Router();
const admin = require("firebase-admin");
const Get_User_id = require("../Middleware/getuserid");

const serviceAccount = require("../../firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const tokens = [];

route.post("/registerToken", Get_User_id, (req, res) => {
  tokens.push(req.body.token);
  return res
    .status(200)
    .json({ message: "Successfully registered FCM Token!" });
});

route.post("/notifications", Get_User_id, async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
    return res
      .status(200)
      .json({ message: "Successfully sent notifications!" });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});

module.exports = route;
