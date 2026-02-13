### Event Ticketing Management Platform ###

## Project Overview
Full-stack ticketing platform enabling event organizers to create, manage, and publish events while providing attendees with a secure booking interface. The system implements database transactions to prevent race conditions during concurrent ticket purchases—a critical requirement for real-world booking systems.

## Key Features
For Event Organizers (Managers)

Secure Authentication: Password-protected login with express-session management
Event Management: Full CRUD operations for event creation, editing, deletion
Publishing Workflow: Draft-to-published event pipeline with publish date tracking
Dashboard: Centralized view of all events with status indicators
Site Settings: Customizable platform name and description with persistence
Real-Time Inventory: Live ticket availability tracking across all events

For Attendees (Public)

Event Discovery: Browse all published events with details
Ticket Booking: Purchase tickets with quantity selection
Transaction Safety: Atomic booking operations prevent overbooking
Purchase Confirmation: Success/failure pages with clear user feedback
Inventory Validation: Real-time checks prevent booking unavailable tickets

Advanced Technical Features

Database Transactions: BEGIN/COMMIT/ROLLBACK for atomic operations
Concurrency Control: Prevents race conditions in multi-user scenarios
Session Management: Secure, stateful user authentication
Input Validation: Server-side validation for all form inputs
Error Handling: Comprehensive error catching and user-friendly messages
Foreign Key Constraints: Enforced referential integrity

## Tech Stack
Backend:

Node.js
Express.js 4.x
SQLite3 (with transaction support)
express-session (authentication)

Frontend:

EJS templating engine
HTML5/CSS3
Vanilla JavaScript

Architecture:

MVC pattern
RESTful API design
Session-based authentication

## Technical Highlights
Database Transaction Implementation
The booking system uses explicit transaction control to ensure data consistency:
javascriptdb.serialize(() => {
  db.run("BEGIN TRANSACTION");
  
  // 1. Insert booking record
  db.run(insertBooking, [eventId, attendeeName, quantity], (err) => {
    if (err) {
      db.run("ROLLBACK");
      return res.status(500).send("Booking failed.");
    }
    
    // 2. Update ticket count atomically
    db.run(updateQuery, [quantity, eventId], (err) => {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).send("Failed to update.");
      }
      
      // 3. Commit if all operations succeed
      db.run("COMMIT", (err) => {
        if (err) return res.status(500).send("Transaction failed");
        res.redirect("/purchase/success");
      });
    });
  });
});
This pattern ensures:

Atomicity: All operations succeed or none do
Consistency: No partial bookings or inventory mismatches
Isolation: Concurrent transactions don't interfere
Durability: Committed bookings are permanent

## Concurrency Problem Solved
The Challenge:
Two users attempting to book the last 5 tickets simultaneously could both succeed without transaction control, resulting in overbooking.
The Solution:
Database-level locking via transactions ensures only one booking completes when inventory is limited. The second request sees the updated inventory and receives a "sold out" message.

## Database Schema
## Tables
managers
    CREATE TABLE managers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    password TEXT NOT NULL
);
events
    CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    event_date TEXT,
    venue TEXT,
    tickets_available INTEGER NOT NULL,
    ticket_price REAL NOT NULL,
    publish_date TEXT,
    is_published INTEGER DEFAULT 0
);
bookings
    CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    attendee_name TEXT NOT NULL,
    tickets_booked INTEGER NOT NULL,
    booking_date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
site_settings
    CREATE TABLE site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name TEXT NOT NULL,
    site_description TEXT
);
## Setup & Installation
Prerequisites

Node.js (v14 or higher)
npm (Node Package Manager)

## Installation requirements ##
* ExpreeJS
* Express-session (for login)

1. Upon npm run start it will lead to http://localhost:3000/
2. organise is required to register before accessing organiser page
3. application is split into 2 page Attendee and Organiser

#### Final Steps ####
* To run the project Terminal 
1. npm install,	Install all required dependencies
2. npm install express,	Ensure Express is installed
3. npm run build-db-win,	Run DB setup script(for Windows)
4. npm run start
5. To access organiser page, username:jane.eyre@gmail.com, 
                             password:newpassword123
6. To access the site-setting page, please remove the ".html" at the end to access it

## Future Enhancements

- [ ] Implement bcrypt password hashing for production security
- [ ] Add email confirmation for bookings
- [ ] Migrate to PostgreSQL for production scalability
- [ ] Implement payment gateway integration (Stripe/PayPal)
- [ ] Add QR code generation for tickets
- [ ] Rate limiting on authentication endpoints
