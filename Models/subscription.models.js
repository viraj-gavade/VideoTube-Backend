const mongoose = require('mongoose')

const subscriptionScheam = new mongoose.Schema({
subscriber:{
    type:mongoose.Schema.Types.ObjectId, //One who is subscribing
    ref:'User'
},
channel:{
    type:mongoose.Schema.Types.ObjectId, //One who is being subscribed
    ref:'User'
}

},{timestamps:true})



module.exports = mongoose.model('Subscription',subscriptionScheam)