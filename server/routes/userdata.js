const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const route = express.Router();
const userschema = require("../model/userdata");
const { body, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
const Get_User_id = require("../Middleware/getuserid");
dotenv.config({ path: path.join(__dirname, "config.env") });
const stripe = require("stripe")(process.env.STRIPE_SECREAT_KEY);

//Create User
route.post(
  "/Register",
  [
    body("Name").isLength({ min: 3 }),
    body("Email").isEmail(),
    body("Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let Newuser = await userschema.findOne({ Email: req.body.Email });
      if (Newuser) {
        res.status(200).send("User Existed You Can Login Now");
        return;
      }
      const new_user = new userschema({
        Name: req.body.Name,
        Email: req.body.Email,
        Password: req.body.Password,
      });
      new_user.save().then((data) => {
        res.send(data);
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//Normal Login
route.post(
  "/Login",
  [body("Email").isEmail(), body("Password").isLength({ min: 5 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await userschema.findOne({ Email: req.body.Email });
      if (!user) {
        return res
          .status(500)
          .send("Look like you don't have account, Create Your account first");
      } else if (user.Password === req.body.Password) {
        const PayLoad = {
          //this is the data will recevive when verify jwt token provided in header - user id
          //TO Do --Save in Hashed with salt and then reverse engineer it when need to use
          id: user.id, //Logged User id is saved in authtoken
          Name: user.Name, //Logged User Name is saved in authtoken   TO --Save in Hashed with salt
        };
        const Auth_Token = jwt.sign(PayLoad, process.env.JWTSCREAT);
        res.json({
          User: user.Name,
          Joined_Date: user.Date,
          Wallet: user.Wallet_Coins,
          Auth_Token,
        });
      } else {
        return res
          .status(500)
          .json({ Message: "Login With Correct Credientals Please" });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//Login with Google Route
//Need to check for security Purpose
route.post("/Loginwithgoogle", [body("Email").isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let user = await userschema.findOne({ Email: req.body.Email });
    if (!user) {
      return res
        .status(500)
        .send("Look like you don't have account, Create Your account first");
    } else {
      const PayLoad = {
        //this is the data will recevive when verify jwt token provided in header - user id
        //TO Do --Save in Hashed with salt and then reverse engineer it when need to use
        id: user.id, //Logged User id is saved in authtoken
        Name: user.Name, //Logged User Name is saved in authtoken   TO --Save in Hashed with salt
      };
      const Auth_Token = jwt.sign(PayLoad, process.env.JWTSCREAT);
      res.json({
        User: user.Name,
        Joined_Date: user.Date,
        Wallet: user.Wallet_Coins,
        Auth_Token,
      });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Geting Logged in User Details
route.get("/getUserDetails", Get_User_id, async (req, res) => {
  try {
    let user = await userschema.findById(req.user.id);
    if (!user) {
      return res.status(500).send("User Not Exist May be");
    } else {
      return res.status(200).send(user);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Stripe Payment Route
route.post("/Payment", async (req, res) => {
  try {
    const My_Payment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Tournament App",
      },
    });
    res.status(200).json({
      sucess: true,
      client_secret: My_Payment.client_secret,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// route.post("/Payment", (req, res) => {
//   stripe.charges.create(
//     {
//       source: req.body.tokenId,
//       amount: req.body.amount,
//       currency: "usd",
//     },
//     (stripeErr, stripeRes) => {
//       if (stripeErr) {
//         res.status(500).json(stripeErr);
//       } else {
//         res.status(200).json(stripeRes);
//       }
//     }
//   );
// });

//Stripe api Key Sending route               NEED TO USE
// route.get("/StripeApiKey", (req, res) => {
//   try {
//     res.status(200).json({
//       Stripe_api_key : process.env.STRIPE_API_KEY
//     })
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

module.exports = route;
