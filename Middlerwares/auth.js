const CustomApiError = require("../utils/apiErrors")
const jwt = require('jsonwebtoken')
const User = require('../Models/users.models')
const asyncHandler = require('../utils/asynchandler')
const VerifyJwt = asyncHandler (async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','')

        if(!token){
            throw new CustomApiError(401,'Unauthorized Request')
        }

        const decodedtoken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRETE)

        const user = User.findById(decodedtoken._id).select('-password -refreshToken')

        if(!user){
            throw new CustomApiError(401,'Invalid Access Token!')
        }
        req.user = user
        next()
        
    } catch (error) {
        console.log(error)
        throw new CustomApiError(401,error?.messsage || 'Invalid access')
    }
})


module.exports = VerifyJwt