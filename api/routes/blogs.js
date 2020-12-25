const e = require('express');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req,file,cb)
    {
        cb(null, './uploads/');
    },
    filename: function(req,file,cb)
    {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    {
        cb(null, true);
    }
    else
    {
        cb(null, false);
    }

};
const upload = multer({storage: storage,
     limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter : fileFilter 
});

const Blog = require('../models/Blog');
const User = require('../models/User');

router.get('/', (req, res, next) => {
       Blog.find()
       .select("content author created title image category subCategory _id")
       .exec()
       .then(docs => {
           const response = {
               count: docs.length,
               blogs: docs.map(doc => {
                   return {
                       subCategory: doc.subCategory,
                       title: doc.title,
                       author: doc.author,
                       _id: doc._id,
                       created: doc.created,
                       content: doc.content,
                       image: doc.image,
                       category: doc.category
                   }
               })
           };
           res.status(200).json(response);
       })
       .catch(err => {
           console.log(err);
           res.status(500).json({error: err});
       });      
});

router.post('/', upload.single('image'), (req, res, next) => {
    console.log(req.file);
         const blog = new Blog({
             _id: new mongoose.Types.ObjectId,
             title: req.body.title,
             author: new mongoose.Types.ObjectId,
             category: req.body.category,
             content: req.body.content,
             image: req.file.path,
             subCategory: req.body.subCategory
         });

          blog.save().then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Created Blog Successfully',
                createdProduct: {
                   _id: result._id,
                   title: result.title,
                   author: result.author,
                   category: result.category,
                   content: result.content,
                   subCategory: result.subCategory,
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    
});

router.get('/:category', (req, res, next) => {
    const category = req.params.category;
    Blog.find({category: category})
    .select("content author created title image category subCategory _id")
    .exec()
    .then(doc => {
       console.log("From Database", doc);
       if(doc)
       {
           res.status(200).json({
               blog: doc,
           });
       }
       else
       {
           res.status(404).json({
               message: "No blog found for this category"
           });
       }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });      
});

router.get('/id/:blogId', (req, res, next) => {
    const id = req.params.blogId;

    Blog.findById(id)
    .select("content author created title image category subCategory _id")
    .exec()
    .then(doc => {
       console.log("From Database", doc);
       if(doc)
       {
           res.status(200).json({
               blog: doc
           });
       }
       else
       {
           res.status(404).json({
               message: "No blog found for this category"
           });
       }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });      
});

router.get('/personalised/:userId', (req, res, next) => {
    const id = req.params.userId;

    User.findById(id)
    .select("interests")
    .exec()
    .then(async doc => {
       console.log("From Database", doc);
       if(doc)
       {
            const interests = doc.interests
            /*var vals = []
            for(i=0;i<interests.length;i++)
            {
                const subCategory = interests[i];
                const blogs = await Blog.find({subCategories:subCategory})
                vals = vals.concat(blogs)
            }*/
            const blogs = await Blog.find({subCategories:{$in:interests}})
           res.status(200).json({
               blogs:blogs
           });
       }
       else
       {
           res.status(404).json({
               message: "No blog found for this category"
           });
       }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });      
});


router.get('/bookmarks/:userId', (req, res, next) => {
    const id = req.params.userId;

    User.findById(id)
    .select("bookmarks")
    .exec()
    .then(async doc => {
       console.log("From Database", doc);
       if(doc)
       {
            const bookmarks = doc.bookmarks
            /*var vals = []
            for(i=0;i<interests.length;i++)
            {
                const subCategory = interests[i];
                const blogs = await Blog.find({subCategories:subCategory})
                vals = vals.concat(blogs)
            }*/
            const blogs = await Blog.find({_id:{$in:bookmarks}})
           res.status(200).json({
               blogs:blogs
           });
       }
       else
       {
           res.status(404).json({
               message: "No blog found for this category"
           });
       }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });      
});

router.get('/myBlogs/:userId', (req, res, next) => {
    const userId = req.params.userId;
    Blog.find({author: userId})
    .select("content author created title image category subCategory _id")
    .exec()
    .then(doc => {
       console.log("From Database", doc);
       if(doc)
       {
           res.status(200).json({
               blog: doc,
           });
       }
       else
       {
           res.status(404).json({
               message: "No blog found for this category"
           });
       }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });      
});

module.exports = router;