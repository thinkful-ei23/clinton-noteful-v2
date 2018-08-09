'use strict';

// Load Express, Morgan, CORS, Config, and Routers into the file
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { PORT } = require('./config');

const notesRouter = require('./routes/notes');
const foldersRouter = require('./routes/folders');
const tagsRouter = require('./routes/tags');

// Create an Express application
const app = express();

// Log all requests with Morgan
app.use(morgan('dev'));

// Create a static webserver
app.use(express.static('public'));

// Enable CORS support
app.use(cors());

// Parse incoming requests that contain JSON and
// make them available on `req.body`
app.use(express.json());

// Route all requests to `/api/notes`, `/api/folders`,
// and `/api/tags` through the proper Router
app.use('/api/notes', notesRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/tags', tagsRouter);

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom 'Catch-All' Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Listen for incoming connections
app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});
