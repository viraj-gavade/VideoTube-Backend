require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const connectdb= require('./DataBase/connect')
const UserRouter = require('./Routes/users.routers')
const app = express()

app.use(express.json())
// app.use(express.urlencoded)
app.use(express.static('./public'))
app.use(cookieParser())


//Main Routes

app.use('/api/v1/auth/user',UserRouter)
 
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