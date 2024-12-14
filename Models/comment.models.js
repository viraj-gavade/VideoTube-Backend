// Import the mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Import the 'mongoose-aggregate-paginate-v2' plugin for paginating aggregate queries
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Define the schema for the 'Comment' model
const commentSchema = new mongoose.Schema({
    // The content of the comment
    content: {
        type: String,  // The content of the comment should be a string
        required: true  // The content is required and must be provided
    },
    
    // Reference to the 'Video' that this comment is related to
    video: {
        type: mongoose.Schema.Types.ObjectId,  // The video field will store an ObjectId reference
        ref: "Video"  // Refers to the 'Video' model, establishing a relationship between comments and videos
    },
    
    // Reference to the 'User' who posted the comment
    owner: {
        type: mongoose.Schema.Types.ObjectId,  // The owner field will store an ObjectId reference
        ref: "User"  // Refers to the 'User' model, establishing a relationship between comments and users
    }
}, {
    // Enable timestamps (createdAt and updatedAt fields will be automatically added)
    timestamps: true
});

// Apply the pagination plugin to the comment schema to support pagination for aggregate queries
commentSchema.plugin(mongooseAggregatePaginate);

// Create and export the 'Comment' model using the defined schema
module.exports = mongoose.model('Comment', commentSchema);
