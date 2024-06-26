const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UserSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        index:true,
        trim:true,
    },
   avatar:{
    type:String,
    required:true
   },
   coverImage:{
    type:String,

   },
   watchHistory:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video'
    }
   ],
   password:{
    type:String,
    required:[true,'Password is required!']
   },
   refreshToken:{
    type:String
   }
},{timestamps:true})



UserSchema.pre('save',async function (next){
    if(!this.isModified('password')){
        return next()
    }
    const salt = bcryptjs.genSalt(10)
    this.password = bcryptjs.hash(this.password,salt)
    next()
})
UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcryptjs.compare(password,this.password)
}
UserSchema.methods.createAccestoken = async function (){
  const accessToken = await  jwt.sign({
        _id:this._id,
        username:this.username,
        fullname:this.fullname,
        email:this.email

    },process.env.ACCESS_TOKEN_SECRETE,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
return accessToken
}
UserSchema.methods.createRefreshtoken = async function (){
const refreshToken = jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRETE,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
return refreshToken
}
module.exports = mongoose.model('User',UserSchema)