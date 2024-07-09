const express = require('express')
const VerifyJwt = require('../Middlerwares/auth')
const { addComment, updateCommment, deleteComment,getVideoComments } = require('../Controllers/commnet.controllers')
const CommentRouter = express.Router()



CommentRouter.route('/comment/:videoId')
.post(VerifyJwt,addComment)
.get(VerifyJwt,getVideoComments)


CommentRouter.route('/comment/:commentId')
.patch(VerifyJwt,updateCommment)
.delete(VerifyJwt,deleteComment)


module.exports = CommentRouter