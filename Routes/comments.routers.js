const express = require('express')
const VerifyJwt = require('../Middlerwares/auth')
const { addComment, deleteComment,getVideoComments, updateComment } = require('../Controllers/commnet.controllers')
const CommentRouter = express.Router()



CommentRouter.route('/comments/:videoId')
.post(VerifyJwt,addComment)



CommentRouter.route('/comment/:commentId')
.put(VerifyJwt,updateComment)
.delete(VerifyJwt,deleteComment)

CommentRouter.route('/comment/delete/:commentId')
.get(VerifyJwt,deleteComment)
module.exports = CommentRouter


//Comment Routes Working Confirmed!