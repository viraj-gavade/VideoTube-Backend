const asyncHandler = require('../utils/asynchandler') // Import async handler to handle async operations
const Like = require('../Models/like.models') // Import the Like model
const ApiResponse = require('../utils/apiResponse') // Import the API response utility for structured responses
const CustomApiError = require('../utils/apiErrors') // Import the custom error handler for API errors
const { default: mongoose } = require('mongoose') // Import mongoose to interact with MongoDB
const Subscription = require('../Models/subscription.models') // Import the Subscription model
const Video = require('../Models/video.models') // Import the Video model


const getChannelStats = asyncHandler(async (req, res) => {
   // Extract user ID from the authenticated user object (assumed to be added by authentication middleware)
   const userId = req.user._id

   // If userId is not present, throw an error indicating invalid access
   if (!userId) {
      throw new CustomApiError(
          400, // HTTP status code for Bad Request
          'Invalid access. You cannot see the dashboard of this channel.' // Error message
      )
   }

   // Aggregation pipeline to calculate various channel stats
   const channelStats = await Video.aggregate([
      { 
          $match: { owner: userId } // Match videos owned by the current user (channel owner)
      },
      {
          // Lookup to get all subscribers for the channel
          $lookup: {
              from: "subscriptions", // Source collection: subscriptions
              localField: "owner", // Field in 'Video' collection to join on
              foreignField: "channel", // Field in 'subscriptions' collection to join on
              as: "subscribers", // The result will be stored in the 'subscribers' array
          },
      },
      {
          // Lookup to get channels the user subscribes to
          $lookup: {
              from: "subscriptions", // Source collection: subscriptions
              localField: "owner", // Field in 'Video' collection to join on
              foreignField: "subscriber", // Field in 'subscriptions' collection to join on
              as: "subscribedTo", // The result will be stored in the 'subscribedTo' array
          },
      },
      {
          // Lookup likes for the user's videos
          $lookup: {
              from: "likes", // Source collection: likes
              localField: "_id", // Field in 'Video' collection to join on
              foreignField: "video", // Field in 'likes' collection to join on
              as: "likedVideos", // The result will be stored in the 'likedVideos' array
          },
      },
      {
          // Lookup comments for the user's videos
          $lookup: {
              from: "comments", // Source collection: comments
              localField: "_id", // Field in 'Video' collection to join on
              foreignField: "video", // Field in 'comments' collection to join on
              as: "videoComments", // The result will be stored in the 'videoComments' array
          },
      },
      {
          // Lookup tweets by the user (if applicable)
          $lookup: {
              from: "tweets", // Source collection: tweets
              localField: "owner", // Field in 'Video' collection to join on
              foreignField: "owner", // Field in 'tweets' collection to join on
              as: "tweets", // The result will be stored in the 'tweets' array
          },
      },
      {
          // Group the data to calculate various stats
          $group: {
              _id: null, // Grouping by a null value means everything will be grouped together
              totalVideos: { $sum: 1 }, // Count total number of videos
              totalViews: { $sum: "$views" }, // Sum the 'views' field to calculate total views
              subscribers: { $first: "$subscribers" }, // First array element for subscribers
              subscribedTo: { $first: "$subscribedTo" }, // First array element for channels the user subscribed to
              totalLikes: { $sum: { $size: "$likedVideos" } }, // Count the total likes per video
              totalComments: { $sum: { $size: "$videoComments" } }, // Count the total comments per video
              totalTweets: { $first: { $size: "$tweets" } }, // Count the number of tweets
          },
      },
      {
          // Project the desired fields (reshape the document for the response)
          $project: {
              _id: 0, // Exclude the _id field
              totalVideos: 1, // Include totalVideos field
              totalViews: 1, // Include totalViews field
              subscribers: { $size: "$subscribers" }, // Get the number of subscribers
              subscribedTo: { $size: "$subscribedTo" }, // Get the number of subscriptions the user has
              totalLikes: 1, // Include totalLikes field
              totalComments: 1, // Include totalComments field
              totalTweets: 1, // Include totalTweets field
          },
      },
   ])

   // If aggregation pipeline fails or returns no stats, throw an error
   if (!channelStats || channelStats.length === 0) {
      throw new CustomApiError(
          400, // HTTP status code for Bad Request
          'Something went wrong. Please check the aggregation pipeline.' // Error message
      )
   }

  

   // Find all videos uploaded by the user (channel owner)
   const videos = await Video.find({ owner: req.user._id })
   
   // If no videos are found, return a message indicating that
   if (videos.length < 1) {
       return res.status(200).json(
           new ApiResponse(
               200, // HTTP status code for OK
               'No video uploaded' // Success message
           )
       )
   }

  

   // Return a successful response with channel stats and videos
   return res.status(200).json(
       new ApiResponse(
           200, // HTTP status code for OK
           'Channel video fetched successfully!', // Success message
           channelStats[0], // Channel stats
           videos // Videos uploaded by the user
       )
   )
})

// Function to get all videos of a channel (not fully implemented)
const getChannelAllVideos = asyncHandler(async (req, res) => {
    // Extract user ID from the authenticated user object
    const userId = req.user?._id

    // If no user ID is present, throw an error indicating unauthorized access
    if (!userId) {
        throw new CustomApiError(
            404, // HTTP status code for Not Found
            'You are not authorized. Please return to the login page!' // Error message
        )
    }

    // Placeholder for the implementation of this function (could fetch all videos of the user)
    // Logic for fetching and responding with all videos of the user will go here
})

// Export functions to be used in routes
module.exports = {
    getChannelAllVideos, // Export the getChannelAllVideos function
    getChannelStats // Export the getChannelStats function
}
