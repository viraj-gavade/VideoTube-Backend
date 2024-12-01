const express = require('express')
const upload = require('../Middlerwares/multer.middleware')
const VerifyJwt = require('../Middlerwares/auth')
const VideoRouter = express.Router()
const {publishAVideo,getVideoById,updateVideo, deleteVideo,toogglepublishStatus} = require('../Controllers/videos.controllers')
const { verify } = require('jsonwebtoken')
const Video = require('../Models/video.models') 
const User = require('../Models/users.models') 
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

VideoRouter.route('/video/:videoId').get(async(req,res)=>{
    const {videoId} = req.params
    const video = await Video.findById(videoId)
    const user = await User.findById(video.owner)  
        console.log(video)
        console.log(user)
    res.render('watch',{
        video: video ,
        owner:user   
    })
},getVideoById)
.patch(VerifyJwt,upload.single('thumbnail'),updateVideo)
.delete(VerifyJwt,deleteVideo)

VideoRouter.route('/video/publishstatus/:videoId').get(toogglepublishStatus)

module.exports = VideoRouter