'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Get all folders
router.get('/', (req, res, next) => {
  knex.select('folders.id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err)); // => Error handler
});

// Get a single folder (by id)
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  // `.first()` returns only the first object (not an array)
  knex.first('folders.id', 'name')
    .from('folders')
    .where( { id: id } )
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

// Update a folder (unused in app, but rounds out API)
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const updateObj = {};

  /***** Never trust users - validate input *****/
  if ('name' in req.body) {
    updateObj.name = req.body.name;
  } else {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err); // => Error handler
  }

  knex('folders')
    .update( updateObj )
    .where( { id: id } )
    .returning( [ 'folders.id', 'name' ] )
    .then( ([results]) => {
      if (results) {
        res.json(results);
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

// Create a folder
router.post('/', (req, res, next) => {
  const newFolder = {};

  /***** Never trust users - validate input *****/
  if ('name' in req.body) {
    newFolder.name = req.body.name;
  } else {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err); // => Error handler
  }
  
  knex
    .insert(newFolder)
    .into('folders')
    .returning( [ 'folders.id', 'name' ] )
    .then( ([results]) => {
      if (results) {
        res.location(`http://${req.headers.host}/folders/${results.id}`).status(201).json(results);
      }
    })
    .catch(err => next(err)); // => Error handler
});

// Delete a folder
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('folders')
    .where( { id: id } )
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err)); // => Error handler
});

module.exports = router;
