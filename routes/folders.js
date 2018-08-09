'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

/* ========== GET/READ ALL FOLDERS ========== */
router.get('/', (req, res, next) => {
  knex.select('folders.id', 'name')
    .from('folders')
    .then(results => res.json(results)) // => Client
    .catch(err => next(err)); // => Error handler
});

/* ========== GET/READ SINGLE FOLDER ========== */
router.get('/:id', (req, res, next) => {
  knex.first('folders.id', 'name') // => only first object (not array)
    .from('folders')
    .where( { id: req.params.id } )
    .then(result => {
      if (result) {
        res.json(result); // => Client
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== POST/CREATE FOLDER ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users - validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err); // => Error handler
  }

  const newFolder = { name };
  
  knex.insert(newFolder)
    .into('folders')
    .returning( [ 'folders.id', 'name' ] )
    .then( ([result]) => {
      res.location(`http://${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result); // => Client
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== PUT/UPDATE A SINGLE FOLDER ========== */
router.put('/:id', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users - validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err); // => Error handler
  }

  const updateObj = { name };

  knex.update(updateObj)
    .from('folders')
    .where( { id: req.params.id } )
    .returning( [ 'folders.id', 'name' ] )
    .then( ([result]) => {
      if (result) {
        res.json(result); // => Client
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== DELETE/REMOVE A SINGLE FOLDER ========== */
router.delete('/:id', (req, res, next) => {
  knex.del()
    .from('folders')
    .where( { id: req.params.id } )
    .then(() => res.sendStatus(204)) // => Client
    .catch(err => next(err)); // => Error handler
});

module.exports = router;
