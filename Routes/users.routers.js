const express = require('express')
const registerUser = require('../Controllers/users.controllers')
const upload = require('../Middlerwares/multer.middleware')
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


module.exports = UserRouter