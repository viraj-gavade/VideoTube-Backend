// Import the mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define the schema for the 'Subscription' model
const subscriptionScheam = new mongoose.Schema({
    
    // 'subscriber' field represents the user who is subscribing to a channel
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,  // Stores the ObjectId of the user subscribing
        ref: 'User'  // Refers to the 'User' model, establishing a relationship with the 'User' model
    },

    // 'channel' field represents the user who is being subscribed to
    channel: {
        type: mongoose.Schema.Types.ObjectId,  // Stores the ObjectId of the user being subscribed to
        ref: 'User'  // Refers to the 'User' model, establishing a relationship with the 'User' model
    }

}, {
    // Enabling timestamps for automatic creation and update times
    timestamps: true
});

// Create and export the 'Subscription' model using the defined schema
module.exports = mongoose.model('Subscription', subscriptionScheam);
