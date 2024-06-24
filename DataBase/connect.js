const mongoose = require('mongoose')
require('../constant')
const connectdb = async ()=>{
    try {
        const connect = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
        console.log(`\n Connected to Database!!, Connection Host:${connect.connection.host} `);
        
    } catch (error) {
        console.log(`Error Occured`,error)
        process.exit(1)
       
    }
   
} 

module.exports = connectdb