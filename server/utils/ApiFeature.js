class Api_Feature {
  constructor(query, queryStr, userid) {
    this.Query = query; //tournamentschema
    this.QueryStr = queryStr; //Pubg or Freefire
    this.User_id = userid; //Pubg or Free
  }

  async Filter() {
    const query = this.QueryStr.Game_Name
      ? {
          "Joined_User.UserId": { $ne: this.User_id }, //send Matches in which he is not joined yet
          UserId: { $ne: this.User_id }, //Not His created matches
          Game_Name: this.QueryStr.Game_Name,
          Date_Time: { $gt: Date.now() }, //only upcomming matches
        }
      : {
          "Joined_User.UserId": { $ne: this.User_id },
          UserId: { $ne: this.User_id },
          Date_Time: { $gt: Date.now() },
        };

    const Result_Per_Page = 10;
    const Current_Page = Number(this.QueryStr.Page) || 1;
    const Skip = Result_Per_Page * (Current_Page - 1);

    this.Product = await this.Query.find({ ...query })
      .sort({
        Date_Time: 1,
      })
      .limit(Result_Per_Page)
      .skip(Skip);
    return this.Product;
  }
}

class MyMatches_Api_Feature {
  constructor(query, queryStr, userid) {
    this.Query = query; //tournamentschema
    this.QueryStr = queryStr; //Secudled , Upcomming, or Finished
    this.User_id = userid;
  }

  async Filter() {
    let query;
    let DateTime;
    switch (this.QueryStr.MatchType) {
      case "Scheduled":
        query = {
          "Joined_User.UserId": this.User_id,
          Date_Time: { $gt: Date.now() },
        };
        DateTime = 1;
        break;

      case "Ongoing":
        query = {
          $and: [
            {
              "Joined_User.UserId": this.User_id,
              Date_Time: { $gt: Date.now() - 14400000 },
              Match_Status: "Started",
            },
            {
              "Joined_User.UserId": this.User_id,
              Date_Time: { $lt: Date.now() },
              Match_Status: "Started",
            },
          ],
        };
        DateTime = 1;
        break;

      case "Resultant":
        query = {
          "Joined_User.UserId": this.User_id,
          Match_Status: "Completed",
        };
        DateTime = -1;
        break;

      case "Cancelled":
        query = {
          $or: [
            {
              "Joined_User.UserId": this.User_id,
              Date_Time: { $lt: Date.now() },
              Match_Status: "Scheduled",
            },
            {
              "Joined_User.UserId": this.User_id,
              Date_Time: { $lt: Date.now() - 14400000 },
              Match_Status: "Started",
            },
          ],
        };
        DateTime = -1;
        break;
      default:
        query = {
          "Joined_User.UserId": this.User_id,
        };
        DateTime = 1;
        break;
    }

    const Result_Per_Page = 10;
    const Current_Page = Number(this.QueryStr.Page) || 1;
    const Skip = Result_Per_Page * (Current_Page - 1);

    this.Product = await this.Query.find({ ...query })
      .sort({
        Date_Time: DateTime || 1,
      })
      .limit(Result_Per_Page)
      .skip(Skip);
    return this.Product;
  }
}

class Guild_Matches_Api_Feature {
  constructor(query, queryStr, userid) {
    this.Query = query; //tournamentschema
    this.QueryStr = queryStr; //Secudled , Upcomming, or Finished
    this.User_id = userid; //Guild id
  }

  async Filter() {
    let query;
    let DateTime;
    switch (this.QueryStr.MatchType) {
      case "Scheduled":
        query = {
          GuildId: this.User_id,
          Date_Time: { $gt: Date.now() },
        };
        DateTime = 1;
        break;
      case "Ongoing":
        query = {
          $and: [
            {
              GuildId: this.User_id,
              Date_Time: { $gt: Date.now() - 14400000 },
              Match_Status: "Started",
            },
            {
              GuildId: this.User_id,
              Date_Time: { $lt: Date.now() },
              Match_Status: "Started",
            },
          ],
        };
        DateTime = 1;
        break;
      case "Resultant":
        query = {
          GuildId: this.User_id,
          Match_Status: "Completed",
        };
        DateTime = -1;
        break;
      case "Cancelled":
        query = {
          $or: [
            {
              GuildId: this.User_id,
              Date_Time: { $lt: Date.now() },
              Match_Status: "Scheduled",
            },
            {
              GuildId: this.User_id,
              Date_Time: { $lt: Date.now() - 14400000 },
              Match_Status: "Started",
            },
          ],
        };
        DateTime = -1;
        break;
      default:
        query = {
          GuildId: this.User_id,
        };
        DateTime = 1;
        break;
    }

    const Result_Per_Page = 10;
    const Current_Page = Number(this.QueryStr.Page) || 1;
    const Skip = Result_Per_Page * (Current_Page - 1);

    this.Product = await this.Query.find({ ...query })
      .sort({
        Date_Time: DateTime || 1,
      })
      .limit(Result_Per_Page)
      .skip(Skip);
    return this.Product;
  }
}

module.exports = {
  Api_Feature,
  MyMatches_Api_Feature,
  Guild_Matches_Api_Feature,
};
