const { v2 } = require('cloudinary');
const fs = require('fs');

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRETE_KEY
});

const uploadFile = async (Filepath) => {
  try {
    if (!Filepath) {
      return null;
    }

    const response = await v2.uploader.upload(Filepath, {
      resource_type: 'auto',
    });

    // Check if file exists before trying to unlink it
    if (fs.existsSync(Filepath)) {
      fs.unlinkSync(Filepath);
    }

    return response;
  } catch (error) {
    // Check if file exists before trying to unlink it in case of an error
    if (fs.existsSync(Filepath)) {
      fs.unlinkSync(Filepath);
    }

    console.error('Error uploading file:', error);
    return null;
  }
};

module.exports = uploadFile;
