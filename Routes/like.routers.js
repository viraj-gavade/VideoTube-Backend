const express = require('express')
const { togglelike, toggleVideoLike, togglecommentLike, toggleTweetLike } = require('../Controllers/like.controllers')
const VerifyJwt = require('../Middlerwares/auth')
const LikeRouter = express.Router()


LikeRouter.route('/likes/:videoId').post(VerifyJwt,toggleVideoLike)
LikeRouter.route('/likes/:commentId').post(VerifyJwt,togglecommentLike)
LikeRouter.route('/likes/:tweetId').post(VerifyJwt,toggleTweetLike)


module.exports = LikeRouter