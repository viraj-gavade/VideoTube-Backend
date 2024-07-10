const express = require('express')
const upload = require('../Middlerwares/multer.middleware')
const VerifyJwt = require('../Middlerwares/auth')
const VideoRouter = express.Router()
const {publishAVideo,getVideoById,updateVideo, deleteVideo,toogglepublishStatus} = require('../Controllers/videos.controllers')


VideoRouter.route('/publish-video').post(VerifyJwt,
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

VideoRouter.route('/video/:videoId').get(getVideoById)
.patch(VerifyJwt,upload.single('thumbnail'),updateVideo)
.delete(VerifyJwt,deleteVideo)

VideoRouter.route('/video/publishstatus/:videoId').get(toogglepublishStatus)

module.exports = VideoRouter