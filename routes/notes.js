'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

// Get all notes (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm, folderId } = req.query;

  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
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
    .then(results => res.json(results))
    .catch(err => next(err)); // => Error handler
});

// Get a single note (by id)
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    // `.first()` returns only the first object (not an array)
    .first('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where( { 'notes.id': id } )
    .then( results => {
      if (results) {
        res.json(results);
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

// Update a note
router.put('/:id', (req, res, next) => {
  const noteId = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content', 'folder_id'];

  // `updateObj` should only contain `updateableFields`
  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (updateObj.title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update( updateObj )
    .where( { 'notes.id': noteId } )
    .returning( [ 'notes.id', 'title', 'content', 'folder_id' ] )
    .then( ([results]) => {
      if (results) {
        res.json(results);
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err));
});

// Create a note
router.post('/', (req, res, next) => {
  const { title, content, folder_id } = req.body;

  const newItem = {
    title: title,
    content: content,
    folder_id: folder_id  // Add `folderId`
  };

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  knex
    .insert(newItem)
    .into('notes')
    .returning('id')
    .then( ([id]) => {
      noteId = id;
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([results]) => {
      res.location(`http://${req.headers.host}/notes/${results.id}`).status(201).json(results);
    })
    .catch(err => next(err));
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .where( { id: id } )
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err));
});

module.exports = router;
