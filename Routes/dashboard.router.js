const express = require('express')
const VerifyJwt = require('../Middlerwares/auth')
const { getChannelStats, getChannelAllvideos } = require('../Controllers/dashboard.controllers')

const DashboardRouter = express.Router()


DashboardRouter.route('/stats').get(VerifyJwt,getChannelStats)
DashboardRouter.route('/videos').get(VerifyJwt,getChannelAllvideos)


module.exports = DashboardRouter