const express = require('express')
const upload = require('../Middlerwares/multer.middleware')
const VerifyJwt = require('../Middlerwares/auth')
const VideoRouter = express.Router()
const {publishAVideo,getVideoById,updateVideo, deleteVideo,toogglepublishStatus} = require('../Controllers/videos.controllers')
const { verify } = require('jsonwebtoken')
const Video = require('../Models/video.models') 
const User = require('../Models/users.models') 
const Comment = require('../Models/comment.models') 
const {getUserChannelProfile} =require('../Controllers/users.controllers')

VideoRouter.route('/publish-video').get(VerifyJwt,(req,res)=>{
    res.render('UploadVideo')
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

        const user = video.owner;

        // Fetch comments
        const comments = await Comment.find({ video: videoId })
        .populate("owner", "username fullname avatar") 
        console.log("Comments:", comments); // Debugging

        // Render the page
        res.render('watch', {
            video,
            owner: user,
            comments, // Send the comments array directly
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
})
.patch(VerifyJwt,upload.single('thumbnail'),updateVideo)
.delete(VerifyJwt,deleteVideo)

VideoRouter.route('/video/publishstatus/:videoId').get(toogglepublishStatus)

module.exports = VideoRouter