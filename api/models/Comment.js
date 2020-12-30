var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId },
  replies: [
    {
      author: { type: mongoose.Schema.Types.ObjectId },
      text: String,
    },
  ],
});

module.exports = mongoose.model("Comment", commentSchema);
