// Importing required modules and functions
const asyncHandler = require('../utils/asynchandler')
const Video = require('../Models/video.models')
const uploadFile = require('../utils/cloudinary')
const ApiResponse = require('../utils/apiResponse')
const CustomApiError = require('../utils/apiErrors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

// Function to publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description, views, isPublished } = req.body
        
        // Check if essential fields (views and isPublished) are provided
        if (!(views || isPublished)) {
            throw new CustomApiError(400, 'All fields are required!');
        }

        // Extracting file paths from the request (video file and thumbnail)
        const videoLocalpath = req.files?.videoFile[0].path    
        const thumbnailLocalpath = req.files?.thumbnail[0].path

        // If video or thumbnail is missing, throw an error
        if (!videoLocalpath || !thumbnailLocalpath) {
            throw new CustomApiError(401, 'VideoFile and thumbnail both are required');
        }

        // Upload files to Cloudinary
        const thumbnail = await uploadFile(thumbnailLocalpath)
        const videoFile = await uploadFile(videoLocalpath)

        // Create a new video in the database
        const video = await Video.create({
            videoFile: videoFile.url || '',   // Store the video file URL
            thumbnail: thumbnail.url || '',   // Store the thumbnail URL
            title: title,                     // Title of the video
            description: description,         // Description of the video
            duration: videoFile.duration,     // Duration of the video
            views: views,                     // View count
            isPublished: isPublished,         // Publish status
            owner: req.user                   // The user who uploaded the video
        })
        return res.redirect('/home') // Redirect to the home page after publishing the video
    } catch (error) {
        console.error(error)  // Log the error for debugging
    }
})

// Function to get a video by its ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    // Fetch the video from the database using its ID
    const video = await Video.findById(videoId)
    
    // If video is not found, throw an error
    if (!video) {
        throw new CustomApiError(400, `There is no such video with Id:${videoId}`)
    }

    // Return the video details in the response
    return res.status(200).json(new ApiResponse(200, 'Video fetched successfully!', video))
})

// Function to update an existing video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, thumbnail, description } = req.body

    // Validate the video ID
    if (!videoId) {
        throw new CustomApiError(400, 'Video ID is required.');
    }

    try {
        // Retrieve the existing video details from the database
        const existingVideo = await Video.findById(videoId)
        if (!existingVideo) {
            return res.status(404).json(new ApiResponse(404, `No video found with ID: ${videoId}.`))
        }

        const thumbnailLocalpath = req.file?.path
        if (!thumbnailLocalpath) {
            throw new CustomApiError(400, 'No local Path to be found using the existing thumbnail')
        }

        // Upload the new thumbnail file to Cloudinary
        const thumbnail = await uploadFile(thumbnailLocalpath)

        // If thumbnail upload fails, throw an error
        if (!thumbnail) {
            throw new CustomApiError(400, 'Something went wrong while uploading the thumbnail on cloudinary!')
        }

        // Update the video details, keeping existing values if not provided
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title: title || existingVideo.title,
                    thumbnail: thumbnail.url || existingVideo.thumbnail,
                    description: description || existingVideo.description,
                },
            },
            { new: true, runValidators: true }
        )
        const updatedVideo = await Video.findById(video._id)
        
        // Return the updated video details in the response
        return res.status(200).json(new ApiResponse(200, 'Video details updated successfully!', updatedVideo))
    } catch (error) {
        console.error('Error updating video:', error)  // Log error for debugging
        throw new CustomApiError(500, 'An unexpected error occurred while updating the video.')
    }
})

// Function to delete a video by its ID
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    // Delete the video from the database
    const video = await Video.findByIdAndDelete(videoId)
    
    // If video not found, throw an error
    if (!video) {
        throw new CustomApiError(400, `There is no such video with Id:${videoId}`)
    }

    // Redirect to the user's channel page after deletion
    return res.redirect(`/api/v1/auth/user/channel/${req.user.username}`)
})

// Function to toggle the publish status of a video
const toogglepublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    
    // If video not found, throw an error
    if (!video) {
        throw new CustomApiError(400, `There is no such video with Id:${videoId}`)
    }

    // Toggle the publish status of the video
    video.isPublished = !video.isPublished
    await video.save({ validateBeforeSave: false })
    
    // Return the updated video with its new publish status
    return res.status(200).json(new ApiResponse(200, 'Video publish Status Updated', video))
})

// Function to search for videos based on a query string
const searchVideos = asyncHandler(async (req, res) => {
    try {
        const { q } = req.query  // Get the search query from the request
        
        // If search query is not provided, throw an error
        if (!q) {
            throw new CustomApiError(400, 'Search query is required.');
        }

        const searchRegex = new RegExp(q, 'i')  // Create a case-insensitive regex for the search query

        // Search for videos by title or description that match the query and are published
        const videos = await Video.find({
            $or: [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
            ],
            isPublished: true,
        })
        .populate('owner')  // Include owner details
        .select('-__v')  // Exclude the __v field from the result
        .sort({ createdAt: -1 })  // Sort by creation date in descending order
        .limit(20)  // Limit results to 20 videos

        // If no videos found, return an empty search page
        if (videos.length === 0) {
            return res.status(200).render('SearchPage', {
                searchQuery: q,
                searchResults: [],
                user: req.user
            });
        }

        // Return the search results on the search page
        return res.status(200).render('SearchPage', {
            searchQuery: q,
            searchResults: videos,
            user: req.user
        });
    } catch (error) {
        console.error('Error searching videos:', error)  // Log the error for debugging
        throw error
    }
})

// Export the functions to be used in routes
module.exports = {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    toogglepublishStatus,
    searchVideos
}
