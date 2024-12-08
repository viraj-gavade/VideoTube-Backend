const asyncHandler = require('../utils/asynchandler')
const User = require('../Models/users.models')
const Video = require('../Models/video.models')
const uploadFile = require('../utils/cloudinary')
const ApiResponse = require('../utils/apiResponse')
const CustomApiError = require('../utils/apiErrors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { getChannelAllvideos } =require('../Controllers/dashboard.controllers')
const generateAccessTokenAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
       const accessToken =  await user.createAccestoken()
       const refreshToken = await user.createRefreshtoken()

      user.refreshToken = refreshToken
      await  user.save({validateBeforeSave:false})

       return {accessToken,refreshToken}
    } catch (error) {
        console.log("Access token Error:-", error)
        throw new CustomApiError(500,'Something went wrong while generating the access and refresh token!')
    }
}   

const registerUser = asyncHandler(async(req,res)=>{

    const {username,email,fullname,password,confirm_password} = req.body
    if([username,email,fullname,password,confirm_password].some((field)=>
        field?.trim()===''
    )){
        throw new CustomApiError(400,'All fields must be filled!')
    }
  const exstinguser = await User.findOne({
        $or:[{username},{email}]
    })
    if(exstinguser){
        throw new CustomApiError(409,'User already exists')
    }

    const avatarLocalpath = req.files?.avatar[0]?.path
    const coverImageLocalpath = req.files?.coverImage[0]?.path
    if (avatarLocalpath===undefined) {
        throw new CustomApiError(404,'Avatar must be uploaded!')
    }

    // let coverImageLocalpath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    //     coverImageLocalpath = req.files?.coverImage[0]?.path
    // }

    const avatar = await uploadFile(avatarLocalpath)
    const coverImage = await uploadFile(coverImageLocalpath)
    if(!avatar){
        throw new CustomApiError(400,'Avatar file is required')
    }


    if(password!==confirm_password){
        throw new CustomApiError(400,'Passwords do not match')

    }

    const user = await User.create({
        avatar:avatar.url,
        coverImage:coverImage?.url || '',
        fullname,
        email,
        username:username.toLowerCase(),
        password:confirm_password
    })

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )
    if(!createdUser){
        throw new CustomApiError(500,'Server was unable to create the user please try agin later!')
    }

    return res.redirect('/api/v1/auth/user/signup')

   
  
}) 

const loginUser = asyncHandler(async (req,res)=>{
  const {email,password,username} = req.body 
  console.log('Body:-',req.body)
  if(!email || !password){
    throw new CustomApiError(400,'Please provide all the required fields')
  }
  const user = await User.findOne({
    $or:[{email},{username}]
  })
  if(!user){
    throw new CustomApiError(404,'User not found!')
  }
    const ValidPassword = await user.isPasswordCorrect(password)
    console.log("Password:-",ValidPassword)
    if(!ValidPassword){
        throw new CustomApiError(401,'Invalid user credentials!')
    }
    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')


    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie('accessToken',accessToken,options).cookie('refreshToken',refreshToken,options).redirect(
        '/home'
    )
    
}) 


const logoutUser = asyncHandler(async (req,res)=>{
const options = {
    httpOnly:true,
    secure:true}

return res.status(200).clearCookie('accessToken',options).clearCookie('refreshToken',options).json(
    new ApiResponse(200,'User Logged Out Successfully!')
)
}) 


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new CustomApiError(401,'Unauthorized Request')
    }

  try {
     const decodedtoken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRETE)
  
     const user = await User.findById(decodedtoken?._id)
     if(!user){
      throw new CustomApiError(401,'Invalid refresh token')
     }
  
     if(incomingRefreshToken !== user?.refreshToken){
      throw new CustomApiError(401,'Refresh token is invalid or used!')
     }
  
     const options ={
      httpOnly:true,
      secure:true
     }
  
    const {NewrefreshToken,accessToken} = await  generateAccessTokenAndRefreshToken(user?._id)
  
     return res.status(200).cookie('accessToken',accessToken).cookie('accessToken',NewrefreshToken).json(
      new ApiResponse(
          200,
          'Accces Token Refreshed!',
          {accessToken,refreshToken:NewrefreshToken}
      )
     )
  
  } catch (error) {
 throw new CustomApiError(401,error?.message || 'Inavlid refresh Token! ')
  }
})  


const changeCurrentPassword = asyncHandler(async(req,res)=>{

    try {
        const {oldPassword,newPassword,confirm_password} = req.body
       const user = await User.findById(req.user._id)
       const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if (!isPasswordCorrect) {
            throw new CustomApiError(401,'The old password you have entered is not correct!')
        }
        if (newPassword !== confirm_password) {
            throw new CustomApiError(401,'The new password and confirm password you have entered are not the same!')
        }
        user.password = newPassword
       await user.save({validateBeforeSave:true})
       return res.redirect('/api/v1/auth/user/edit-profile')

    } catch (error) {
        console.log(error)
        throw new CustomApiError(500,'Something went wrong while changing the password please try again later!')
    }
}) 

const getCurrentUser = asyncHandler(async(req,res)=>{
    res.status(200).json(
        new ApiResponse(200,'Current Used feteched successfully!',req.user)
        )
}) //Checked and bugs fixed

const updateUserAvtar = asyncHandler(async(req,res)=>{
    const avatarLocalpath = req.file?.path
    if (!avatarLocalpath) {
        throw new CustomApiError(400,'Avatar file is missing ')
    }
    const avatar = await uploadFile(avatarLocalpath)
    if(!avatar.url){
        throw new CustomApiError(400,'Error while uploading on cloudinary!')
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar?.url
        }
    },{new:true}).select('-password')
    return res.redirect('/api/v1/auth/user/edit-profile')

}) //Checked and bugs fixed


const updateUsercoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalpath = req.file?.path
    if (!coverImageLocalpath) {
        throw new CustomApiError(400,'CoverImage file is missing ')
    }
   const coverImage =  await uploadFile(coverImageLocalpath)
    if(!coverImage.url){
        throw new CustomApiError(400,'Error while uploading on cloudinary!')
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:coverImage?.url
        }
    },{new:true}).select('-password')
    return res.redirect('/api/v1/auth/user/edit-profile')


})//Checked and bugs fixed

const getUserChannelProfile = asyncHandler(async(req,res,next)=>{
    const {username} = req.params
    console.log(req.params)
    
    if(!username?.trim()){
        throw new CustomApiError(400,'User not found !')
    }

    const channel = await User.aggregate([
       {
            $match:{
              username:username?.trim().toLowerCase()
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
    console.log(channel[0].username)
        const user = await User.find({username:channel[0].username})
        const UserId = user[0]._id
    if(!channel?.length){
        throw new CustomApiError(400,'Channel not found!')
    }

    const Videos = await Video.find({owner: UserId})
   return res.render('Profile',{
    channel:channel[0],
    videos:Videos
   })

})

const getUserWatchHistory = asyncHandler(async (req, res) => {
    // Fetch user by ID
    const userHistory = await User.findById(req.user._id)
    .populate({
        path: 'watchHistory', // Populate the watchHistory field
        populate: {
            path: 'owner', // Nested population for the owner field inside watchHistory
            select: 'username email fullname avatar' // Optional: Specify fields to retrieve from the owner document
        }
    });

console.log(userHistory.watchHistory);
    
    // Check if user exists
    if (!userHistory) {
      throw new CustomApiError(404, 'User not found!');
    }
  
    console.log("User Watch History:", userHistory.watchHistory);
  
    // Render the history page with watchHistory data
    return res.render('History', {
      history: userHistory.watchHistory,
    });
  });
  
const changeUserEmail = asyncHandler(async(req,res)=>{

    const {email} = req.body
    if(!email){
        throw new CustomApiError(
            402,
            'Please provide the email inorder to change the email'
        )
    }
    const existinguser = await User.findOne({email})
    if(existinguser){
        throw new CustomApiError(
            401,
            'User already exists with this email id'
        )
    }
    const user = await User.findById(req.user?._id)
    if(!user){
        throw new (
            401,
            'Unable to get the user id maybe an unauthorized request!'
        )
    }
    user.email=email
    await user.save({validateBeforeSave:false})
    return res.redirect('/api/v1/auth/user/edit-profile')


})
const changeUserUsername = asyncHandler(async(req,res)=>{
    const UserId = req.user?._id
    if(!UserId){
        throw new CustomApiError(
            401,
            ' user id not found! maybe an unauthorized request'
        )
    }
    const {username,confirm_username}=req.body
    if(!username){
        throw new CustomApiError(
            402,
            'Please provide the username to change the username!'
        )
    }

    const existinguser = await User.findOne({username})  
    if(existinguser){
        throw new CustomApiError(
            402,
            'username is already taken please try another username'
        )
    }  
    const user = await User.findById(UserId)
    if(!user){
        throw new CustomApiError(
            402,
            'Unable to find the user please check the user id again!'
        )
    }
    if(username!==confirm_username){
        return res.status(403).json(
            new customApiResponse(
                402,
                'Username does not match with confirm username'
            )
        )
    }
    user.username=username
    await user.save({validateBeforeSave:false})
    return res.redirect('/api/v1/auth/user/edit-profile')

})

const changeUserfullname = asyncHandler(async(req,res)=>{
    const UserId = req.user?._id
    if(!UserId){
        throw new CustomApiError(
            401,
            ' user id not found! maybe an unauthorized request'
        )
    }
    const {fullname,confirm_fullname}=req.body
    if(!fullname){
        throw new CustomApiError(
            402,
            'Please provide the fullname to change the fullname!'
        )
    }

    const existinguser = await User.findOne({fullname})  
    if(existinguser){
        throw new CustomApiError(
            402,
            'username is already taken please try another username'
        )
    }  
    const user = await User.findById(UserId)
    if(!user){
        throw new CustomApiError(
            402,
            'Unable to find the user please check the user id again!'
        )
    }
    if(fullname!==confirm_fullname){
        return res.status(403).json(
            new customApiResponse(
                402,
                'Username does not match with confirm username'
            )
        )
    }
    user.fullname=fullname
    await user.save({validateBeforeSave:false})
    return res.redirect('/api/v1/auth/user/edit-profile')

})

const ClearWatchHistory = asyncHandler(async (req, res) => {
    // Clear the watch history by setting it to an empty array
    const userHistory = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { watchHistory: [] } }, // Set watchHistory to an empty array
      { new: true } // Return the updated document
    );
  
    // Check if user exists
    if (!userHistory) {
      throw new CustomApiError(404, 'User not found!');
    }
  
    console.log("User Watch History:", userHistory.watchHistory);
  
    // Render the history page with cleared watchHistory data
    return res.render('History', {
      history: userHistory.watchHistory, // This will now be an empty array
    });
  });
  

module.exports =
 {
loginUser,
registerUser,
logoutUser,
refreshAccessToken,
changeCurrentPassword,
getCurrentUser,
updateUserAvtar,
updateUsercoverImage,
getUserChannelProfile,
getUserWatchHistory,
changeUserEmail,
changeUserUsername,
changeUserfullname,
ClearWatchHistory
}