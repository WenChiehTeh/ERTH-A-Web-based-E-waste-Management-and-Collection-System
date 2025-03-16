--Users table
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL
);