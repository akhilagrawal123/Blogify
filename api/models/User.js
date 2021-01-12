const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  handle: { type: String },
  yearOfGraduation: { type: String },
  branch: { type: String },
  bio: { type: String },
  image: { type: String },
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  interests: [
    {
      type: String,
    },
  ],
  profileCompleted: { type: Boolean, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
