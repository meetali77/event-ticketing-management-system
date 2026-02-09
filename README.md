#Event Ticketing Management Platform
Production-grade event booking system with transaction-based concurrency control, role-based authentication, and comprehensive event lifecycle management.
#Project Overview
Full-stack ticketing platform enabling event organizers to create, manage, and publish events while providing attendees with a secure booking interface. The system implements database transactions to prevent race conditions during concurrent ticket purchases—a critical requirement for real-world booking systems.
Key Features
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

Tech Stack
Backend:

Node.js
Express.js 4.x
SQLite3 (with transaction support)
express-session (authentication)

Frontend:

EJS templating engine
HTML5/CSS3
Vanilla JavaScript

API Endpoints
Authentication

GET /login - Display login page
POST /login - Handle login submission
GET /register - Display registration page
POST /register - Create new manager account
GET /auth-fail - Authentication failure page

Manager/Organizer Routes (Protected)

GET /organiser - Manager dashboard
GET /create-event - Event creation form
POST /create-event - Submit new event
GET /edit-event/:id - Edit event form
POST /edit-event/:id - Update event
POST /delete-event/:id - Delete event
POST /publish-event/:id - Publish event
GET /site-settings - Site settings page
POST /update-settings - Update site settings

Attendee/Public Routes

GET / - Home page
GET /attendee - Browse published events
GET /event/:id - View event details
GET /buy-tickets/:id - Ticket purchase form
POST /purchase/:id - Process ticket purchase
GET /purchase/success - Purchase success page
GET /purchase/fail - Purchase failure page

Utility Routes

GET /users/list-users - List all users (example route)

Total: 29 API endpoints
🔒 Security Features

Session-Based Authentication

express-session middleware
Server-side session storage
Protected manager routes


Input Validation

Server-side validation for all forms
Type checking (parseInt, parseFloat)
Required field validation


SQL Injection Prevention

Parameterized queries throughout
No string concatenation in SQL


Session Security

Secret key configuration
Secure cookie settings (configurable for HTTPS)


Authorization

Route-level access control
Session-based role checking
Real-World Applications
This architecture can be adapted for:

Concert/theatre ticket sales
Conference registration systems
Restaurant reservation platforms
Workshop/class booking systems
Resource scheduling (meeting rooms, equipment)
Limited inventory e-commerce

Why Transaction Handling Matters
In any system handling limited resources (tickets, seats, inventory), race conditions are a real concern:

Without transactions: Two simultaneous bookings for the last ticket both succeed → overbooking
With transactions: Database ensures only one succeeds → data integrity maintained

This pattern is critical in:

Financial systems (preventing double-charges)
Inventory management (preventing overselling)
Booking systems (preventing double-bookings)
Learning Outcomes
Technical Skills Demonstrated

Database Management: Schema design, foreign keys, transactions
Backend Development: RESTful API design, routing, middleware
Authentication: Session management, password security
Concurrency: Race condition prevention, atomic operations
Error Handling: Graceful degradation, user feedback
MVC Architecture: Separation of concerns, code organization

Engineering Principles Applied

ACID Compliance: Atomicity, Consistency, Isolation, Durability
DRY Principle: Code reusability through functions and routes
Security First: Input validation, SQL injection prevention
User Experience: Clear feedback, error messages, confirmation pages

Metrics

Lines of Code: 829 (backend JavaScript)
API Endpoints: 29
Database Tables: 4
Transaction Handlers: 1 (critical booking path)
Protected Routes: 8 (manager-only)
Public Routes: 10 (attendee access)

Known Limitations

Password Security: Currently stores passwords in plain text. Production version should use bcrypt/scrypt hashing.
No Rate Limiting: Vulnerable to brute force attacks on login.
SQLite Limitations: Not suitable for high-traffic production (use PostgreSQL/MySQL for scale).
No Email Confirmation: Booking confirmations not sent via email.
Session Storage: In-memory sessions don't persist across server restarts (use Redis/MongoDB for production)
Developed as coursework project for Web Development module, demonstrating:

Full-stack development capabilities
Database transaction handling
Production-grade architectural patterns
Security best practices
User workflow design

Key Learning: Understanding the importance of ACID properties in transactional systems, particularly in scenarios with concurrent access and limited resources.
Meetali Mandhare
Computer Science Student | ML/AI Specialization
University of London
