const asyncHandler = require('../utils/asynchandler')
const ApiResponse = require('../utils/apiResponse')
const  CustomApiError = require('../utils/apiErrors')


const healthCheck = asyncHandler(async(req,res)=>{
    try {
        res.status(200).json(
            new ApiResponse(
                200,
                'HealthCheck route is working successfully!'
            )
        )
    } catch (error) {
        console.log(error)
        throw new CustomApiError(
            500,
            error.message,
        )
        
    }
})

module.exports = healthCheck