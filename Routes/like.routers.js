const express = require('express');
const { togglelike, toggleVideoLike, togglecommentLike, getAllLikedVideos } = require('../Controllers/like.controllers'); // Controller functions for like operations
const VerifyJwt = require('../Middlerwares/auth'); // Middleware to verify JWT tokens

const LikeRouter = express.Router(); // Create a new Express Router instance

// Route to toggle the like status on a video
// GET request to '/likes/video/:videoId' will either like or unlike a video
LikeRouter.route('/likes/video/:videoId')
    .get(VerifyJwt, toggleVideoLike); // Verify JWT token and toggle like status on a specific video

// Route to toggle the like status on a comment
// GET request to '/likes/comment/:commentId' will either like or unlike a comment
LikeRouter.route('/likes/comment/:commentId')
    .get(VerifyJwt, togglecommentLike); // Verify JWT token and toggle like status on a specific comment

// Route to get all videos liked by the user
// GET request to '/likedvideos' retrieves all videos that the user has liked
LikeRouter.route('/likedvideos')
    .get(VerifyJwt, getAllLikedVideos); // Verify JWT token and retrieve all liked videos for the authenticated user

module.exports = LikeRouter; // Export the router for use in the main app
