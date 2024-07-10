const asyncHandler = require('../utils/asynchandler')
const User = require('../Models/users.models')
const Like = require('../Models/like.models')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const { default: mongoose } = require('mongoose')


const togglecommentLike = asyncHandler(async(req,res)=>{
    const {commentId }= req.params
    if(!commentId){
        throw new CustomApiError(
            400,
            `There is no such comment with Id : ${commentId}`
        )
    }

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
                 'Comment UnLike  successfully!'
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
    if(!tweetId){
        throw new CustomApiError(
            400,
            `There is no such tweet with Id : ${tweetId}`
        )
    }
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
                 'Tweet UnLike  successfully!'
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
                 'Tweet liked successfully!'
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
    if(!videoId){
        throw new CustomApiError(
            400,
            `There is no such video with Id : ${videoId}`
        )
    }

   try {
     const getVideo = await Like.findOne({
         video:videoId,
         likedBy:req.user?._id
     })
     if(getVideo){
         const deleteLike = await Like.findByIdAndDelete(getVideo._id)
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Video UnLiked  successfully!'
             )
         ) 
     }
 
     const updateLike  =  await Like.create({
        video:videoId,
        likedBy:req.user?._id
     })
     if(updateLike){
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Video liked successfully!'
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

const getAllLikedVideos = asyncHandler(async (req, res) => {
    try {
        const LikedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id),
                },
            },
            {
                $lookup: {
                    from: 'videos',
                    localField: 'video',
                    foreignField: '_id',
                    as: 'LikedVideos',
                },
            },
            {
                $match: {
                    'LikedVideos.0': { $exists: true },
                },
            },
            {
                $project: {
                    LikedVideos: 1,
                },
            },
        ]);

        if (LikedVideos.length > 0) {
            return res.status(200).json(
                new ApiResponse(200, 'Liked videos fetched successfully!', LikedVideos)
            );
        }

        return res.status(404).json(
            new ApiResponse(404, 'No liked videos found!')
        );
    } catch (error) {
        console.log(error);
        throw new CustomApiError(500, error.message);
    }
});


module.exports={
    togglecommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getAllLikedVideos
    
}