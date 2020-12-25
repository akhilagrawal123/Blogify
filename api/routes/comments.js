const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

router.post("/:blogId", (req, res, next) => {
  const id = req.params.blogId;

  const commentOps = {};
  for (const ops of Object.keys(req.body)) {
    commentOps[ops] = req.body[ops];
  }

  const comment = new Comment({
    _id: new mongoose.Types.ObjectId(),
    ...commentOps,
    replies: [],
  });

  comment
    .save()
    .then((result) => {
      console.log(result);
      Blog.update({ _id: id }, { $push: { comments: comment._id } }, done).then(
        (result) => {
          res.status(200).json({
            message: "Added comment Successfully",
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:blogId", (req, res, next) => {
  const id = req.params.blogId;

  Blog.findById(id)
    .select("comment")
    .exec()
    .then(async (doc) => {
      console.log("From Database", doc);
      if (doc) {
        const commentIds = doc.comments;
        const comments = await Comment.find({ _id: { $in: commentIds } });
        res.status(200).json({
          comments: comments,
        });
      } else {
        res.status(404).json({
          message: "No Comment Found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
