const express = require('express')
const {creatTweet,getUserTweets,UpdateTweet,deleteTweet} = require('../Controllers/tweet.controllers')
const TweetRouter = express.Router()
const VerifyJwt = require('../Middlerwares/auth')

TweetRouter.route('/tweet')
.post(VerifyJwt,creatTweet)
.get(VerifyJwt,getUserTweets)



TweetRouter.route('/tweet/:tweetId')
.patch(VerifyJwt,UpdateTweet)
.delete(deleteTweet)



module.exports = TweetRouter