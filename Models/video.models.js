const mongoose = require('mongoose')
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')
const VideoSchema = mongoose.Schema({
    videoFile:{
        type:String, //Cloud
        required:true,

    },
    thumbnail:{
        type:String, //Cloud
        required:true,

    },
    title:{
        type:String, //Cloud
        required:true,

    },
    description:{
        type:String, //Cloud
        required:true,
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        dafault:true
    },
    owner:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'User'
    }
},{timestamps:true}
)

VideoSchema.plugin(mongooseAggregatePaginate)
module.exports = mongoose.model('Video',VideoSchema)