const asyncHandler = require('../utils/asynchandler')
const User = require('../Models/users.models')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const Subscription = require('../Models/subscription.models')
const { default: mongoose } = require('mongoose')


const togglesubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    const channle = await User.findById(channelId)
    res.send(channle)
})

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const { channelId } = req.params

    const channel = await User.aggregate([
        {
             $match:{
               _id:new mongoose.Types.ObjectId(channelId) 
             }
         }, 
         {
             $lookup:{
                 from:'subscriptions',
                 localField:"_id",
                 foreignField:'channel',
                 as:'subscribers'
             }
         },
         
     ])

     res.send(channel[0].subscribers)
})

module.exports =
{ togglesubscription,
    getUserChannelSubscribers
}