DROP TABLE IF EXISTS bookstable;
-- DROP TABLE IF NOT EXISTS bookstable;
CREATE TABLE IF NOT EXISTS bookstable (
  id SERIAL PRIMARY KEY,
  authors VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  description TEXT,
  bookshelf VARCHAR(255)
);
