const asyncHandler = require('../utils/asynchandler')
const User = require('../Models/users.models')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const Subscription = require('../Models/subscription.models')
const { default: mongoose } = require('mongoose')


const togglesubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    if(!channelId){
        throw new CustomApiError(
            400,
            `There is no such channel with Id : ${channelId}`
        )
    }
  try {
      const channel = await Subscription.findOne({
          subscriber:req.user?._id,
          channel:channelId
      })
      if(!channel){
          const deletesubscription = await Subscription.findByIdAndDelete(channel?._id)
          return res.status(200).json(
              new ApiResponse(
                  200,
                  'Unsubscribed channel successfully!'
              )
          )
      }
  
      const updateSubscription = await Subscription.create({
          subscriber:req.user?._id,
          channel:channelId
      })
  
      if(updateSubscription){
          return res.status(200).json(
              new ApiResponse(
                  200,
                  'Subscribed to the channel successfully!'
              )
          )
      }
  
  } catch (error) {
    console.log(error)
    throw new CustomApiError(
        error.statusCode,
        error.message
    )
  }
})

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const { channelId } = req.params
    if(!channelId){
        throw new CustomApiError(
            400,
            `There is no such channel with Id:${channelId}`
        )
    }
    try {
        
    } catch (error) {
        throw new CustomApiError(
            error.statusCode,
            error.message
        )
    }
  
})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const { channelId } = req.params
    if ( !channelId ){
        throw new CustomApiError(
            400,
                `There is no such channel Id:${channelId}`
        )
    }
    try {
        const channel = await User.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(channelId) 
                  
    
                },
                
            },
            {
                $lookup:{
                    from:'User',
                    localField:'_id',
                    foreignField:'subscriber',
                    as:'Suscribedto'
    
                }
            }
        ])
        return res.send(channel[0].Suscribedto)
    } catch (error) {
        console.log(error)
        throw new CustomApiError(
            error.statusCode,
            error.message
        
        )
    }
})


module.exports =
{ 
    togglesubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}