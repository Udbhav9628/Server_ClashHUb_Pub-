const express = require("express");
const route = express.Router();
const admin = require("firebase-admin");

const serviceAccount = require("../../firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const tokens = [];

route.post("/registerToken", (req, res) => {
  tokens.push(req.body.token);
  console.log(tokens);
  return res
    .status(200)
    .json({ message: "Successfully registered FCM Token!" });
});

route.post("/notifications", async (req, res) => {
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
    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});

module.exports = route;
