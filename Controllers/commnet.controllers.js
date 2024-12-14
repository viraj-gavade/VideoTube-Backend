const asyncHandler = require('../utils/asynchandler')  // Import async handler for handling asynchronous operations
const Comment = require('../Models/comment.models') // Import the Comment model
const ApiResponse = require('../utils/apiResponse') // Import API response handler
const CustomApiError = require('../utils/apiErrors') // Import custom API error handler
const Video = require('../Models/video.models') // Import the Video model
const { default: mongoose } = require('mongoose') // Import mongoose to interact with MongoDB

// Function to add a new comment to a video
const addComment = asyncHandler(async (req, res) => {
   try {
     // Extracting the videoId from the URL parameters
     const { videoId } = req.params

     // Extracting the comment content from the request body
     const { content } = req.body

     // Check if a valid video exists by finding the video by its ID
     const video = await Video.findById(videoId)

     // If no video is found with the given videoId, throw a custom API error
     if (!video) {
         throw new CustomApiError(
             400, // HTTP status code for Bad Request
             `There is no such video with Id: ${videoId}` // Error message
         )
     }

     // Create a new comment in the database
     const comment = await Comment.create({
         content: content, // The comment text
         video: video._id, // Associate the comment with the video ID
         owner: req.user._id // Associate the comment with the current user's ID
     })

     // If the comment creation fails, throw a custom API error with a message
     if (!comment) {
         throw new CustomApiError(
             500, // HTTP status code for Internal Server Error
             'Something went wrong while creating the comment!' // Error message
         )
     }

     // Return a successful response with the newly created comment
     return res.status(200).json(
        new ApiResponse(
            200, // HTTP status code for OK
            'Comment Added successfully!', // Success message
            comment // The newly created comment data
        )
    )
   } catch (error) {
    // Catching any errors that occur and passing them to the custom error handler
    throw new CustomApiError(
        error.statusCode || 500, // Use the error’s status code or default to 500 for internal errors
        error.message || 'An unexpected error occurred' // Use the error message or a generic message
    )
   }
})

// Function to update an existing comment
const updateComment = asyncHandler(async (req, res) => {
    // Extracting the updated content from the request body
    const { content } = req.body

    // Extracting the commentId from the URL parameters
    const { commentId } = req.params

    // Attempt to find the comment by its ID and update its content
    const comment = await Comment.findByIdAndUpdate(commentId, { content: content }, { new: true })
    
    // If no comment is found or the update operation fails, throw a custom error
    if (!comment) {
        throw new CustomApiError(
            400, // HTTP status code for Bad Request
            'Something went wrong while updating the comment' // Error message
        )
    }

    // Return a success response with the updated comment
    return res.status(200).json(
        new ApiResponse(
            200, // HTTP status code for OK
            'Comment updated successfully!', // Success message
            comment // The updated comment data
        )
    )
})

// Function to delete an existing comment
const deleteComment = asyncHandler(async (req, res) => {
    // Extracting the commentId from the URL parameters
    const { commentId } = req.params

    // Attempt to find and delete the comment by its ID
    const comment = await Comment.findByIdAndDelete(commentId)

    // If no comment is found to delete, throw a custom error
    if (!comment) {
        throw new CustomApiError(
            400, // HTTP status code for Bad Request
            'Something went wrong while deleting the comment!' // Error message
        )
    }

    // Return a success response indicating the comment has been deleted
    return res.status(200).json(
        new ApiResponse(
            200, // HTTP status code for OK
            'Comment deleted successfully!' // Success message
        )
    )
})

// Export the comment-related functions for use in other parts of the application
module.exports = {
    addComment, // Function to add a comment
    updateComment, // Function to update an existing comment
    deleteComment, // Function to delete a comment
}
