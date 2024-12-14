const asyncHandler = require('../utils/asynchandler');
const User = require('../Models/users.models');
const ApiResponse = require('../utils/apiResponse');
const CustomApiError = require('../utils/apiErrors');
const Subscription = require('../Models/subscription.models');
const Video = require('../Models/video.models');
const { default: mongoose } = require('mongoose');

// Function to toggle the subscription for a user on a specific video
const togglesubscription = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Extract the videoId from the request parameters
    try {
        // Fetch the video and populate the owner's details
        const video = await Video.findById(videoId).populate('owner');
        const channelId = video?.owner?._id; // Get the owner (channel) ID from the video

        // If no channel ID is found, return an error response
        if (!channelId) {
            return res.status(400).json({
                success: false,
                message: `No channel found with ID: ${channelId}`,
            });
        }

        // Check if the user is already subscribed to the channel
        const channel = await Subscription.findOne({
            subscriber: req.user?._id,
            channel: channelId,
        });

        // If the user is already subscribed, unsubscribe them
        if (channel) {
            await Subscription.findByIdAndDelete(channel._id); // Delete the subscription document

            return res.status(200).json({
                success: true,
                message: 'Unsubscribed from the channel successfully!',
                isSubscribed: false,
            });
        }

        // If the user is not subscribed, subscribe them to the channel
        const newSubscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });

        // If the subscription is successful, return a success message
        if (newSubscription) {
            return res.status(200).json({
                success: true,
                message: 'Subscribed to the channel successfully!',
                isSubscribed: true,
            });
        }
    } catch (error) {
        // If an error occurs, return a 500 error response with the error message
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while processing the subscription.',
        });
    }
});

// Function to toggle subscription using channelId directly
const togglesubscriptionById = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params; // Extract channelId from the request parameters

        // If no channelId is provided, return a bad request error
        if (!channelId) {
            return res.status(400).json({
                success: false,
                message: 'No channel ID provided',
            });
        }

        // Check if the user is already subscribed to the given channel
        const existingSubscription = await Subscription.findOne({
            subscriber: req.user?._id,
            channel: channelId,
        });

        // If the user is already subscribed, unsubscribe them
        if (existingSubscription) {
            await Subscription.findByIdAndDelete(existingSubscription._id); // Delete the subscription document

            return res.status(200).json({
                success: true,
                message: 'Unsubscribed from the channel successfully!',
                isSubscribed: false,
            });
        }

        // If the user is not subscribed, subscribe them to the channel
        const newSubscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });

        // Return success message after subscribing
        return res.status(200).json({
            success: true,
            message: 'Subscribed to the channel successfully!',
            isSubscribed: true,
        });
    } catch (error) {
        // Handle any errors during the process
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while processing the subscription.',
        });
    }
});

// Function to get the number of subscribers for a user/channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params; // Extract the channelId from the request parameters

    // If no channelId is provided, throw an error
    if (!channelId) {
        throw new CustomApiError(
            400,
            `There is no such channel with Id:${channelId}`
        );
    }

    try {
        // Aggregation pipeline to count the number of subscribers for the given channel
        const channel = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(channelId), // Match the user/channel by channelId
                },
            },
            {
                $lookup: {
                    from: 'subscriptions', // Join with the subscriptions collection
                    localField: '_id', // Match _id with the channel field in subscriptions
                    foreignField: 'channel', // Link the channel field to the subscription
                    as: 'Subscribers', // Alias the matched subscribers as 'Subscribers'
                },
            },
            {
                $addFields: {
                    subscribers: {
                        $size: '$Subscribers', // Count the number of subscribers
                    },
                },
            },
            {
                $project: {
                    subscribers: 1, // Only include the subscribers field in the output
                    Subscribers: 1, // Include full subscribers data for reference
                },
            },
        ]);

        // Return the result with the number of subscribers
        return res.send(channel);
    } catch (error) {
        // Handle any errors during the process
        throw new CustomApiError(error.statusCode, error.message);
    }
});

// Function to get the channels the user is subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params; // Extract the channelId from the request parameters

    // If no channelId is provided, throw an error
    if (!channelId) {
        throw new CustomApiError(
            400,
            `There is no such channel Id:${channelId}`
        );
    }

    try {
        // Aggregation pipeline to get the list of channels the user is subscribed to
        const channel = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(channelId), // Match the user/channel by channelId
                },
            },
            {
                $lookup: {
                    from: 'subscriptions', // Join with the subscriptions collection
                    localField: '_id', // Match _id with the subscriber field in subscriptions
                    foreignField: 'subscriber', // Link the subscriber field to the subscription
                    as: 'Subscribed', // Alias the matched subscriptions as 'Subscribed'
                },
            },
            {
                $addFields: {
                    subscribed: {
                        $size: '$Subscribed', // Count the number of subscriptions
                    },
                },
            },
            {
                $project: {
                    Subscribed: 1, // Include the subscribed channels field in the output
                    subscribed: 1, // Include the count of subscribed channels
                },
            },
        ]);

        // Return the result with the list of channels the user is subscribed to
        return res.send(channel);
    } catch (error) {
        // Handle any errors during the process
        console.log(error);
        throw new CustomApiError(error.statusCode, error.message);
    }
});

// Export the controller functions for use in routes
module.exports = {
    togglesubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    togglesubscriptionById,
};
