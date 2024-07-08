const  express = require('express')
const {togglesubscription,getUserChannelSubscribers} = require('../Controllers/subscription.controllers')
const VerifyJwt = require('../Middlerwares/auth')
const subscriptionRouter = express.Router()



subscriptionRouter.route('/subs/:channelId').get(VerifyJwt,getUserChannelSubscribers)


module.exports = subscriptionRouter