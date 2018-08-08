'use strict';

const { app, startServer, stopServer } = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function() {

  it('true should be true', function() {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function() {
    expect(2 + 2).to.equal(4);
  });

});

describe ('Noteful App', function() {

  // Start the server before tests run
  before(function() {
    return startServer();
  });

  // Stop the server once tests are complete
  after(function() {
    return stopServer();
  });

  describe('Static Server', function() {

    it('should return the index page', function() {
      return chai.request(app)
        .get('/')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

  });

  describe('404 handler', function() {

    it('should respond with 404 when given a bad path', function() {
      return chai.request(app)
        .get('/DOES/NOT/EXIST')
        .catch(function(err) {
          return err.response;
        })
        .then(function(res) {
          expect(res).to.have.status(404);
        });
    });

  });


  describe('GET /api/notes', function() {

    it('should return full list of 10 default notes', function() {
      return chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(10);

          res.body.forEach(function(note) {
            expect(note).to.be.an('object');
            expect(note).to.include.keys('id', 'title', 'content');
          });
        });
    });

    it('should return correct search results for a valid query', function() {
      const searchTerm = 'government';
      return chai.request(app)
        .get(`/api/notes/?searchTerm=${searchTerm}`)
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.above(0);
          res.body.forEach(function(note) {
            expect(note).to.be.a('object');
            expect(note).to.have.all.keys('id', 'title', 'content');
            expect(note.title).to.include(searchTerm);
          });
        });
    });

    it('should return empty array for an invalid query', function() {
      const searchTerm = 'dogs';
      return chai
        .request(app)
        .get(`/api/notes/?searchTerm=${searchTerm}`)
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(0);
        });
    });

  });

  describe('GET /api/notes/:id', function() {

    it('should return correct note object', function() {
      let id, title, content;
      return chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          ({ id, title, content } = res.body[0]);
          return chai.request(app)
            .get(`/api/notes/${id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          expect(res.body.id).to.equal(id);
          expect(res.body.title).to.equal(title);
          expect(res.body.content).to.equal(content);
        });
    });

    it('should respond with a 404 for an invalid id', function() {
      return chai.request(app)
        .get('/api/notes/DOESNOTEXIST')
        .catch(function(err) {
          return err.response;
        })
        .then(function(res) {
          expect(res).to.have.status(404);
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('message');
          expect(res.body.message).to.equal('Not Found');
        });
    });

  });

  describe('POST /api/notes', function() {

    it('should create and return a new item when provided valid data', function() {
      const newNote = { title: 'dogs are cool', content: 'stuff about dogs' };
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          expect(res.body.id).to.be.a('number');
          expect(res.body).to.deep.equal(
            Object.assign(newNote, { id: res.body.id })
          );
          expect(res.headers.location).to.include(res.body.id);
        });
    });

    it('should return an error with `missing title` message', function() {
      const newNote = { title: '', content: 'Uh-oh! No title!' };
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .catch(function(err) {
          return err.response;
        })
        .then(function(res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('message', 'error');
          expect(res.body.message).to.equal('Missing `title` in request body');
          expect(res.body.error.status).to.equal(400);
        });
    });

  });

  describe ('PUT /api/notes/:id', function() {

    it('should update and return a note object', function() {
      const updateData = {
        title: 'dog note',
        content: 'stuff about dogs'
      };

      return chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          updateData.id = res.body[0].id;
          return chai.request(app)
            .put(`/api/notes/${updateData.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.deep.equal(updateData);
        });
    });

    it('should respond with a 404', function() {
      const updateData = {
        title: 'dog note',
        content: 'stuff about dogs'
      };

      return chai.request(app)
        .put('/api/notes/DOESNOTEXIST')
        .send(updateData)
        .catch(function (err) {
          return err.response;
        })
        .then(function(res) {
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('message');
          expect(res.body.message).to.equal('Not Found');
        });
    });

  });

  describe('DELETE /api/notes/:id', function() {

    it('should delete an item by id', function() {
      return chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          return chai.request(app)
            .delete(`/api/notes/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        });
    });

  });

});
