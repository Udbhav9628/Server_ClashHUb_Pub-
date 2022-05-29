class Api_Feature {
  constructor(query, queryStr, userid) {
    this.Query = query; //tournamentschema
    this.QueryStr = queryStr; //Pubg or Freefire
    this.User_id = userid; //Pubg or Free
  }
  async search() {
    const Keyword = this.QueryStr.Keyword //dont confuse keyword is nothing
      ? {
          Game_Name: {
            $regex: this.QueryStr.Keyword,
            $options: "i",
          },
        }
      : {};

    this.Product = await this.Query.find({ ...Keyword });
    return this.Product;
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
    this.Product = await this.Query.find({ ...query });
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
    switch (this.QueryStr.MatchType) {
      case "Ongoing":
        query = {
          "Joined_User.UserId": this.User_id,
          Date_Time: { $lt: Date.now() },
        };
        break;

      case "Resultant":
        query = {
          "Joined_User.UserId": this.User_id,
          Date_Time: { $lt: Date.now() },
        };
        break;

      default:
        query = {
          "Joined_User.UserId": this.User_id,
          Date_Time: { $gt: Date.now() },
        };
        break;
    }
    this.Product = await this.Query.find({ ...query });
    return this.Product;
  }
}

module.exports = { Api_Feature, MyMatches_Api_Feature };
