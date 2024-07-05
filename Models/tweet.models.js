const mongoose = require('mongoose')

const tweetSchema = new  mongoose.Schema({
    owner:{
        type:String,
        ref:"User"
    },
    content:{
        type:String,
        required:[true,'Contnet cannot be empty!']
    }
},{timestamps:true})
    


module.exports = mongoose.model('Tweet',tweetSchema)