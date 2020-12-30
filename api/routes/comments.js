const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const checkAuth = require("../middleware/check-auth");

router.post("/:blogId", checkAuth, (req, res, next) => {
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
      Blog.update({ _id: id }, { $push: { comments: comment._id } }).then(
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

router.post("/reply/:commentId", checkAuth, (req, res, next) => {
  const id = req.params.commentId;

  const replyOps = {};
  for (const ops of Object.keys(req.body)) {
    replyOps[ops] = req.body[ops];
  }
  Comment.update({ _id: id }, { $push: { replies: replyOps } })
    .then((result) => {
      res.status(200).json({
        message: "Added Reply Successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });

  // comment
  //   .save()
  //   .then((result) => {
  //     console.log(result);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.status(500).json({
  //       error: err,
  //     });
  //   });
});

router.get("/:blogId", checkAuth, (req, res, next) => {
  const id = req.params.blogId;

  Blog.findById(id)
    .select("comments")
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
