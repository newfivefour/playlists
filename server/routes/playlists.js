const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
// we'll be adding to this model
const { Playlist } = require('./../models.js')
// * isLoggedIn - middleware to check the user is logged
// * makeError - creates an error with a HTTP response code
// that's sent to next() which is our error handler in server.js
// * requireParams - ensure the request has the right body params
const { isLoggedIn, requireParams, makeError } = require('./../utils.js')

// Get all the playlists in the database
router.get('/playlist/', 
  function(req, res, next) {
  
    Playlist.find()
    .populate("_owner")
    .then(function(playlists) {
      res.status(200).send(playlists)
    })
    .catch(function(error) {
      next(error)
    }); 
  
  }
)

// Get only the current user's playlists 
router.get('/playlist/my', 
  isLoggedIn, 
  function(req, res, next) {

    Playlist.find(
      {"_owner": mongoose.Types.ObjectId(req.session.user._id)})
    .populate("_owner")
    .then(function(playlists) {
      res.status(200).send(playlists)
    })
    .catch(function(error) {
      next(error)
    }); 
    
  }
)

// Add a playlist - give it a name only
router.post('/playlist/:name', 
  isLoggedIn, 
  function(req, res, next) {

    Playlist.create({ 
      name: req.params.name, 
      _owner: req.session.user._id })
    .then(function() {
      res.status(200).send()
    })
    .catch(function(error) {
      next(error)
    }); 
    
  }
)

// Delete the playlist
// Ensures you're logged in and you own it.
router.delete('/playlist/:id', 
  isLoggedIn, 
  function(req, res, next) {
  
    Playlist.findOneAndDelete({
      "_id": mongoose.Types.ObjectId(req.params.id),
      "_owner": mongoose.Types.ObjectId(req.session.user._id)
    })
    .then(function(foundOne) {
      if(!foundOne) next(makeError(404, "Couldn't find playlist"))
      else res.status(200).send()
    })
    .catch(function(error) {
      next(error)
    }); 
    
  }
)
  
// Add a track (link) to playlist
// Ensures you're logged in and you own it.
router.post('/playlist/link/:id', 
  isLoggedIn, 
  requireParams(["link"]),
  function(req, res, next) {
  
    Playlist.findOneAndUpdate({
        "_id": mongoose.Types.ObjectId(req.params.id),
        "_owner": mongoose.Types.ObjectId(req.session.user._id)
      },
      { $push: { links: req.body.link } })
    .then(function(foundOne) {
      if(!foundOne) next(makeError(404, "Couldn't find playlist"))
      else res.status(200).send()    
    })
    .catch(function(error) {
      next(error)
    }); 
    
  }
)
  
// Delete a track (link) from a playlist
// Ensures you're logged in and you own it.
router.delete('/playlist/link/:id', 
  isLoggedIn, 
  function(req, res, next) {

    Playlist.findOneAndUpdate({
        "_id": mongoose.Types.ObjectId(req.params.id),
        "_owner": mongoose.Types.ObjectId(req.session.user._id)
      },
      { $pull: { links: req.body.link } })
    .then(function(foundOne) {
      if(!foundOne) next(makeError(404, "Couldn't find playlist"))
      else res.status(200).send() 
    })
    .catch(function(error) {
      next(error)
    }); 

  }
)

// Add all the links to the playlist (useful when reordering)
// Ensures you're logged in and you own it.
router.post('/playlist/links/:id', 
  isLoggedIn, 
  requireParams(["links"]),
  function(req, res, next) {
  
    Playlist.findOneAndUpdate({
        "_id": mongoose.Types.ObjectId(req.params.id),
        "_owner": mongoose.Types.ObjectId(req.session.user._id)
      },
      { links: req.body.links })
    .then(function(foundOne) {
      if(!foundOne) next(makeError(404, "Couldn't find the playlist"))
      else res.status(200).send()    
    })
    .catch(function(error) {
      next(error)
    }); 
    
  }
)

module.exports = router;
