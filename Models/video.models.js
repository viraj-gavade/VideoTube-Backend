const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Define the video schema
const VideoSchema = mongoose.Schema({
    
    // 'videoFile' field: URL to the video file (stored in cloud storage)
    videoFile: {
        type: String, // String type to store the URL of the video
        required: true, // Ensures the video file is provided
    },

    // 'thumbnail' field: URL to the video thumbnail image (stored in cloud storage)
    thumbnail: {
        type: String, // String type to store the URL of the thumbnail image
        required: true, // Ensures the thumbnail is provided
    },

    // 'title' field: Title of the video
    title: {
        type: String, // String type for the video title
        required: true, // Ensures the title is provided
    },

    // 'description' field: A brief description of the video
    description: {
        type: String, // String type for the video description
        required: true, // Ensures the description is provided
    },

    // 'duration' field: Duration of the video in seconds
    duration: {
        type: Number, // Number type to store the video duration
        required: true, // Ensures the duration is provided
    },

    // 'views' field: Number of views the video has received
    views: {
        type: Number, // Number type for the views count
        default: 0, // Default value set to 0 for new videos
    },

    // 'isPublished' field: A flag indicating whether the video is published or not
    isPublished: {
        type: Boolean, // Boolean type to track the publish status of the video
        default: true, // Default value set to true, meaning the video is published by default
    },

    // 'owner' field: Reference to the User model, indicating the user who uploaded the video
    owner: {
        type: mongoose.Schema.Types.ObjectId, // ObjectId type for referencing the 'User' model
        ref: 'User', // Reference to the 'User' model
    },
}, { timestamps: true }); // Automatically creates 'createdAt' and 'updatedAt' timestamps

// Apply the pagination plugin to enable aggregation-based pagination
VideoSchema.plugin(mongooseAggregatePaginate);

// Export the 'Video' model based on the schema
module.exports = mongoose.model('Video', VideoSchema);
