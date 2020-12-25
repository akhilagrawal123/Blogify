const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    comments: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],
    title: String,
    image: String,
    content: String,
    created: {type:Date, default: Date.now()},
    author: {type: mongoose.Schema.Types.ObjectId},
    category: {type: String, required: true},
    subCategory: [
        {
            type: String, required: true 
        }
    ]
});
module.exports = mongoose.model("Blog",blogSchema)