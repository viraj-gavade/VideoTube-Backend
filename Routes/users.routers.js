const express = require('express');
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
    changeUserfullname,
    ClearWatchHistory,
    RemoveVideoFromHistory,
    getUserSubscriptions,
    getUserSubscribers
} = require('../Controllers/users.controllers'); // Import user-related controller functions

const upload = require('../Middlerwares/multer.middleware'); // Import middleware for file uploads

const VerifyJwt = require('../Middlerwares/auth'); // Import JWT verification middleware

const UserRouter = express.Router(); // Initialize an Express Router

// Signup route: renders the signup page and handles user registration
UserRouter.route('/signup')
    .get((req, res) => {
        res.render('SignUp');
    })
    .post(
        upload.fields([
            { name: 'avatar', maxCount: 1 },
            { name: 'coverImage', maxCount: 1 }
        ]), 
        registerUser
    );

// Signin route: renders the signin page and handles user login
UserRouter.route('/signin')
    .get((req, res) => {
        res.render('SignIn');
    })
    .post(loginUser);

// Edit profile route: renders the edit profile page for logged-in users
UserRouter.route('/edit-profile')
    .get(VerifyJwt, (req, res) => {
        res.render('EditProfile', {
            user: req.user
        });
    });

// Secured Routes (requires JWT authentication)

// Logout route: logs the user out of the application
UserRouter.route('/logout').get(VerifyJwt, logoutUser);

// Refresh access token route: refreshes the access token using the refresh token
UserRouter.route('/refresh-token').post(VerifyJwt, refreshAccessToken);

// Get current user route: retrieves the authenticated user's details
UserRouter.route('/current-user').get(VerifyJwt, getCurrentUser);

// Update section (requires JWT authentication)

UserRouter.route('/change-password').post(VerifyJwt, changeCurrentPassword);
UserRouter.route('/change-email').post(VerifyJwt, changeUserEmail);
UserRouter.route('/update-avatar').post(VerifyJwt, upload.single('avatar'), updateUserAvtar);
UserRouter.route('/change-username').post(VerifyJwt, changeUserUsername);
UserRouter.route('/change-fullname').post(VerifyJwt, changeUserfullname);
UserRouter.route('/update-coverImage').post(VerifyJwt, upload.single('coverImage'), updateUsercoverImage);

// User channel profile route: retrieves the user's channel profile by username
UserRouter.route('/channel/:username').get(VerifyJwt, getUserChannelProfile);

// Watch history routes (requires JWT authentication)
UserRouter.route('/watchHistory').get(VerifyJwt, getUserWatchHistory);
UserRouter.route('/ClearwatchHistory').get(VerifyJwt, ClearWatchHistory);
UserRouter.route('/remove-video/:videoId').get(VerifyJwt, RemoveVideoFromHistory);

// User subscriptions and subscribers routes (requires JWT authentication)
UserRouter.route('/subscriptions').get(VerifyJwt, getUserSubscriptions);
UserRouter.route('/subscribers').get(VerifyJwt, getUserSubscribers);

module.exports = UserRouter; // Export the router for use in the main app
