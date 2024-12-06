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
    changeUserUsername,
    changeUserfullname
} = require('../Controllers/users.controllers')




const upload = require('../Middlerwares/multer.middleware')

const VerifyJwt = require('../Middlerwares/auth')

const UserRouter =express.Router()


UserRouter.route('/signup').get((req,res)=>{
    res.render('SignUp')
}).post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },{
            name:'coverImage',
            maxCount:1
        }]),
    registerUser)

UserRouter.route('/signin').get((req,res)=>{
    res.render('SignIn')
}).post(loginUser)

UserRouter.route('/edit-profile').get(VerifyJwt,(req,res)=>{
    res.render('EditProfile', {
        user:req.user
    })
})


//Secured Routes

UserRouter.route('/logout').get(VerifyJwt,logoutUser)

UserRouter.route('/refresh-token').post(VerifyJwt,refreshAccessToken)




UserRouter.route('/current-user').get(VerifyJwt,getCurrentUser)

//Update Section
UserRouter.route('/change-password').post(VerifyJwt,changeCurrentPassword)
UserRouter.route('/change-email').post(VerifyJwt,changeUserEmail)
UserRouter.route('/update-avatar').post(VerifyJwt,upload.single('avatar'),updateUserAvtar)
UserRouter.route('/change-username').post(VerifyJwt,changeUserUsername)
UserRouter.route('/change-fullname').post(VerifyJwt,changeUserfullname)
UserRouter.route('/update-coverImage').post(VerifyJwt,upload.single('coverImage'),updateUsercoverImage)

UserRouter.route('/channel/:username').get(VerifyJwt,getUserChannelProfile)


UserRouter.route('/watchHistory').get(VerifyJwt,getUserWatchHistory)




module.exports = UserRouter