const asyncHandler = require('../utils/asynchandler')
const User = require('../Models/users.models')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const Subscription = require('../Models/subscription.models')
const Video = require('../Models/video.models')
const { default: mongoose } = require('mongoose')

const togglesubscription = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log("Video Id:-", videoId);

    try {
        // Fetch the video and owner
        const video = await Video.findById(videoId).populate('owner');
        const channelId = video?.owner?._id;

        if (!channelId) {
            return res.status(400).json({
                success: false,
                message: `No channel found with ID: ${channelId}`,
            });
        }

        // Check if the user is already subscribed to this channel
        const channel = await Subscription.findOne({
            subscriber: req.user?._id,
            channel: channelId,
        });

        // If subscribed, unsubscribe the user
        if (channel) {
            await Subscription.findByIdAndDelete(channel._id);

            return res.status(200).json({
                success: true,
                message: 'Unsubscribed from the channel successfully!',
                isSubscribed: false,
            });
        }

        // If not subscribed, subscribe the user
        const newSubscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });

        if (newSubscription) {
            return res.status(200).json({
                success: true,
                message: 'Subscribed to the channel successfully!',
                isSubscribed: true,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while processing the subscription.',
        });
    }
});

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const { channelId } = req.params
    if(!channelId){
        throw new CustomApiError(
            400,
            `There is no such channel with Id:${channelId}`
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
                    from:'subscriptions',
                    localField:'_id',
                    foreignField:'channel',
                    as:'Subscribers'
    
                },
                
            },{
                $addFields:{
                    subscribers:{
                        $size:'$Subscribers'
                    }
                }
            },{
                $project:{
                    subscribers:1 ,
                    Subscribers:1

                }
            }
            ])
            
            return res.send(channel)
        
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
                    from:'subscriptions',
                    localField:'_id',
                    foreignField:'subscriber',
                    as:'Subscribed'
    
                },
                
            },{
                $addFields:{
                    subscribed:{
                        $size:'$Subscribed'
                    }
                }
            },{
                $project:{
                    Subscribed:1 ,
                    subscribed:1

                }
            }
            ])
            return res.send(channel)
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


//Subscription Route Working Confirmed