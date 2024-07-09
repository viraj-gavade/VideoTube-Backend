const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name must be provided!']
    },
    description:{
        type:String,
        required:[true,'Name must be provided!']
    },
    videos:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video'
    }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports = mongoose.model('Playlist',playlistSchema)