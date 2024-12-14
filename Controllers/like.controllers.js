// Import necessary utility functions, models, and classes
const asyncHandler = require('../utils/asynchandler'); // Middleware for handling async functions
const User = require('../Models/users.models'); // User model (though not used directly here)
const Like = require('../Models/like.models'); // Like model to track likes on comments, tweets, and videos
const ApiResponse = require('../utils/apiResponse'); // Helper class for standard API responses
const CustomApiError = require('../utils/apiErrors'); // Custom error handler for structured error messages
const { default: mongoose } = require('mongoose'); // Mongoose for interacting with MongoDB

/**
 * Toggle a like/unlike on a comment.
 * If the user has already liked the comment, it removes the like.
 * If the user has not liked the comment yet, it adds a like.
 */
const togglecommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params; // Extract commentId from the URL parameters
    if (!commentId) {
        throw new CustomApiError(400, `There is no such comment with Id : ${commentId}`);
    }

    try {
        // Check if the user has already liked this comment
        const getcomment = await Like.findOne({
            comment: commentId,
            likedBy: req.user?._id
        });

        // If the comment is already liked, remove the like
        if (getcomment) {
            await Like.findByIdAndDelete(getcomment._id); // Delete the like entry
            return res.status(200).json(
                new ApiResponse(200, 'Comment UnLiked successfully!')
            );
        }

        // If the comment is not liked, create a new like entry
        const updateLike = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        });

        if (updateLike) {
            return res.status(200).json(
                new ApiResponse(200, 'Comment liked successfully!')
            );
        }
    } catch (error) {
        console.log(error);
        throw new CustomApiError(500, error.message);
    }
});


/**
 * Toggle a like/unlike on a video.
 * If the user has already liked the video, it removes the like.
 * If the user has not liked the video yet, it adds a like.
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Extract videoId from the URL parameters
    if (!videoId) {
        throw new CustomApiError(400, `There is no such video with Id : ${videoId}`);
    }

    try {
        // Check if the user has already liked this video
        const getVideo = await Like.findOne({
            video: videoId,
            likedBy: req.user?._id
        });

        // If the video is already liked, remove the like
        if (getVideo) {
            await Like.findByIdAndDelete(getVideo._id); // Delete the like entry
            return res.status(200).json(
                new ApiResponse(200, 'Video UnLiked successfully!')
            );
        }

        // If the video is not liked, create a new like entry
        const updateLike = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        });

        if (updateLike) {
            return res.status(200).json(
                new ApiResponse(200, 'Video liked successfully!')
            );
        }
    } catch (error) {
        console.log(error);
        throw new CustomApiError(500, error.message);
    }
});

/**
 * Fetch all videos liked by the user.
 * It aggregates data from the "Like" model and looks up related video information.
 */
const getAllLikedVideos = asyncHandler(async (req, res) => {
    try {
        // Use MongoDB aggregation to get all liked videos by the current user
        const LikedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id), // Match by the logged-in user's ID
                },
            },
            {
                $lookup: {
                    from: 'videos', // Lookup related "videos" collection
                    localField: 'video', // Field in "like" collection
                    foreignField: '_id', // Field in "videos" collection to match
                    as: 'LikedVideos', // Store result in "LikedVideos" field
                },
            },
            {
                $match: {
                    'LikedVideos.0': { $exists: true }, // Ensure that at least one video is matched
                },
            },
            {
                $project: {
                    LikedVideos: 1, // Only return the "LikedVideos" field
                },
            },
        ]);

        // If liked videos are found, return them in the response
        if (LikedVideos.length > 0) {
            return res.status(200).json(
                new ApiResponse(200, 'Liked videos fetched successfully!', LikedVideos)
            );
        }

        // If no liked videos are found, return a 404 response
        return res.status(404).json(
            new ApiResponse(404, 'No liked videos found!')
        );
    } catch (error) {
        console.log(error);
        throw new CustomApiError(500, error.message);
    }
});

// Export the controller functions so they can be used in routing
module.exports = {
    togglecommentLike,
    toggleVideoLike,
    getAllLikedVideos
};
