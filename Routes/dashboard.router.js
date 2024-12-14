const express = require('express');
const VerifyJwt = require('../Middlerwares/auth'); // Middleware to verify JWT tokens
const { getChannelStats, getChannelAllVideos } = require('../Controllers/dashboard.controllers'); // Controller functions for dashboard operations

const DashboardRouter = express.Router(); // Create a new Express Router instance

// Route for fetching channel statistics
// GET request to '/stats' will retrieve statistics related to the user's channel (e.g., views, subscribers, etc.)
DashboardRouter.route('/stats')
    .get(VerifyJwt, getChannelStats); // Verify JWT token before retrieving the channel stats

// Route for fetching all videos in the user's channel
// GET request to '/videos' will retrieve all videos uploaded to the user's channel
DashboardRouter.route('/videos')
    .get(VerifyJwt, getChannelAllVideos); // Verify JWT token before retrieving all videos in the channel

module.exports = DashboardRouter; // Export the router for use in the main app
