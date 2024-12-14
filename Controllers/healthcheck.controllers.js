// Import necessary utility functions and classes
const asyncHandler = require('../utils/asynchandler'); // Middleware for handling async functions
const ApiResponse = require('../utils/apiResponse'); // Helper class for structured API responses
const CustomApiError = require('../utils/apiErrors'); // Custom error handler class

/**
 * HealthCheck controller to verify that the server is running and responsive.
 * This route can be used to confirm that the API server is up and running.
 * Typically used in production environments or for monitoring services.
 */
const healthCheck = asyncHandler(async (req, res) => {
    try {
        // When the health check route is successfully hit, respond with a status 200 OK
        res.status(200).json(
            new ApiResponse(
                200, // HTTP Status Code for successful request
                'HealthCheck route is working successfully!' // Success message indicating the route is functional
            )
        );
    } catch (error) {
        // If any error occurs in the try block, this block will catch it
        // Log the error to the console for debugging purposes
        console.log(error);

        // Throw a custom API error if something goes wrong, such as an internal server error
        // This will pass the error to the error-handling middleware
        throw new CustomApiError(
            500, // HTTP Status Code for Internal Server Error
            error.message // Pass the message of the caught error
        );
    }
});

// Export the healthCheck controller so it can be used in routing
module.exports = healthCheck;
