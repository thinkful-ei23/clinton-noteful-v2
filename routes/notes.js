'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

/* ========== GET/READ ALL NOTES + SEARCH BY QUERY ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId } = req.query;

  knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(queryBuilder => {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .orderBy('notes.id')
    .then(results => res.json(results)) // => Client
    .catch(err => next(err)); // => Error handler
});

/* ========== GET/READ SINGLE NOTE ========== */
router.get('/:id', (req, res, next) => {
  knex.first('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName') // => only first object (not array)
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where( { 'notes.id': req.params.id } )
    .then( result => {
      if (result) {
        res.json(result); // => Client
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== POST/CREATE NOTE ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err); // => Error handler
  }

  const newNote = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null
  };

  // Insert new note, instead of returning all the fields, just return the new `id`
  knex.insert(newNote)
    .into('notes')
    .returning('id')
    .then( ([id]) => {
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id);
    })
    .then(([result]) => {
      res.location(`http://${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result); // => Client
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== PUT/UPDATE A SINGLE NOTE ========== */
router.put('/:id', (req, res, next) => {
  const { title, content, folderId } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err); // => Error handler
  }

  const updateObj = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null
  };

  knex.update(updateObj)
    .from('notes')
    .where( { 'notes.id': req.params.id } )
    .returning( [ 'id' ] )
    .then( () => {
      // Using the note id, select the note and the folder info
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', req.params.id);
    })
    .then(([result]) => {
      if (result) {
        res.json(result); // => Client
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== DELETE/REMOVE A SINGLE NOTE ========== */
router.delete('/:id', (req, res, next) => {
  knex.del()
    .from('notes')
    .where( { id: req.params.id } )
    .then(() => {
      res.sendStatus(204); // => Client
    })
    .catch(err => next(err)); // => Error handler
});

module.exports = router;
