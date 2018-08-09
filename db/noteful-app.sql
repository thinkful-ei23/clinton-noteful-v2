-- psql -U dev -d noteful-app -f ./db/noteful-app.sql

DROP TABLE IF EXISTS notes_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text NOT NULL
);

ALTER SEQUENCE folders_id_seq RESTART WITH 100;

CREATE TABLE notes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text,
  created timestamp DEFAULT now()
  -- folder_id int REFERENCES folders(id) ON DELETE SET NULL
);

ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

-- If you delete a folder then set folder_id to null on related notes
-- IOW, delete a folder and move the notes to "uncategorized"
ALTER TABLE notes ADD COLUMN folder_id int REFERENCES folders(id) ON DELETE SET NULL;

-- Prevent folders from being deleted if referenced by any note
-- IOW, only empty folder can be deleted
-- ALTER TABLE notes ADD COLUMN folder_id int REFERENCES folders(id) ON DELETE RESTRICT;

-- If you delete a folder then delete all notes that reference the folder
-- IOW, delete a folder and all the notes in it
-- ALTER TABLE notes ADD COLUMN folder_id int REFERENCES folders(id) ON DELETE CASCADE;

CREATE TABLE tags (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

CREATE TABLE notes_tags (
  note_id INTEGER NOT NULL REFERENCES notes ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags ON DELETE CASCADE
);

INSERT INTO folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work');

INSERT INTO notes (title, content, folder_id) VALUES
  (
    '5 life lessons learned from cats',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
    103
  ),
  (
    'What the government doesn''t want you to know about cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.',
    102
  ),
  (
    'The most boring article about cats you''ll ever read',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
    101
  ),
  (
    '7 things lady gaga has in common with cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.',
    100
  ),
  (
    'The most incredible article about cats you''ll ever read',
    'Lorem ipsum dolor sit amet, boring consectetur adipiscing elit,',
    103
  ),
  (
    '10 ways cats can help you live to 100',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.',
    102
  ),
  (
    '9 reasons you can blame the recession on cats',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
    101
  ),
  (
    '10 ways marketers are making you addicted to cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.',
    100
  ),
  (
    '11 ways investing in cats can make you a millionaire',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
    103
  ),
  (
    'Why you should forget everything you learned about cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.',
    102
  );

INSERT INTO tags (name) VALUES
  ('cats'),
  ('gaga'),
  ('government'),
  ('good');

INSERT INTO notes_tags (note_id, tag_id) VALUES
  (1000, 1), (1000, 2),
  (1004, 1),
  (1006, 4), (1006, 1);

-- -- get all notes
-- SELECT * FROM notes;

-- -- get all folders
-- SELECT * FROM folders;

-- -- get all notes with folders
-- SELECT * FROM notes
-- INNER JOIN folders ON notes.folder_id = folders.id;

-- -- get all notes, show folders if they exists otherwise null
-- SELECT folder_id as folderId FROM notes
-- LEFT JOIN folders ON notes.folder_id = folders.id;
