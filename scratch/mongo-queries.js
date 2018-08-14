// mongo noteful < ./scratch/mongo-queries.js

'use strict';
/* eslint-disable quotes */

// Display all the documents in the collection notes
// db.notes.find();

// Display all the documents in the collection notes
// and format the results to be 'pretty'
// db.notes.find().pretty();

// Display the fields title and content for all the documents in the collection notes.
// db.notes.find({}, {"title": 1, "content": 1}).pretty();

// Display the fields title and content but exclude the field _id for all the documents in the collection notes.
// db.notes.find({}, {"title": 1, "content": 1, "_id": 0}).pretty();

// Display only the title field for all the documents in the collection notes and sort the results by _id in descending order.
// db.notes.find({}, {"title": 1}).sort({"_id": -1}).pretty();

// Display all the documents from the collection notes which contain the title '5 life lessons learned from cats'.
// db.notes.find({"title": "5 life lessons learned from cats"}).pretty();

// Display the first 5 documents from the collection notes.
// db.notes.find().sort({"_id": 1}).limit(5).pretty();

// Display the next 5 documents from the collection notes after skipping the first 5.
// db.notes.find().sort({"_id": 1}).skip(5).limit(5).pretty();

// Write a MongoDB query to display the total number of documents in the collection notes.
// db.notes.count();

// Display the documents from the collection notes which have an _id that is greater than "000000000000000000000007".
// db.notes.find({"_id": {"$gt": "000000000000000000000007"}}).pretty();

// Display the documents from the collection notes which have an _id which is greater than or equal to "000000000000000000000009" but less than or equal to "000000000000000000000017".
// db.notes.find({"_id": {"$gte": "000000000000000000000009", "$lte": "000000000000000000000017"}}).pretty();

// Display the documents from the collection notes which have an _id which is less than or equal to "000000000000000000000007".
// db.notes.find({"_id": {"$lte": "000000000000000000000007"}}).pretty();

// Display only one document from the collection notes.
// db.notes.findOne({"_id": "000000000000000000000001"});

// Display only the title of one document from the collection notes (_id can be included).
// db.notes.findOne({"_id": "000000000000000000000001"}, {"title": 1});

// Display only the title of one document from the collection notes (_id excluded).
// db.notes.findOne({"_id": "000000000000000000000001"}, {"title": 1, "_id": 0});

// Insert one document into the collection notes. The title and content fields can be whatever you like.
// db.notes.insert({"title": "article about dogs", "content": "lorem ipsum..."});
// db.notes.find({"title": "article about dogs"}).pretty();

// Insert two note documents into the collection notes. The title and content fields can be whatever you like.
// db.notes.insertMany([{"title": "another dog article", "content": "ipsum lorem..."}, {"title": "yet another dog article", "content": "lipsum orem..."}]);
// db.notes.find({"_id": /^5.*$/}).pretty();

// Modify the title and content fields of the document from the collection notes with _id "000000000000000000000003". Change the title and content to be whatever you like.
// db.notes.update({"_id": "000000000000000000000003"}, {"title": "updated title", "content": "updated content"});
// db.notes.find({"_id": "000000000000000000000003"}).pretty();

// Modify only the title field of the document from the collection notes with _id "000000000000000000000007". The content field should remain unchanged.
// db.notes.update({"_id": "000000000000000000000007"}, {"$set": {"title": "title updated only!"}});
// db.notes.find({"_id": "000000000000000000000007"}).pretty();

// Modify the title and content fields of all the documents in the collection notes that have an _id field greater than "000000000000000000000014".
// db.notes.updateMany({"_id": {"$gt": "000000000000000000000014"}}, {"$set": {"title": "One of many updated titles", "content": "My id is greater than 14"}});
// db.notes.find({"_id": {"$gt": "000000000000000000000014"}}).pretty();

// Remove only the title field from the document in the collection notes with _id "000000000000000000000008".
// db.notes.update({"_id": "000000000000000000000008"}, {"$unset": {"title": 1}});
// db.notes.find({"_id": "000000000000000000000008"}).pretty();

// Remove the content fields from all documents in the collection notes with _id less than or equal to "000000000000000000000006".
// db.notes.update({"_id": {"$lte": "000000000000000000000006"}}, {"$unset": {"content": 1}}, {multi: true});
// db.notes.find({"_id": {"$lte": "000000000000000000000006"}}).pretty();

// Remove the title fields from all documents in the collection notes with _id less than or equal to "000000000000000000000003".
// db.notes.update({"_id": {"$lte": "000000000000000000000003"}}, {"$unset": {"title": 1}}, {multi: true});
// db.notes.find({"_id": {"$lte": "000000000000000000000003"}}).pretty();

// Remove the document from the collection notes that has an _id "000000000000000000000017".
// db.notes.deleteOne({"_id": "000000000000000000000017"});
// db.notes.find({}, {"_id": 1}).sort({"_id": 1}).pretty();

// Remove the documents from the collection notes that have an _id which is not less than "000000000000000000000018".
// db.notes.deleteMany({"_id": {"$not": {"$lt": "000000000000000000000018"}}});
// db.notes.find({}, {"_id": 1}).sort({"_id": 1}).pretty();

// Remove the documents from the collection notes that have an _id which is greater than or equal to "000000000000000000000013" and contain the string 'dogs' in the title.
// db.notes.createIndex( {title: "text"}, {collation: {locale: 'en', strength: 2}});
// db.notes.deleteMany({"_id": {"$gte": "000000000000000000000013"}, $text: {$search: "dogs"}});
// db.notes.deleteMany({"_id": {"$gte": "000000000000000000000013"}, "title": {"$regex": /dogs/}});
// db.notes.find({"$text": {"$search": "dogs"}}).pretty();

// Display all the documents from the collection notes which do not have a title field.
// db.notes.find({"title": null});

// Remove all the documents from the collection notes which contain the string 'cat' in the title but not the string 'the'.
// db.notes.find({"$text": {"$search": "cats -gaga", "$caseSensitive": false}}).pretty();
// db.notes.deleteMany({"$and": [
//   {"title": {"$regex": /cat/i}},
//   {"title": {"$not": /the/i}}
// ]});
// db.notes.find({"title": {"$regex": /cat/i}});

// Display all the documents from the collection notes that have a title field which does not contain the string 'dogs' and does contain a title field.
// db.notes.find({"$and": [
//   {"title": {"$not": /dogs/i}},
//   {"title": {"$exists": true}}
// ]}).pretty();
