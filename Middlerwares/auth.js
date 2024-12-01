const CustomApiError = require("../utils/apiErrors")
const jwt = require('jsonwebtoken')
const User = require('../Models/users.models')
const asyncHandler = require('../utils/asynchandler')
const VerifyJwt = asyncHandler (async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','')

        if(!token){
            return res.redirect('/api/v1/auth/user/signin')
        }

        const decodedtoken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRETE)

        const user = await User.findById(decodedtoken._id).select('-password -refreshToken')

        if(!user){
            return res.redirect('/api/v1/auth/user/signin')
        }
        req.user = user
        next()
        
    } catch (error) {
        console.log(error)
        throw new CustomApiError(401,error?.messsage || 'Invalid access')
    }
})


module.exports = VerifyJwt