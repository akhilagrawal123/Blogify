const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const user = require("../models/User");
const Categories = require("../data/categories.json");
const checkAuth = require("../middleware/check-auth");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail Exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              profileCompleted: false,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(200).json({
                  message: "User Created",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ error: err });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  console.log(req.body.email);
  console.log(req.body.password);
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth Failed",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth Failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            //  console.log(user[0].profileCompleted);
            message: "Auth Successfull",
            token: token,
            id: user[0]._id,
            profileCompleted: user[0].profileCompleted,
          });
        }

        return res.status(401).json({
          message: "Auth Failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User Deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:userId", checkAuth, (req, res, next) => {
  const id = req.params.userId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }

  User.update({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(updateOps);
      res.status(200).json({
        message: "User Updated",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:userId", checkAuth, (req, res, next) => {
  const id = req.params.userId;

  User.findById(id)
    .select("name yearOfGraduation branch bio bookmarks interests handle")
    .exec()
    .then((doc) => {
      console.log("From Database", doc);
      if (doc) {
        res.status(200).json({
          user: doc,
        });
      } else {
        res.status(404).json({
          message: "No User Found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/getInterests/allCat", checkAuth, (req, res, next) => {
  var subCat = [];
  console.log(Categories);
  for (i = 0; i < Categories.length; i++) {
    subCat = subCat.concat(Categories[i].subCategories);
  }
  if (subCat != null) {
    res.status(200).json({ subCategories: subCat });
  } else {
    res.status(500).json({ message: "No Sub Categories Found" });
  }
});

router.patch("/addBookmarks/:userId", checkAuth, (req, res, next) => {
  const id = req.params.userId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }

  User.findById(id)
    .select("bookmarks")
    .exec()
    .then((doc) => {
      console.log("From Database", doc);
      if (doc) {
        var list = doc.bookmarks;
        var newList = list;
        if (updateOps.newStatus === true) {
          var temp = list.filter((item) => {
            return item == updateOps.blogId;
          });
          if (temp.length == 0) {
            newList.push(updateOps.blogId);
          }
        } else {
          newList = list.filter((item) => {
            return updateOps.blogId != item;
          });
        }

        User.update({ _id: id }, { $set: { bookmarks: newList } })
          .exec()
          .then((result) => {
            console.log(updateOps);
            res.status(200).json({
              message: "User Bookmarks Updated",
            });
          });
      } else {
        res.status(404).json({
          message: "No User Found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
