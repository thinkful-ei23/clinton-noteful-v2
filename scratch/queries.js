'use strict';

const knex = require('../knex');

// Get All (and search by query)
let searchTerm = 'most';
knex
  .select('id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .orderBy('id')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error(err);
  });

// Get a single item
let id = 1005;
knex
  .first('id', 'title', 'content') // automatically returns the first object w/ no array
  .from('notes')
  .where( { id: id } )
  .then( results => {
    if (results) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      // next(); // => 404 handler
      console.log('Item not found.');
    }
  })
  .catch(err => console.error(err));

// Update an item
id = 1001;
let updateObj = {
  title: 'Updated Title',
  content: 'Updated content.'
};
knex('notes')
  .update( updateObj )
  .where( { id: id } )
  .returning( [ 'id', 'title', 'content' ] )
  .then( ([results]) => {
    if (results) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      // next(); // => 404 handler
      console.log('Item not found.');
    }
  })
  .catch(err => console.error(err));

// Insert an item
let newItem = {
  title: 'New Title',
  content: 'New content.'
};
knex
  .insert(newItem)
  .into('notes')
  .returning( [ 'id', 'title', 'content' ] )
  .then( ([results]) => console.log(JSON.stringify(results, null, 2)))
  .catch(err => console.error(err));

// Delete an item
id = 1010;
knex('notes')
  .where( { id: id } )
  .del()
  .then(results => console.log(JSON.stringify(results, null, 2)))
  .catch(err => console.error(err));
