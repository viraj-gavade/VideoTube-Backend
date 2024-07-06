const asyncHandler = require('../utils/asynchandler')
const Comment = require('../Models/comment.models')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const Video = require('../Models/video.models')
const { default: mongoose } = require('mongoose')


const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const comment = await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:'_id',
                foreignField:'video',
                as:'comments'
            }
        },
        {
            $project:{
                comments:1
            }
        }
    ])
    if(!comment){
        throw new CustomApiError(
            500,
            `Unable to load the comments please check the videoId again`
        )
    }

    const comments = await comment[0].comments
    return res.status(200).send(comment[0].comments)
})



const addComment =asyncHandler(async(req,res)=>{
   try {
     const { videoId } = req.params
     const { content } = req.body
     const video = await Video.findById(videoId)
     if(!video){
         throw new CustomApiError(
             400,
             `There is no such video with Id:${videoId}`
         )
     }
     const comment = await Comment.create({
         content:content,
         video:video._id,
         owner:req.user._id
     })
     if(!comment){
         throw new CustomApiError(
             500,
             'Something went wrong while creating the comment!'
         )
     }
     return res.status(200).json(
         new ApiResponse(
             200,
             'Comment created successfully!',
             comment
         )
     )
   } catch (error) {
    throw new CustomApiError(
        error.statusCode,
        error.message
    )
   }
    
})

const updateCommment = asyncHandler(async(req,res)=>{
    const {content} = req.body
    const {commentId} = req.params 
    const comment = await Comment.findByIdAndUpdate(commentId,
        {
        content:content
    },
    {new:true}
)
    if(!comment){
        throw new CustomApiError(
            400,
            'Something went wrong while upadating the comment '
        )
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            'Comment updated successfully!',
            comment
        )
    )
})


const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment){
        throw new CustomApiError(
            400,
            'Something went wrong while deleting the comment!'
        )
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            'Comment deleted successfully!'
        )
    )
})
module.exports =
{
    addComment  ,
    updateCommment,
    deleteComment,
    getVideoComments
}