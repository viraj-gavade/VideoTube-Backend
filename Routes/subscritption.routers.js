const  express = require('express')
const {togglesubscription,getUserChannelSubscribers,getSubscribedChannels} = require('../Controllers/subscription.controllers')
const VerifyJwt = require('../Middlerwares/auth')
const subscriptionRouter = express.Router()



subscriptionRouter.route('/subscibers/:channelId').get(getUserChannelSubscribers)
subscriptionRouter.route('/subscribed/:channelId').get(getSubscribedChannels)


module.exports = subscriptionRouter