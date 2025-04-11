--Users Table
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL.
	points integer DEFAULT 0,
);

--Collection Request Table
CREATE TABLE collectionRequests
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
	driverID INT DEFAULT NULL,
    FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (driverID) REFERENCES admins(id);
)

--Collection Items Table
CREATE TABLE collectionRequestsItems (
	id SERIAL PRIMARY KEY,
	item TEXT,
	quantity INT,
	requestID INT,
	FOREIGN KEY (requestID) REFERENCES collectionRequests(id) ON DELETE CASCADE
);

--Admin table
CREATE TABLE admins (
	id SERIAL PRIMARY KEY,
    name TEXT,
	username TEXT UNIQUE,
	password TEXT,
	role TEXT
)

--Driver table
CREATE TABLE driver (
	id serial PRIMARY KEY,
	vehicleType TEXT,
	numberPlate TEXT,
	driverID INT,
	FOREIGN KEY (driverID) REFERENCES admins(id) ON DELETE CASCADE
)