const {v2} = require('cloudinary')
const fs = require('fs')
v2.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRETE_KEY
});


const uploadFile = async(Filepath)=>{
    try {
        if(!Filepath){
            console.log('File path mot found')
            return null
        }
        const response = await v2.uploader.upload(Filepath,{
            resource_type:'auto'
        })
        console.log(`File uploaded to cloudinary successfully!`,response.url)
        return response
    } catch (error) {
        fs.unlinkSync(Filepath) //remove the locally saved files
        return null

    }
}

module.exports = uploadFile