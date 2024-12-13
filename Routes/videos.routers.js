const express = require('express')
const upload = require('../Middlerwares/multer.middleware')
const VerifyJwt = require('../Middlerwares/auth')
const VideoRouter = express.Router()
const {publishAVideo,getVideoById,updateVideo, deleteVideo,toogglepublishStatus,searchVideos} = require('../Controllers/videos.controllers')
const { verify } = require('jsonwebtoken')
const Video = require('../Models/video.models') 
const User = require('../Models/users.models') 
const Comment = require('../Models/comment.models') 
const {getUserChannelProfile} =require('../Controllers/users.controllers')
const subscriptionModels = require('../Models/subscription.models')
const likeModels = require('../Models/like.models')
const CustomApiError = require('../utils/apiErrors')
const { versionInfo } = require('graphql')

VideoRouter.route('/publish-video').get(VerifyJwt,(req,res)=>{
    res.render('UploadVideo',{
        user:req.user
    })
}).post(VerifyJwt,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },

    ]),
    publishAVideo
)

VideoRouter.route('/video/:videoId').get(VerifyJwt, async (req, res, next) => {
    try {
        const { videoId } = req.params;

        // Fetch the video and owner
        const video = await Video.findById(videoId).populate('owner');
        if (!video) {
            return res.status(404).send('Video not found');
        }

      const history =   await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { watchHistory: videoId } }, // $addToSet ensures no duplicates
            { new: true } // Returns the updated document
          );

          console.log("History:-",history)

        // Check the subscription status
        const subscription = await subscriptionModels.findOne({
            subscriber: req.user._id,
            channel: video.owner._id
        });

        const like = await likeModels.findOne({
            video:videoId ,
            likedBy: req.user._id
        });

        const ChannelSubscribers = await subscriptionModels.find({
            channel: video.owner._id
        })

        const VideoLikes = await likeModels.find({
            video: videoId
        })

        console.log("subs",ChannelSubscribers.length)
        console.log("Likes",VideoLikes.length)

        // Set isSubscribed flag based on whether the user is subscribed or not
        const isSubscribed = subscription ? true : false;

        const isLiked = like? true : false

        // Increment video views count
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });

        // Fetch comments
        const comments = await Comment.find({ video: videoId })
            .populate("owner", "username fullname avatar");

        console.log("Comments:", comments); // Debugging

        // Render the page with video data, subscription status, and comments
        res.render('watch', {
            video,
            owner: video.owner,
            comments,
            isSubscribed,  // Pass subscription status to the view
            user: req.user,
            channelSubscribers:ChannelSubscribers.length ,
            isLiked,
            VideoLikes:VideoLikes.length
             // Pass the logged-in user
        });
    } catch (error) {
        next(error);
    }
})
.delete(VerifyJwt,deleteVideo)

VideoRouter.route('/video/publishstatus/:videoId').get(toogglepublishStatus)

VideoRouter.route('/video/edit/:videoId').get(VerifyJwt,async(req,res)=>{
    const {videoId} = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new CustomApiError(
            400,
            `There is no such video with video Id :- ${videoId}`
        )

    }
    return res.render('EditVideo',{
        video:video,
        user:req.user
    })
}).post(VerifyJwt,upload.single('thumbnail'),updateVideo)

VideoRouter.get('/search',VerifyJwt, searchVideos);

module.exports = VideoRouter