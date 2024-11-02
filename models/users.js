const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  favorites: { type: [String], default: [] },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
