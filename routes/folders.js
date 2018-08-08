'use strict';

const express = require('express');
const knex = require('../knex');

const router = express.Router();

router.get('/', (req, res, next) => {
  knex.select('folders.id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex.first('folders.id', 'name')
    .from('folders')
    .where( { id: id } )
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const updateObj = {};

  if ('name' in req.body) {
    updateObj.name = req.body.name;
  } else {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .update( updateObj )
    .where( { id: id } )
    .returning( [ 'folders.id', 'name' ] )
    .then( ([results]) => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const newFolder = {};

  /***** Never trust users - validate input *****/
  if ('name' in req.body) {
    newFolder.name = req.body.name;
  } else {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
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
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('folders')
    .where( { id: id } )
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err));
});

module.exports = router;
