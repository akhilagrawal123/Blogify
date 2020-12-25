const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true },
    yearOfGraduation: {type: String, required: true},
    branch: {type: String, required: true},
    bio: {type: String},
    image: {type: String},
    email: { type: String, required: true},
    password: { type: String, required: true},
    bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
        }
    ],
    interests: [
        {
            type: String
        }
    ]  
});

module.exports = mongoose.model('User', userSchema);