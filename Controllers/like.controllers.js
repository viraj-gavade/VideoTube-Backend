const asyncHandler = require('../utils/asynchandler')
const User = require('../Models/users.models')
const Like = require('../Models/like.models')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const { default: mongoose } = require('mongoose')


const togglecommentLike = asyncHandler(async(req,res)=>{
    const {commentId }= req.params

   try {
     const getcomment = await Like.findOne({
         comment:commentId,
         likedBy:req.user?._id
     })
     if(getcomment){
         const deleteLike = await Like.findByIdAndDelete(getcomment._id)
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Comment Like deleted successfully!'
             )
         ) 
     }
 
     const updateLike  =  await Like.create({
         comment:commentId,
         likedBy:req.user?._id
     })
     if(updateLike){
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Comment liked successfully!'
             )
         )
     }
   } catch (error) {
     console.log(error)
     throw new CustomApiError(
        500,
        error.message
     )
   }

})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId }= req.params

   try {
     const gettweet = await Like.findOne({
         tweet:tweetId,
         likedBy:req.user?._id
     })
     if(gettweet){
         const deleteLike = await Like.findByIdAndDelete(gettweet._id)
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Comment Like deleted successfully!'
             )
         ) 
     }
 
     const updateLike  =  await Like.create({
        tweet:tweetId,
        likedBy:req.user?._id
     })
     if(updateLike){
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Comment liked successfully!'
             )
         )
     }
   } catch (error) {
     console.log(error)
     throw new CustomApiError(
        500,
        error.message
     )
   }

})

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId }= req.params

   try {
     const getVideo = await Like.findOne({
         tweet:videoId,
         likedBy:req.user?._id
     })
     if(gettweet){
         const deleteLike = await Like.findByIdAndDelete(getVideo._id)
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Comment Like deleted successfully!'
             )
         ) 
     }
 
     const updateLike  =  await Like.create({
        tweet:videoId,
        likedBy:req.user?._id
     })
     if(updateLike){
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Comment liked successfully!'
             )
         )
     }
   } catch (error) {
     console.log(error)
     throw new CustomApiError(
        500,
        error.message
     )
   }

})

const getAllLikedVideos = asyncHandler(async(req,res)=>{
    
try {
        const LikedVideos = await Like.aggregate([
            {
                $match:{
                    likedBy:new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup:{
                    from:'Video',
                    localField:'video',
                    foreignField:'_id',
                    as:"LikedVideos"
                }
            },
            {
                $match:{
                    '$video.isPublished':true
                }
            }
        ])
        if(!LikedVideos){
            return res.status(200).json(
                new ApiResponse(
                    200,
                    'Liked video feteched successfully!',
                    LikedVideos
                )
            )
        }
        return res.status(400).json(
            new ApiResponse(
                200,
                'No liked video found!'
            )
        )
} catch (error) {
    console.log(error)
    throw new CustomApiError(
        400,
        error.message
    )
}
})

module.exports={
    togglecommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getAllLikedVideos
    
}