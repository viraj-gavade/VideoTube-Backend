const asyncHandler = require('../utils/asynchandler')
const Tweet = require('../Models/tweet.models')
const uploadFile = require('../utils/cloudinary')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const creatTweet = asyncHandler(async(req,res)=>{

try {
        const { content } = req.body
        const tweet = await Tweet.create({
            owner:req.user,
            content:content
        })
      
        if(!tweet){
            throw new  CustomApiError(
                500,
                'Something went wrong while creating the tweet'
            )
        }
        return res.status(200).json(
            new ApiResponse(
                200,
                'Tweet created successfully!',
                tweet
            )
        )
} catch (error) {
    throw  new CustomApiError(
        error.statuCode,
        error.message
    )
}
    
})

const getUserTweets = asyncHandler(async(req,res)=>{
  try {
      
     const tweet =  await Tweet.find(req.user_id)
      if(!tweet){
          throw new  CustomApiError(
              400,
              'Something went wrong unable to find the tweets'
          )
      }
     res.status(200).json(
      new ApiResponse(
          200,
          'All tweets fetched successfully!',
          tweet
      )
     )
  } catch (error) {
    throw new CustomApiError(
        error.statuCode,
        error.message
    )
  }
})

const UpdateTweet = asyncHandler(async(req,res)=>{
 try {
       const {tweetId} = req.params
       const { content } = req.body
       const tweet = await Tweet.findByIdAndUpdate(tweetId,{
           content:content
       },{new:true})
       if(!tweet){
           throw new  CustomApiError(
               400,
                   `NO tweet found with Id:${tweetId}`
           )
       }
       res.status(200).json(
           new ApiResponse(
               200,
               'Tweet updated successfully!',
               tweet
           )
       )
 } catch (error) {
    throw new CustomApiError(
        
        error.statuCode,
        error.message
    )
 }
})

const deleteTweet = asyncHandler(async(req,res)=>{
    try {
        const {tweetId} = req.params
        const tweet = await Tweet.findByIdAndDelete(tweetId,)
        if(!tweet){
            throw new  CustomApiError(
                400,
                    `NO tweet found with Id:${tweetId}`
            )
        }
        res.status(200).json(
            new ApiResponse(
                200,
                'Tweet Deleted successfully!'
            )
        )
  } catch (error) {
     throw new CustomApiError(
         error.statuCode,
         error.message
     )
  }
})
module.exports={
    creatTweet,
    getUserTweets,
    UpdateTweet,
    deleteTweet
    
}