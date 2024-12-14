// Import the mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define the schema for the 'Like' model
const likeSchema = new mongoose.Schema({
    // Reference to the 'Comment' that this like is related to
    comment: {
        type: mongoose.Schema.Types.ObjectId,  // The comment field will store an ObjectId reference
        ref: "Comment"  // Refers to the 'Comment' model, establishing a relationship between likes and comments
    },

    // Reference to the 'Video' that this like is related to
    video: {
        type: mongoose.Schema.Types.ObjectId,  // The video field will store an ObjectId reference
        ref: 'Video'  // Refers to the 'Video' model, establishing a relationship between likes and videos
    },

    // Reference to the 'User' who liked the comment, video, or tweet
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,  // The likedBy field will store an ObjectId reference
        ref: "User"  // Refers to the 'User' model, establishing a relationship between likes and users
    },

    // Reference to the 'Tweet' that this like is related to (optional, depending on whether you want to support likes on tweets)
    tweet: {
        type: mongoose.Schema.Types.ObjectId,  // The tweet field will store an ObjectId reference
        ref: "Tweet"  // Refers to the 'Tweet' model, establishing a relationship between likes and tweets
    }
}, {
    // Enable timestamps (createdAt and updatedAt fields will be automatically added)
    timestamps: true
});

// Create and export the 'Like' model using the defined schema
module.exports = mongoose.model('Like', likeSchema);
