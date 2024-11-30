require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectdb = require('./DataBase/connect');
const UserRouter = require('./Routes/users.routers');
const BodyParser = require('body-parser');
const path = require('path');
const app = express();

// All router Imports
const VideoRouter = require('./Routes/videos.routers');
const TweetRouter = require('./Routes/tweets.routers');
const CommentRouter = require('./Routes/comments.routers');
const healthCheck = require('./Controllers/healthcheck.controllers');
const subscriptionRouter = require('./Routes/subscritption.routers')
const LikeRouter = require('./Routes/like.routers');
const PlaylistRouter = require('./Routes/playlist.routers');
const DashboardRouter = require('./Routes/dashboard.router');

// All the important settings
app.use(express.json());
// Uncomment to handle form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(cookieParser());

// // Middleware setups
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));


// Main Routes
app.get("/", (req, res) => {
    res.render('UploadVideo')
});

// Register routers
app.use('/api/v1/auth/user', UserRouter);
app.use('/api/v1/auth/', VideoRouter);
app.use('/api/v1/auth/', TweetRouter);
app.use('/api/v1/auth/', CommentRouter);
app.use('/api/v1/healthcheck', healthCheck);
app.use('/api/v1/auth/', subscriptionRouter);
app.use('/api/v1/auth/', LikeRouter);
app.use('/api/v1/auth/', PlaylistRouter);
app.use('/api/v1/auth/dashboard', DashboardRouter);

// Connection to the database
const port = process.env.PORT || 5000;

const ConnectDB = async () => {
    try {
        await connectdb();
        app.listen(port, () => {
            console.log('Server is listening on:', port);
        });
    } catch (error) {
        console.error('Something Went Wrong!!', error);
        process.exit(1);
    }
};

ConnectDB();
