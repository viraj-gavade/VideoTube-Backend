const asyncHandler = require('../utils/asynchandler')
const User = require('../Models/users.models')
const uploadFile = require('../utils/cloudinary')
const ApiResponse = require('../utils/apiResponse')
const CustomApiError = require('../utils/apiErrors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
       const accessToken =  await user.createAccestoken()
       const refreshToken = await user.createRefreshtoken()

      user.refreshToken = refreshToken
      await  user.save({validateBeforeSave:false})

       return {accessToken,refreshToken}
    } catch (error) {
        throw new CustomApiError(500,'Something went wrong while generating the access and refresh token!')
    }
}

const registerUser = asyncHandler(async(req,res)=>{

    const {username,email,fullname,password} = req.body
    if([username,email,fullname,password].some((field)=>
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
    // const coverImageLocalpath = req.files?.coverImage[0]?.path
    if (!avatarLocalpath) {
        throw new CustomApiError(404,'Avtar must be uploaded!')
    }

    let coverImageLocalpath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalpath = req.files.coverImage[0].path
    }

    const avatar = await uploadFile(avatarLocalpath)
    const coverImage = await uploadFile(coverImageLocalpath)
    if(!avatar){
        throw new CustomApiError(400,'Avtar file is required')
    }

    const user = await User.create({
        avatar:avatar.url,
        coverImage:coverImage?.url || '',
        fullname,
        email,
        username:username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )
    if(!createdUser){
        throw new CustomApiError(500,'Server was unable to create the user please try agin later!')
    }

    return res.status(201).json(
        new ApiResponse(200,'User Created Successfully!',createdUser)
    )

   
  
})

const loginUser = asyncHandler(async (req,res)=>{
  const {email,password,username} = req.body 
  if(!(email || username)){
    throw new CustomApiError(400,'Please provide all the required fields')
  }
  const user = await User.findOne({
    $or:[{email},{username}]
  })
  if(!user){
    throw new CustomApiError(404,'User not found!')
  }
    const ValidPassword = user.isPasswordCorrect(password)
    if(!ValidPassword){
        throw new CustomApiError(401,'Invalid user credentials!')
    }
    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')


    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie('AccessToken',accessToken,options).cookie('RefreshToken',refreshToken.options).json(
        new ApiResponse(200,
            'User Logged In Successfully!',
            {
                user:loggedInUser,accessToken,refreshToken
            }
        )
    )
    
})

const logoutUser = asyncHandler(async (req,res)=>{

await User.findByIdAndUpdate(req.user._id,{
    $set:{
        refreshToken:undefined
    }
},{
    new:true
})
const options = {
    httpOnly:true,
    secure:true}

res.status(200).clearCookie('AccessToken',options).clearCookie('RefreshToken',options).json(
    new ApiResponse(200,'User Logged Out Successfully!')
)
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new CustomApiError(401,'Unauthorized Request')
    }

  try {
     const decodedtoken =  await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRETE)
  
     const user = User.findById(decodedtoken?.id)
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
  
     return res.status(200).cookie('AccessToken',accessToken).cookie('RefreshToken',NewrefreshToken).json(
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
        const {oldPassword,newPassword,confirmNewPassword} = req.body
        if (newPassword !== confirmNewPassword ) {
            throw new CustomApiError(401,'New password does not match with the confirmed password!')
        }
        const user = await User.findById(req?._id)
        user.isPasswordCorrect(oldPassword)
        if (!oldPassword) {
            throw new CustomApiError(401,'The old password you have entered is not correct!')
        }
        user.password = newPassword
       await user.save({validateBeforeSave:true})
        return res.status(200).json(
            new ApiResponse(200,'Password changed successfully!',{})
        )
    } catch (error) {
        throw new CustomApiError(500,'Something went wrong while changing the password please try again later!')
    }
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    res.status(200).json(
        new ApiResponse(200,'Current Used feteched successfully!',{})
        )
})

const updateUserdetails = asyncHandler(async (req,res)=>{
    const {email,fullname} = req.body
    if(!email || !fullname){
        throw new CustomApiError(404,'All fields are required!')
    }
    const user =User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                email:email,
                fullname:fullname
            }
        },
        {
            new:true
        }
    )
    return res.status(200).json(
        new ApiResponse(200,'User details updated successfully!',{})
    )
})

const updateUserAvtar = asyncHandler(async(req,res)=>{
    const avatarLocalpath = req.file?.path
    if (!avatarLocalpath) {
        throw new CustomApiError(400,'Avatar file is missing ')
    }
    await uploadFile(avatarLocalpath)
    if(!avatar.url){
        throw new CustomApiError(400,'Error while uploading on cloudinary!')
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar?.url
        }
    },{new:true}).select('-password')
    return res.status(200).json(
        new ApiResponse(200,'Cover image updated sucessfully!'))

})


const updateUsercoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalpath = req.file?.path
    if (!coverImageLocalpath) {
        throw new CustomApiError(400,'CoverImage file is missing ')
    }
    await uploadFile(coverImageLocalpath)
    if(!coverImage.url){
        throw new CustomApiError(400,'Error while uploading on cloudinary!')
    }

    const user = User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:coverImage?.url
        }
    },{new:true}).select('-password')
    return res.status(200).json(
        new ApiResponse(200,'Cover image updated sucessfully!')
    )

})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw CustomApiError(400,'User not found !')
    }

    const channel = User.aggregate([
       {
            $match:{
              username:username?.toLowerCase()  
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
                    cond:{
                        if:{$in:[req.user?.url,'$subscriber.subscriber']},
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
    if(!channel?.length){
        throw new CustomApiError(400,'Channel not found!')
    }
    return res.status(200).json(
        new ApiResponse(200,'Channel fetched successfully!',channel[0])
    )

})

const getUserWatchHistory = asyncHandler(async(req,res)=>{
    const user = User.aggregate([ 
        {
            $match:{
                _id:m=new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:'watchHistory',
                foreignField:'_id',
                as:"WatchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:'owner',
                            foreignField:'_id',
                            as:'owner',
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    } ,
                    {
                        $addFields:{
                            owner:{
                                $first:"owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    if(!user){
        throw new CustomApiError(
            200,'User not found!'
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            'Watch history fetched',
            owner[0].watchHistory
        )
    )
})

module.exports =
 {
loginUser,
registerUser,
logoutUser,
refreshAccessToken,
changeCurrentPassword,
getCurrentUser,
updateUserdetails,
updateUserAvtar,
updateUsercoverImage,
getUserChannelProfile,
getUserWatchHistory
}