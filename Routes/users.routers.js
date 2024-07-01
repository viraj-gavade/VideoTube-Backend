const express = require('express')
const {registerUser, loginUser, logoutUser} = require('../Controllers/users.controllers')
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

module.exports = UserRouter