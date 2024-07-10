const express = require('express')
const { togglelike, toggleVideoLike, togglecommentLike, toggleTweetLike, getAllLikedVideos } = require('../Controllers/like.controllers')
const VerifyJwt = require('../Middlerwares/auth')
const LikeRouter = express.Router()


LikeRouter.route('/likes/video/:videoId').get(VerifyJwt,toggleVideoLike)
LikeRouter.route('/likes/comment/:commentId').get(VerifyJwt,togglecommentLike)
LikeRouter.route('/likes/tweet/:tweetId').get(VerifyJwt,toggleTweetLike)

LikeRouter.route('/likedvideos').get(VerifyJwt,getAllLikedVideos)


module.exports = LikeRouter