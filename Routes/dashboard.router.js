const express = require('express')
const VerifyJwt = require('../Middlerwares/auth')
const { getChannelStats, getChannelAllVideos } = require('../Controllers/dashboard.controllers')

const DashboardRouter = express.Router()


DashboardRouter.route('/stats').get(VerifyJwt,getChannelStats)
DashboardRouter.route('/videos').get(VerifyJwt,getChannelAllVideos)


module.exports = DashboardRouter