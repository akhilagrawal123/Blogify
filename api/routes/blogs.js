const e = require("express");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const Blog = require("../models/Blog");
const User = require("../models/User");
const Categories = require("../data/categories.json");

router.get("/", (req, res, next) => {
  Blog.find()
    .select(
      "content author created title image category subCategory _id handle"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        blogs: docs.map((doc) => {
          return {
            subCategory: doc.subCategory,
            title: doc.title,
            author: doc.author,
            _id: doc._id,
            created: doc.created,
            content: doc.content,
            image: doc.image,
            category: doc.category,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post("/", checkAuth, (req, res, next) => {
  console.log(req.file);
  const blog = new Blog({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    author: req.body.author,
    handle: req.body.handle,
    category: req.body.category,
    content: req.body.content,
    image: "",
    subCategory: req.body.subCategory,
  });

  blog
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Created Blog Successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:category", checkAuth, (req, res, next) => {
  const category = req.params.category;
  var subcat = [];
  for (i = 0; i < Categories.length; i++) {
    if (Categories[i].name === category) {
      subcat = Categories[i].subCategories;
    }
  }
  Blog.find({ category: category })
    .select(
      "content author created title image category subCategory _id handle"
    )
    .exec()
    .then((doc) => {
      console.log("From Database", doc);
      if (doc) {
        res.status(200).json({
          subCategories: subcat,
          blogs: doc,
        });
      } else {
        res.status(404).json({
          message: "No blog found for this category",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/id/:blogId/:userId", checkAuth, (req, res, next) => {
  const id = req.params.blogId;
  const userId = req.params.userId;
  Blog.findById(id)
    .select(
      "content author created title image category subCategory _id handle"
    )
    .exec()
    .then((doc) => {
      console.log("From Database", doc);
      if (doc) {
        User.findById(userId)
          .select("bookmarks")
          .exec()
          .then((doc2) => {
            console.log("From Database", doc2);
            if (doc2) {
              var temp = doc2.bookmarks.filter((item) => {
                return item == id;
              });
              var bookmarkStatus = false;
              var obj = {
                content: doc.content,
                author: doc.author,
                created: doc.created,
                title: doc.title,
                image: doc.image,
                category: doc.category,
                subCategory: doc.subCategory,
                _id: doc._id,
                handle: doc.handle,
              };
              if (temp.length == 0) {
                obj["bookmarkStatus"] = false;
              } else {
                obj["bookmarkStatus"] = true;
              }
              console.log("finalBlog", obj);
              res.status(200).json({
                blog: obj,
              });
            } else {
              res.status(404).json({
                message: "No User Found",
              });
            }
          });
      } else {
        res.status(404).json({
          message: "No blog found for this category",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/personalised/:userId", checkAuth, (req, res, next) => {
  const id = req.params.userId;

  User.findById(id)
    .select("interests")
    .exec()
    .then(async (doc) => {
      console.log("From Database", doc);
      if (doc) {
        const interests = doc.interests;
        console.log(interests);

        const blogs = await Blog.find({
          subCategory: { $in: interests },
        }).select(
          "content author created title image category subCategory _id handle"
        );
        console.log(blogs);
        res.status(200).json({
          blogs: blogs,
        });
      } else {
        res.status(404).json({
          message: "No blog found for this category",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/bookmarks/:userId", checkAuth, (req, res, next) => {
  const id = req.params.userId;

  User.findById(id)
    .select("bookmarks")
    .exec()
    .then(async (doc) => {
      console.log("From Database", doc);
      if (doc) {
        const bookmarks = doc.bookmarks;

        const blogs = await Blog.find({ _id: { $in: bookmarks } }).select(
          "content author created title image category subCategory _id handle"
        );
        console.log(blogs);
        res.status(200).json({
          blogs: blogs,
        });
      } else {
        res.status(404).json({
          message: "No blog found for this category",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/myBlogs/:userId", checkAuth, (req, res, next) => {
  const userId = req.params.userId;
  Blog.find({ author: userId })
    .select(
      "content author created title image category subCategory _id handle"
    )
    .exec()
    .then((doc) => {
      console.log("From Database", doc);
      if (doc) {
        res.status(200).json({
          blogs: doc,
        });
      } else {
        res.status(404).json({
          message: "No blog found for this category",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/createBlog/:category", checkAuth, (req, res, next) => {
  const category = req.params.category;
  var subcat = [];
  for (i = 0; i < Categories.length; i++) {
    if (Categories[i].name === category) {
      subcat = Categories[i].subCategories;
    }
  }

  if (subcat != null) {
    console.log(subcat);

    res.status(200).json({
      subCategories: subcat,
    });
  } else {
    res.status(500).json({
      message: "Category not valid",
    });
  }
});

module.exports = router;
