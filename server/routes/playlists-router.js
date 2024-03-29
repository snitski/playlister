/*
    This is where we'll route all of the received http requests
    into controller response functions.
    
    @author McKilla Gorilla
*/
const express = require('express')
const PlaylistController = require('../controllers/playlist-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', auth.verify, PlaylistController.createPlaylist)

router.delete('/playlist/:id', auth.verify, PlaylistController.deletePlaylist)

router.get('/playlists/',  PlaylistController.getPlaylists) // Given a query to search the db with 

router.put('/playlist/:id', auth.verify, PlaylistController.updatePlaylist)

module.exports = router