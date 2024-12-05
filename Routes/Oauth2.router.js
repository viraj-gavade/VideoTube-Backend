/**
 * @fileoverview OAuth Authentication Router
 * Implements Google OAuth2.0 authentication flow with passport.js
 * Handles user authentication, session management, and JWT token generation
 */

require('dotenv').config();
const express = require('express');
const OauthRouter = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const USER = require('../Models/users.models');
const JWT = require('jsonwebtoken')

const options = {
  httpOnly:true,
  secure:true
}
/**
 * @description Configure Google OAuth Strategy
 * Uses environment variables for secure credential management
 * Handles the OAuth2.0 authentication flow with Google
 */


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {
      console.log(accessToken)
    // Proceed with profile
    return done(null, profile);
  })
);

/**
 * @description Passport Serialization
 * Determines which data of the user object should be stored in the session
 * @param {Object} user - User profile from Google
 */
passport.serializeUser((user, done) => {
  console.log('Serialize User:', user);
  done(null, user);
});

/**
 * @description Passport Deserialization
 * Retrieves user data from session
 * @param {Object} user - Serialized user object from session
 */
passport.deserializeUser((user, done) => {
  console.log('Deserialize User:', user);
  done(null, user);
});

/**
 * @route GET /auth/google
 * @description Initiates Google OAuth authentication flow
 * Requests user profile and email scopes
 */
OauthRouter.get('/auth/google', (req, res, next) => {
  console.log('Initiating Google OAuth flow');
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route GET /auth/google/callback
 * @description Handles the Google OAuth callback
 * - Creates new user if not exists
 * - Generates JWT tokens for authentication
 * - Sets cookies and redirects to home page
 */
OauthRouter.get('/auth/google/callback',async (req, res, next) => {
  console.log('Google OAuth callback triggered');
  next();
}, passport.authenticate('google', { failureRedirect: '/' }),
  async(req, res) => {
    console.log('Google OAuth Success - Redirecting to Profile');
    console.log('Logged In User Profile:', req.user);
    
    // Extract user information from Google profile
    const fullName = req.user.displayName;
    const Useremail = req.user._json.email;
    const ProfileImage = req.user._json.picture

    console.log(`Name: ${fullName}`);
    console.log(`Email: ${Useremail}`);

    // Check if user exists in database
    const Existing_User = await USER.findOne({email:Useremail})
    console.log(Existing_User)
    
    // If new user, create account and generate tokens
    if(!Existing_User){
      const user = await USER.create({
        username:fullName,
        password:"Auth2-Login",
        email:Useremail,
        fullname:fullName,
        avatar:ProfileImage,
    })
     console.log(user)
     const paylod = {
      _id:user._id,
  }

  // Generate JWT tokens for new user
  const accessToken = JWT.sign(paylod,process.env.ACCESS_TOKEN_SECRETE,{
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  })
  const refreshToken = JWT.sign(paylod,process.env.REFRESH_TOKEN_SECRETE,{
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
  })
   
     return res.cookie('accessToken', accessToken,options).cookie('refreshToken',refreshToken,options).redirect('/home');
    
    }
    
    // For existing users, generate new tokens
    const paylod = {
      _id:Existing_User._id,
  }

  const accessToken = JWT.sign(paylod,process.env.ACCESS_TOKEN_SECRETE,{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
})
const refreshToken = JWT.sign(paylod,process.env.REFRESH_TOKEN_SECRETE,{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
})
  
    return res.cookie('accessToken', accessToken,options).cookie('refreshToken',refreshToken,options).redirect('/home');
  }
);

/**
 * @route GET /signin
 * @description Debug endpoint for testing authentication flow
 */
OauthRouter.get('/signin', (req, res) => {
  res.send("Debug Statement");
});

/**
 * @route GET /profile
 * @description Protected route that requires authentication
 * Renders user profile if authenticated, redirects to home if not
 */
OauthRouter.get('/profile', async (req, res) => {
  if (req.isAuthenticated()) {
    console.log('User is authenticated, rendering profile');
    console.log('Authenticated User Profile:', req.user);
    res.render('home', {
      user: req.user,
    });
  } else {
    console.log('User is not authenticated, redirecting to home');
    res.redirect('/');
  }
});

// Export the router for use in main application
module.exports = OauthRouter;