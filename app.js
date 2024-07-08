require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const connectdb= require('./DataBase/connect')
const UserRouter = require('./Routes/users.routers')
const app = express()
const VideoRouter = require('./Routes/videos.routers')
const TweetRouter = require('./Routes/tweets.routers')
const CommentRouter = require('./Routes/comments.routers')
const healthCheck = require('./Controllers/healthcheck.controllers')
const subscriptionRouter = require('./Routes/subscritption.routers')
app.use(express.json())
// app.use(express.urlencoded)
app.use(express.static('./public'))
app.use(cookieParser())


//Main Routes

app.use('/api/v1/auth/user',UserRouter)
app.use('/api/v1/auth/',VideoRouter)
app.use('/api/v1/auth/',TweetRouter)
app.use('/api/v1/auth/',CommentRouter)
app.use('/api/v1/healthcheck',healthCheck)
app.use('/api/v1/auth/',subscriptionRouter)
 
const port = process.env.PORT

const ConnectDB = async ()=>{
    try {
        await connectdb().then(()=>{
            app.listen(port,()=>{
                console.log('Server is listinig on:',port);
            })
          }
          ) 
    } catch (error) {
        console.log('Something Went Wrong!!',error)
        process.exit(1)
    }
  
}


ConnectDB()