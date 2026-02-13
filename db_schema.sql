-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)


-- Create the site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name TEXT NOT NULL,
    site_description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT,
    tickets_available INTEGER NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL,
    is_published BOOLEAN DEFAULT 0,
    publish_date DATETIME NOT NULL
);

-- Create a table for managers
CREATE TABLE IF NOT EXISTS managers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Unique ID for each organiser
    name TEXT NOT NULL,                     -- Name of the organiser
    password TEXT NOT NULL                  -- Password of the organiser
);

COMMIT;