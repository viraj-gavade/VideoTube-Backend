const asyncHandler = require('../utils/asynchandler')
const apiErrors = require('../utils/apiErrors')
const User = require('../Models/users.models')
const uploadFile = require('../utils/cloudinary')
const ApiResponse = require('../utils/apiResponse')
const registerUser = asyncHandler(async(req,res)=>{

    const {username,email,fullname,password} = req.body
    if([username,email,fullname,password].some((field)=>
        field?.trim()===''
    )){
        throw new apiErrors(400,'All fields must be filled!')
    }
  const exstinguser = User.findOne({
        $or:[{username},{email}]
    })
    if(exstinguser){
        throw new apiErrors(409,'User already exists')
    }

    const avatarLocalpath = req.files?.avtar[0]?.path
    const coverImageLocalpath = req.files?.coverImage[0]?.path
    if (!avatarLocalpath) {
        throw new apiErrors(404,'Avtar must be uploaded!')
    }

    const avtar = await uploadFile(avatarLocalpath)
    const coverImage = await uploadFile(coverImageLocalpath)
    if(!avtar){
        throw new apiErrors(400,'Avtar file is required')
    }

    const user = await User.create({
        avtar:avtar.url,
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
        throw new apiErrors(500,'Server was unable to create the user please try agin later!')
    }

    return res.status(201).json(
        new ApiResponse(200,'User Created Successfully!',createdUser)
    )
  
})


module.exports = registerUser