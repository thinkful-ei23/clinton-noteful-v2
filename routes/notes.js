'use strict';

const express = require('express');
const knex = require('../knex');
const hydrateNotes = require('../utils/hydrateNotes');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

/* ========== GET/READ ALL NOTES + SEARCH BY QUERY ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  // Select all notes and leftJoin on folders and tags
  knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName', 'tags.name as tagName', 'tags.id as tagId')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    // Filter by search term, if present
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    // Filter by folder, if specified
    .modify(queryBuilder => {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    // Filter by tag, if specified
    .modify(queryBuilder => {
      if (tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(result => {
      if (result) {
        // Hydrate the results
        const hydrated = hydrateNotes(result);
        // Respond with a 200 status and an array of note objects
        res.json(hydrated); // => Client
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== GET/READ SINGLE NOTE ========== */
router.get('/:id', (req, res, next) => {
  // Select single note and leftJoin on folders and tags
  knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName', 'tags.name as tagName', 'tags.id as tagId')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .where('notes.id', req.params.id)
    .then( result => {
      if (result) {
        // Hydrate the results
        const [hydrated] = hydrateNotes(result);
        // Respond with a 200 status and the note object
        res.json(hydrated); // => Client
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== POST/CREATE NOTE ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err); // => Error handler
  }

  const newNote = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null,
  };

  let noteId;
  // Insert new note, instead of returning all the fields, just return the new `id`
  knex.insert(newNote)
    .into('notes')
    .returning('id')
    .then( ([id]) => {
      // Insert related tags into notes_tags table
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      // Select the new note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
        .where('notes.id', noteId);
    })
    .then((result) => {
      if (result) {
        // Hydrate the results
        const [hydrated] = hydrateNotes(result);
        // Respond with a location header, a 201 status and a note object
        res.location(`http://${req.originalUrl}/${hydrated.id}`)
          .status(201)
          .json(hydrated); // => Client
      } else {
        next(); // => 404 handler
      }
    })
    .catch(err => next(err)); // => Error handler
});

/* ========== PUT/UPDATE A SINGLE NOTE ========== */
router.put('/:id', (req, res, next) => {
  const noteId = req.params.id;
  const { title, content, folderId, tags } = req.body;

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

  // Update note in notes table
  knex.update(updateObj)
    .from('notes')
    .where('notes.id', noteId)
    .then( () => {
      // Delete current related tags from notes_tags table
      return knex.del()
        .from('notes_tags')
        .where('note_id', noteId);
    })
    .then(() => {
      // Insert related tags into notes_tags table
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      // Select the updated note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
        // Hydrate the results
        const hydrated = hydrateNotes(result);
        // Respond with a 200 status and a note object
        res.json(hydrated); // => Client
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
      // Respond with a 204 status
      res.sendStatus(204); // => Client
    })
    .catch(err => next(err)); // => Error handler
});

module.exports = router;
