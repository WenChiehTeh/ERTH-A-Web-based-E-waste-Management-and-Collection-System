--Users Table
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL.
	points integer DEFAULT 0,
);

--Collection Request Table
CREATE TABLE IF NOT EXISTS public.collectionrequests
(
    id SERIAL PRIMARY KEY,
    sessionid TEXT,
    date DATE,
    time TEXT,
    firstname TEXT,
    lastname TEXT,
    phoneno TEXT,
    address TEXT,
    state TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    userID INT,
    FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE
)

--Collection Items Table
CREATE TABLE collectionRequestsItems (
	id SERIAL PRIMARY KEY,
	item TEXT,
	quantity INT,
	requestID INT,
	FOREIGN KEY (requestID) REFERENCES collectionRequests(id) ON DELETE CASCADE
);