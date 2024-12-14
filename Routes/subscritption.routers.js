const express = require('express');
const { togglesubscription, getUserChannelSubscribers, getSubscribedChannels, togglesubscriptionById } = require('../Controllers/subscription.controllers'); // Controller functions for subscription operations
const VerifyJwt = require('../Middlerwares/auth'); // Middleware to verify JWT tokens

const subscriptionRouter = express.Router(); // Create a new Express Router instance

// Route to get all subscribers of a specific channel
// GET request to '/subscibers/:channelId' retrieves the list of users who have subscribed to the channel
subscriptionRouter.route('/subscibers/:channelId')
    .get(getUserChannelSubscribers); // Controller 'getUserChannelSubscribers' handles fetching the subscribers of the given channel

// Route to toggle the subscription status for a user
// GET request to '/subscribed/:videoId' will subscribe or unsubscribe a user to/from the channel of the provided video
subscriptionRouter.route('/subscribed/:videoId')
    .get(VerifyJwt, togglesubscription); // Verify JWT token and toggle the subscription status based on the video ID

// Route to toggle subscription to a channel by channel ID
// GET request to '/subscribed/toggle/:channelId' toggles the subscription for a given channel ID
subscriptionRouter.route('/subscribed/toggle/:channelId')
    .get(VerifyJwt, togglesubscriptionById); // Verify JWT token and toggle subscription based on the channel ID

module.exports = subscriptionRouter; // Export the router for use in the main app
