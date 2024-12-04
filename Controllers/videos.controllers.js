const asyncHandler = require('../utils/asynchandler')
const Video = require('../Models/video.models')
const uploadFile = require('../utils/cloudinary')
const ApiResponse = require('../utils/apiResponse')
const CustomApiError = require('../utils/apiErrors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const publishAVideo = asyncHandler(async (req,res)=>{
    try {
    const {title,description,views,isPublished} = req.body
    if(!(views || isPublished)){
        throw new CustomApiError(
            400,
            'All fields are required!'
        )
    }
   
    const videoLocalpath = req.files?.videoFile[0].path    
    const thumbnailLocalpath = req.files?.thumbnail[0].path


    if(!videoLocalpath || !thumbnailLocalpath){
        throw new CustomApiError(
            401,'VidoeFile and thumbnail both are required'
        )
    }
       const thumbnail = await uploadFile(thumbnailLocalpath)
       const videoFile = await uploadFile(videoLocalpath)
 
        const video = await Video.create({
            videoFile:videoFile.url|| '',
            thumbnail:thumbnail.url|| '',
            title:title,
            description:description,
            duration:videoFile.duration,
            views:views,
            isPublished:isPublished,
            owner:req.user
        })
        return res.redirect('/home')
} catch (error) {
    console.log(error)    
}
})

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new CustomApiError(
            400,
            `There is no such video with Id:${videoId}`
        )
    }
    
   return res.status(200).json(
        new ApiResponse(
            200,
            'Video fetched successfully!',
            video
        )
    )
})

const updateVideo = asyncHandler(async(req,res)=>{
    const { videoId } = req.params
    const { title ,description } = req.body

    if(!title || !description){
        throw new CustomApiError(
            400,
            'title and description fields cannot be empty'
        )
    }
    const thumbnailLocalpath = req.file?.path
    if(!thumbnailLocalpath){
        throw new CustomApiError(
            500,
            'Thumbnnail local path not found!'
        )
    }

    const Newthumbnail = await uploadFile(thumbnailLocalpath)
    if(!Newthumbnail){
        throw new CustomApiError(
            500,
            'Something went wrong while uploading the file on cloudinary'
        )
    }

    const video = await  Video.findByIdAndUpdate(videoId,{
        $set:{ title:title,
        description:description,
        thumbnail:Newthumbnail?.url}
    },{new:true})

    if(!video){
        return  res.status(200).json(
             new ApiResponse(
                 200,
                 `There is no such video with Id : ${videoId}`,
             )
         )
     }

    return res.status(200).json(
        new ApiResponse(
            200,
            'Video details updated successfully!',
            video
            
        )
    )
})

const deleteVideo = asyncHandler (async(req,res)=>{
    const { videoId } = req.params

    const video = await Video.findByIdAndDelete(videoId)

    if(!video){
        throw new CustomApiError(
            400,
            `There is no such video with Id:${videoId}`
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            'Video deleted successfully!'
        )
    )
})

const toogglepublishStatus = asyncHandler(async(req,res)=>{
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new CustomApiError(
            400,
            `There is no such video with Id:${videoId}`
        )
    }
    video.isPublished =!video.isPublished
    await video.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(
            200,
            'Video publish Status Updated',
            video
        )
    )
    

})


module.exports =
{
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    toogglepublishStatus
    
}