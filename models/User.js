const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  account: {
    username: { type: String, required: true },
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
