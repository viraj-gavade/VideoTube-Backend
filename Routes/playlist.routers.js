const express = require('express')
const { getUserPlaylist, createPlaylist, addVideotoPlaylist, removeVideofromPlaylist, deletePlaylist, updatePlaylist } = require('../Controllers/playlist.controllers')
const VerifyJwt = require('../Middlerwares/auth')


const PlaylistRouter = express.Router()

PlaylistRouter.route('/playlist/:userId').get(VerifyJwt,getUserPlaylist) //Get user playlist

PlaylistRouter.route('/playlist/create').post(VerifyJwt,createPlaylist) //Create the playlist

PlaylistRouter.route('/playlist/add-video/:playlistId/:videoId').post(VerifyJwt,addVideotoPlaylist) 

PlaylistRouter.route('/playlist/remove-video/:playlistId/:videoId').post(VerifyJwt,removeVideofromPlaylist) 

PlaylistRouter.route('/playlist/:playlistId').delete(VerifyJwt,deletePlaylist) 

PlaylistRouter.route('/playlist/:playlistId').patch(VerifyJwt,updatePlaylist) 





module.exports =  PlaylistRouter