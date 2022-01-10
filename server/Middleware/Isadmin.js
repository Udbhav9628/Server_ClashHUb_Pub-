const UserModal = require("../model/userdata");

const Checkisadmin = (...roles) => {
  return async (req, res, next) => {
    const User = await UserModal.findById(req.user.id);
    if (User) {
      if (roles.includes(User.Role)) {
        //Checkin in roles array (in which we pass admin) Match User Role and passed admin , So in this case false so else
        next();
      } else {
        console.log(User.Role);
        res.status(401).send("Unauthorized Access");
      }
    } else {
      res.status(401).send("User Not Found");
    }
  };
};

module.exports = Checkisadmin;
