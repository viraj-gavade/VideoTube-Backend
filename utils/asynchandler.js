const asyncHandler = (fn)=>{
  return  (req,res,next)=>{
        Promise.resolve( fn(req,res,next)).
        catch((err)=>next(err))
    }
    }


// const asyncHandler = (fn)=>async (err,req,res,next)=>{

//     try {
//         await fn(err,req,res,next)
//     } catch (error) {
//         res.status(err.status||5000).json({
//             success:false,
//             message:err.message
//         })
//     }
// }


module.exports = asyncHandler