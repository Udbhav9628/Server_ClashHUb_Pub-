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
          "Joined_User.UserId": { $ne: this.User_id },
          UserId: { $ne: this.User_id },
          Game_Name: this.QueryStr.Game_Name,
        }
      : {
          "Joined_User.UserId": { $ne: this.User_id },
          UserId: { $ne: this.User_id },
        };
    this.Product = await this.Query.find({ ...query });
    return this.Product;
  }
}

module.exports = Api_Feature;
