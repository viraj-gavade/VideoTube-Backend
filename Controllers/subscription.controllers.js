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
         {
             $lookup:{
                 from:'subscriptions',
                 localField:'_id',
                 foreignField:'subscriber',
                 as:'subscribed'
             }
         },
         {
             $addFields:{
                 subscriberCount:{
                     $size:'$subscribers'
                 },
                 subscribedCount:{
                     $size:'$subscribed'
                 },
                     isSubscribed:{
                     $cond:{
                         if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                         then:true,
                         else:false
                     }
 
                 }
             }
     },
         {
             $project:{
                 fullname:1,
                 username:1,
                 subscriberCount:1,
                 subscribedCount:1,
                 isSubscribed:1 ,
                 avatar:1,
                 coverImage:1,
                 email:1   
              }       
     }
     ])
     
     res.send(channel)
})

module.exports =
{ togglesubscription,
    getUserChannelSubscribers
}