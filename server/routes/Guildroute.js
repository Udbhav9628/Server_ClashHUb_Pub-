const express = require("express");
const route = express.Router();
const Guild_Schema = require("../model/Guild");
const Get_User_id = require("../Middleware/getuserid");

//Read
route.get("/fetchallGuild", Get_User_id, async (req, res) => {
  try {
    const Result_Per_Page = 20;
    const Current_Page = Number(req.query.Page) || 1;
    const Skip = Result_Per_Page * (Current_Page - 1);
    const Data = await Guild_Schema.find({ OwnerId: { $ne: req.user.id } })
      .select("-Followers")
      .sort({
        How_Many_Followers: -1,
      })
      .limit(Result_Per_Page)
      .skip(Skip);
    return res.status(200).send(Data);
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Get User's Guild Details
route.get("/getUserGuildDetails", Get_User_id, async (req, res) => {
  try {
    let Guild = await Guild_Schema.findOne({ OwnerId: req.user.id }).select(
      "-Followers"
    );
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
    return res.status(500).send("Something Goes Wrong");
  }
});

//Get user Guild Followers
route.get(
  "/getUserGuildFollowDetails/:Club_id",
  Get_User_id,
  async (req, res) => {
    try {
      let Guild = await Guild_Schema.findById(req.params.Club_id);
      if (!Guild) {
        return res.status(400).send("Something went wrong");
      } else {
        return res.status(200).send(Guild.Followers);
      }
    } catch (error) {
      return res.status(500).send("Something Goes Wrong");
    }
  }
);

//Check Is Club Joined
route.get("/Is_Club_Joined/:Club_Id", Get_User_id, async (req, res) => {
  try {
    const Is_Joined = await Guild_Schema.findOne({
      _id: req.params.Club_Id,
      "Followers.FollowersId": req.user.id,
    });
    if (!Is_Joined) {
      return res.status(400).send("Something went wrong");
    } else {
      return res.status(200).send("Joined");
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Create User Unique Guild
route.post("/createUserUniqueGuild", Get_User_id, async (req, res) => {
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
        return res.status(501).send("Club ID already Taken, Chose Another");
      } else {
        const new_Guild = new Guild_Schema({
          OwnerId: req.user.id,
          GuildID: req.body.GuildID,
          Profile_Pic: req.body.GuildID,
          GuildName: req.body.GuildName,
          GuildDescription: req.body.GuildDescription,
          How_Many_Followers: 0,
        });
        await new_Guild.save();
        return res.status(200).send("created sucessfully");
      }
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//UpdatePic
route.put("/Update_Club_Pic", Get_User_id, async (req, res) => {
  try {
    const Found_Guild = await Guild_Schema.findById(req.body.Club_Id);
    if (!Found_Guild) {
      return res.status(404).send("Something wrong");
    } else if (Found_Guild.OwnerId.toString() !== req.user.id.toString()) {
      return res.status(500).send("Something wrong");
    } else {
      await Guild_Schema.findByIdAndUpdate(
        req.body.Club_Id,
        {
          Profile_Pic: req.body.PicString,
        },
        { new: true, runValidators: true }
      );
      return res.status(200).send("Profile Picture Updated");
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

route.put("/Join_Guild/:id", Get_User_id, async (req, res) => {
  try {
    const GuildFollower = await Guild_Schema.findById(req.params.id);
    if (!GuildFollower) {
      return res.status(404).send("GuildFollower Not Found");
    } else {
      const isJoined = GuildFollower.Followers.find(
        (Follower) => Follower.FollowersId.toString() === req.user.id
      );
      if (isJoined) {
        return res.status(200).send("You Have already Joined");
      } else {
        const User_Details = {
          FollowersId: req.user.id,
          FollowersName: req.user.Name,
        };
        GuildFollower.How_Many_Followers = GuildFollower.How_Many_Followers + 1;
        GuildFollower.Followers.push(User_Details);
        await GuildFollower.save();
        return res.status(200).send("Joined Successfully");
      }
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Geting Specific Club Details by id
route.get("/getSpecificClubDetails/:id", Get_User_id, async (req, res) => {
  try {
    const Club = await Guild_Schema.findById(req.params.id);
    if (!Club) {
      return res.status(500).send("Club Not Exist May be");
    } else {
      return res.status(200).send(Club);
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

module.exports = route;
