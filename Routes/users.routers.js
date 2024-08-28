const express = require('express')
const {
    registerUser, 
    loginUser, 
    logoutUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvtar, 
    getUserChannelProfile, 
    getUserWatchHistory,
    updateUserdetails,
    updateUsercoverImage,
    changeUserEmail,
    changeUserUsername
} = require('../Controllers/users.controllers')




const upload = require('../Middlerwares/multer.middleware')

const VerifyJwt = require('../Middlerwares/auth')

const UserRouter =express.Router()


UserRouter.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },{
            name:'coverImage',
            maxCount:1
        }]),
    registerUser)

UserRouter.route('/login').post(loginUser)

//Secured Routes

UserRouter.route('/logout').post(VerifyJwt,logoutUser)

UserRouter.route('/refresh-token').post(VerifyJwt,refreshAccessToken)

UserRouter.route('/change-password').post(VerifyJwt,changeCurrentPassword)

UserRouter.route('/change-email').post(VerifyJwt,changeUserEmail)

UserRouter.route('/change-username').post(VerifyJwt,changeUserUsername)

UserRouter.route('/current-user').get(VerifyJwt,getCurrentUser)

UserRouter.route('/update-account-details').patch(VerifyJwt,updateUserdetails)

UserRouter.route('/update-avatar').patch(VerifyJwt,upload.single('avatar'),updateUserAvtar)

UserRouter.route('/update-coverImage').patch(VerifyJwt,upload.single('coverImage'),updateUsercoverImage)

UserRouter.route('/channel/:username').get(VerifyJwt,getUserChannelProfile)
UserRouter.route('/watchHistory').get(VerifyJwt,getUserWatchHistory)



module.exports = UserRouter