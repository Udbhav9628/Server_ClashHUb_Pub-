class Api_Feature {
  constructor(query, queryStr) {
    this.Query = query; //tournamentschema
    this.QueryStr = queryStr; //Pubg or Free
  }
  async search() {
    //Class Function
    const Keyword = this.QueryStr.Keyword
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
    this.Product = await this.Query.find(this.QueryStr);
    return this.Product;
  }
}

module.exports = Api_Feature;
