'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

/* ========== GET/READ ALL TAGS ========== */
router.get('/', (req, res, next) => {
  knex.select('tags.id', 'name')
    .from('tags')
    .then(result => res.json(result)) // => Client
    .catch(err => next(err)); // => Error handler
});

/* ========== GET/READ SINGLE TAG ========== */
router.get('/:id', (req, res, next) => {
  knex.first('tags.id', 'name') // => only first object (not array)
    .from('tags')
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

/* ========== POST/CREATE TAG ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err); // => Error handler
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['tags.id', 'name'])
    .then( ([result]) => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result); // => Client
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== PUT/UPDATE A SINGLE TAG ========== */
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
    .from('tags')
    .where( { id: req.params.id } )
    .returning( [ 'tags.id', 'name' ] )
    .then( ([result]) => {
      if (result) {
        res.json(result); // => Client
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== DELETE/REMOVE A SINGLE TAG ========== */
router.delete('/:id', (req, res, next) => {
  knex.del()
    .from('tags')
    .where( { id: req.params.id } )
    .then(() => res.sendStatus(204)) // => Client
    .catch(err => next(err)); // => Error handler
});

module.exports = router;
