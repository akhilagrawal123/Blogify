var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId },
  handle: { type: String },
  replies: [
    {
      author: { type: mongoose.Schema.Types.ObjectId },
      handle: { type: String },
      text: String,
    },
  ],
});

module.exports = mongoose.model("Comment", commentSchema);
