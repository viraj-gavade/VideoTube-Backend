require('dotenv').config()
const express = require('express')
const connectdb= require('./DataBase/connect')
const app = express()


app.get('/test',(req,res)=>{
    res.send('This is a test route')
})
 
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