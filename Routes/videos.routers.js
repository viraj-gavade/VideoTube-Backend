const express = require('express');
const upload = require('../Middlerwares/multer.middleware'); // Middleware for file uploads
const VerifyJwt = require('../Middlerwares/auth'); // Middleware for JWT verification
const VideoRouter = express.Router(); // Create a new Express Router

// Import controller functions
const { publishAVideo, getVideoById, updateVideo, deleteVideo, toogglepublishStatus, searchVideos } = require('../Controllers/videos.controllers');
const { getUserChannelProfile } = require('../Controllers/users.controllers');

// Import models
const Video = require('../Models/video.models');
const User = require('../Models/users.models');
const Comment = require('../Models/comment.models');
const subscriptionModels = require('../Models/subscription.models');
const likeModels = require('../Models/like.models');
const CustomApiError = require('../utils/apiErrors');

// Route to render the video upload page and handle video publishing
VideoRouter.route('/publish-video')
    .get(VerifyJwt, (req, res) => {
        res.render('UploadVideo', {
            user: req.user // Pass the logged-in user to the view
        })
    })
    .post(VerifyJwt, 
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 }
        ]), 
        publishAVideo // Handles video publishing
    );

// Route to view a video and increment views
VideoRouter.route('/video/:videoId')
    .get(VerifyJwt, async (req, res, next) => {
        try {
            const { videoId } = req.params;
            const video = await Video.findById(videoId).populate('owner'); // Fetch video and its owner
            if (!video) {
                return res.status(404).send('Video not found');
            }

            // Add the video to the user's watch history
            const history = await User.findByIdAndUpdate(
                req.user._id,
                { $addToSet: { watchHistory: videoId } }, // $addToSet ensures no duplicates
                { new: true }
            );

            // Check if the user is subscribed to the channel
            const subscription = await subscriptionModels.findOne({
                subscriber: req.user._id,
                channel: video.owner._id
            });

            // Check if the user liked the video
            const like = await likeModels.findOne({
                video: videoId,
                likedBy: req.user._id
            });

            // Get the number of subscribers for the channel
            const ChannelSubscribers = await subscriptionModels.find({
                channel: video.owner._id
            });

            // Get the number of likes on the video
            const VideoLikes = await likeModels.find({
                video: videoId
            });

            // Set subscription and like status
            const isSubscribed = subscription ? true : false;
            const isLiked = like ? true : false;

            // Increment the video views count
            await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });

            // Fetch comments on the video
            const comments = await Comment.find({ video: videoId })
                .populate("owner", "username fullname avatar");

            // Render the video watch page with relevant data
            res.render('watch', {
                video,
                owner: video.owner,
                comments,
                isSubscribed,
                user: req.user,
                channelSubscribers: ChannelSubscribers.length,
                isLiked,
                VideoLikes: VideoLikes.length
            });
        } catch (error) {
            next(error);
        }
    });

// Route to delete a video
VideoRouter.route('/video/delete/:videoId')
    .get(VerifyJwt, deleteVideo);

// Route to toggle the publish status of a video
VideoRouter.route('/video/publishstatus/:videoId')
    .get(toogglepublishStatus);

// Route to render the video edit page and handle video updates
VideoRouter.route('/video/edit/:videoId')
    .get(VerifyJwt, async (req, res) => {
        const { videoId } = req.params;
        const video = await Video.findById(videoId);
        if (!video) {
            throw new CustomApiError(400, `There is no such video with video Id: ${videoId}`);
        }
        return res.render('EditVideo', {
            video: video,
            user: req.user
        });
    })
    .post(VerifyJwt, upload.single('thumbnail'), updateVideo);

// Route to search for videos
VideoRouter.get('/search', VerifyJwt, searchVideos);

module.exports = VideoRouter;
