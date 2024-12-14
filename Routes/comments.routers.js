const express = require('express');
const VerifyJwt = require('../Middlerwares/auth'); // Middleware to verify JWT tokens
const { addComment, deleteComment, getVideoComments, updateComment } = require('../Controllers/commnet.controllers'); // Controller functions for comment operations
const CommentRouter = express.Router(); // Create a new Express Router instance

// Route for adding a comment to a specific video
// POST request to '/comments/:videoId' will add a comment to the video specified by videoId
CommentRouter.route('/comments/:videoId')
    .post(VerifyJwt, addComment); // Verify JWT token before allowing the comment to be added

// Route for updating a specific comment
// PUT request to '/comment/:commentId' will update the comment specified by commentId
CommentRouter.route('/comment/:commentId')
    .put(VerifyJwt, updateComment) // Verify JWT token before updating the comment
    .delete(VerifyJwt, deleteComment); // Verify JWT token before deleting the comment

// Route for deleting a comment (this could be an alternative deletion endpoint for flexibility)
// GET request to '/comment/delete/:commentId' will delete the comment specified by commentId
CommentRouter.route('/comment/delete/:commentId')
    .get(VerifyJwt, deleteComment); // Verify JWT token before allowing comment deletion

module.exports = CommentRouter; // Export the router for use in the main app

// Comment Routes Working Confirmed!
