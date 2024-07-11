const asyncHandler = require('../utils/asynchandler')
const Like = require('../Models/like.models')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const { default: mongoose } = require('mongoose')
const Subscription = require('../Models/subscription.models')
const Video = require('../Models/video.models')

 // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

 const getChannelStats = asyncHandler(async(req,res)=>{
   const userId = req.user._id
   if(!userId){
    throw new CustomApiError(
        400,
        'Inavlid access you cannot see the dashboard of this channel.'
    )
   }
    const channelstats = await Video.aggregate([
        { $match: { owner: userId } },
        // Lookup for Subscribers of a channel
        {
          $lookup: {
            from: "subscriptions",
            localField: "owner",
            foreignField: "channel",
            as: "subscribers",
          },
        },
        // Lookup for the channel which the owner Subscribe
        {
          $lookup: {
            from: "subscriptions",
            localField: "owner",
            foreignField: "subscriber",
            as: "subscribedTo",
          },
        },
        // Lookup likes for the user's videos
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "likedVideos",
          },
        },
        // Lookup comments for the user's videos
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "video",
            as: "videoComments",
          },
        },
        // Lookup tweets by the user
        {
          $lookup: {
            from: "tweets",
            localField: "owner",
            foreignField: "owner",
            as: "tweets",
          },
        },
        // Group to calculate stats
        {
          $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            totalViews: { $sum: "$views" },
            subscribers: { $first: "$subscribers" },
            subscribedTo: { $first: "$subscribedTo" },
            totalLikes: { $sum:  {$size: "$likedVideos"} },
            totalComments: { $sum: { $size: "$videoComments" } },
            totalTweets: { $first: { $size: "$tweets" } },
          },
        },
        // Project the desired fields
        {
          $project: {
            _id: 0,
            totalVideos: 1,
            totalViews: 1,
            subscribers: { $size: "$subscribers" },
            subscribedTo: { $size: "$subscribedTo" },
            totalLikes: 1,
            totalComments: 1,
            totalTweets: 1,
          },
        },
    ])
    if(!channelstats){
        throw new CustomApiError(
            400,
        `Soemthing went wrong check the aggregation pipeline again!`
        )
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            'Channel stats feteched successfully!',
            channelstats[0]
        )
    )
 })


const getChannelAllvideos = asyncHandler(async(req,res)=>{
    const userId = req.user?._id

    if(!userId){
        throw new CustomApiError(
            404,
            'You are not authorized plase return to the login page !'
        )
    }

    const videos = await Video.find(
        {
            owner:req.user?._id,
            // isPublished:true
            })
        if(!videos.lenght<1){
            return res.status(200).json(
                new ApiResponse(
                    200,
                    'No video uploaded'
                )
            )
        }
        return res.status(200).json(
            new ApiResponse(
                200,
                `Channel video fetched successfully!`,
                videos       
            )
        )
})
module.exports = 
{
    getChannelAllvideos,
    getChannelStats
}