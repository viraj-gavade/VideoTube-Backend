const asyncHandler = require('../utils/asynchandler')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const Playlist = require('../Models/playlist.models')
const { default: mongoose, isValidObjectId } = require('mongoose')



const createPlaylist = asyncHandler(async(req,res)=>{
    const { name , description } = req.body
    if(!name || !description ){
        throw new CustomApiError(
            400,
            'Please provide the name and description'
        )
    }
   try {
     const playlist = await Playlist.create({
         name:name,
         description:description,
         owner:req.user?._id
     })
 
     const findPlaylist = await Playlist.findById(playlist._id)
     if(!isValidObjectId(findPlaylist)){
         throw new CustomApiError(
             500,
             'Something went wrong while creating the playlist please try agian later'
         )
     }
     return res.status(200).json(
         new ApiResponse(
             200,
             'Playlist created successfully!',
             playlist
         )
     )
   } catch (error) {
    console.log(error)
    throw new CustomApiError(
        error.statusCode,
        error.message
    )
   }

})


const getUserPlaylist = asyncHandler(async(req,res)=>{
    const userId = req.params
    if(!isValidObjectId(userId)){
        throw new CustomApiError(
            400,
            'Invalid userId provided !'
        )
    }
 try {
      const playlist = await Playlist.findOne({owner:userId})
      if(!playlist){
       throw new CustomApiError(
           200,
           'No playlist found!'
       )
      }
      return res.status(200).json(
       new ApiResponse(
           200,
           `User playlist fetched successfully!`,
           playlist
       )
      )
 } catch (error) {
    console.log(error)
    throw new CustomApiError(
        error.statusCode,
        error.message
    )
 }
})


const addVideotoPlaylist =  asyncHandler(async (req,res)=>{
    const { playlistId , videoId } = req.params
    if(!isValidObjectId(playlistId || !isValidObjectId(videoId))){
        throw new CustomApiError(
            400,
            `Invalid playlistId or VideoId is being provided!`
        )
    }
    try {
          const playlist =  await Playlist.findByIdAndUpdate(playlistId,{
            $push:{videos:videoId}
          },{
            new:true
          })
          if(!playlist){
            throw new CustomApiError(
                500,
                'Something went wrong ! Unable to find and update the playlist!'
            )
          }
            return res.status(200).json(
                new ApiResponse(
                    200,
                    'Video added to the playlist successfully!',
                    playlist
                )
            )
    } catch (error) {
        console.log(error)
        throw new CustomApiError(
            error.statusCode,
            error.message
        )
    }
})


const removeVideofromPlaylist = asyncHandler(async(req,res)=>{
    const { playlistId , videoId } = req.params
    if(!isValidObjectId(playlistId || !isValidObjectId(videoId))){
        throw new CustomApiError(
            400,
            `Invalid playlistId or VideoId is being provided!`
        )
    }
   try {
    const playlist = await  Playlist.findByIdAndUpdate(playlistId,{
         $push:{videos:videoId}
     },{
         new:true
     })
     if(!playlist){
         throw new CustomApiError(
             500,
             'Something went wrong ! Unable to find and update the playlist!'
         )
       }
         return res.status(200).json(
             new ApiResponse(
                 200,
                 'Video removed from the playlist successfully!',
                 playlist
             )
         )
   } catch (error) {
    console.log(error)
   throw new CustomApiError(
    error.statusCode,
    error.message
   )
   }
})