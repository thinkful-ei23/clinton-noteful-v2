'use strict';

const noteId = 99;
const result = [34, 56, 78].map(tagId => ({ note_id: noteId, tag_id: tagId }));
console.log(`Insert the following into notes_tags:\n${JSON.stringify(result, null, 2)}`);