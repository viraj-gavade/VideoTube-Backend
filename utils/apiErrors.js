class CustomApiError extends Error{
    constructor(
        StatusCode,
        message='Something Went Wrong!',
        errors = [],
        stack=''

    ) {
        super(message)
        this.StatusCode = StatusCode,
        this.message = message,
        this.errors = errors,
        this.data = null,
        this.success = false
        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}


module.exports = CustomApiError