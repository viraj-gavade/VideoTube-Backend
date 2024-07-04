const mongoose = require('mongoose')

const likeSchema = new mongoose.Schema({
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"

    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video'
    },
    likedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet"
    }
},{
    timestamps:true
})


module.exports = mongoose.model('Like',likeSchema)