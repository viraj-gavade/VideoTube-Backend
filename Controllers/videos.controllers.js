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

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, thumbnail, description } = req.body;

    // Check if video ID is provided
    if (!videoId) {
        throw new CustomApiError(400, 'Video ID is required.');
    }

    try {
        // Retrieve the existing video details
        const existingVideo = await Video.findById(videoId);
        if (!existingVideo) {
            return res.status(404).json(
                new ApiResponse(404, `No video found with ID: ${videoId}.`)
            );
        }

        const thumbnailLocalpath = req.file?.path
        if(!thumbnailLocalpath){
            throw new CustomApiError(400,
                'No local Path to be found using the exsting thumbnail'
            )
        }
        const thumbnail = await uploadFile(thumbnailLocalpath)
        console.log(thumbnail)
        if(!thumbnail){
            throw new CustomApiError(
                400,
                'Something went wrong while uploading the thumbnail on cloudinary !'
            )
        }
        // Update the video details, keeping existing values if not provided
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title: title || existingVideo.title,
                    thumbnail: thumbnail.url || existingVideo.thumbnail,
                    description: description || existingVideo.description,
                },
            },
            { new: true, runValidators: true }
        );
        const updatedVideo = await Video.findById(video._id)
        console.log("Updated Video:- " , updateVideo)
        // Success response
        return res.status(200).json(
            new ApiResponse(200, 'Video details updated successfully!', updatedVideo)
        );
    } catch (error) {
        // Handle unexpected errors
        console.error('Error updating video:', error);
        throw new CustomApiError(500, 'An unexpected error occurred while updating the video.');
    }
});



const deleteVideo = asyncHandler (async(req,res)=>{
    const { videoId } = req.params
    
    const video = await Video.findByIdAndDelete(videoId)
    
    if(!video){
        throw new CustomApiError(
            400,
            `There is no such video with Id:${videoId}`
        )
    }
    
    return res.redirect(`/api/v1/auth/user/channel/${req.user.username}`)
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



const searchVideos = asyncHandler(async (req, res) => {
    try {
      const { q } = req.query; // Destructure the correct query parameter
      console.log("Query:", q);
  
      if (!q) {
        throw new CustomApiError(400, 'Search query is required.');
      }
  
      const searchRegex = new RegExp(q, 'i'); // 'i' for case-insensitive search
  
      const videos = await Video.find({
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ],
        isPublished: true,
      }).populate('owner')
        .select('-__v')
        .sort({ createdAt: -1 })
        .limit(20);
  
      if (videos.length === 0) {
        return res.status(200).render('SearchPage', {
            searchQuery:q,
            searchResults: [],
            user:req.user // Pass videos correctly
          });
      }



  
      return res.status(200).render('SearchPage', {
        searchQuery:q,
        searchResults: videos,
        user:req.user // Pass videos correctly
      });
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  });
  


module.exports =
{
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    toogglepublishStatus,
    searchVideos
    
}