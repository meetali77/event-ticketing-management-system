# Event Ticketing Management System

Full-stack event booking platform with role-based authentication supporting organizer and attendee workflows.

## 🎯 Overview

Complete event management system with dual-user interface, real-time inventory validation, and secure session-based authentication.

## ✨ Features

- **Dual User Roles**: Separate organizer (admin) and attendee (public) interfaces
- **Event CRUD**: Create, read, update, delete, publish events
- **Ticket Booking**: Multiple pricing tiers (full-price, concession)
- **Inventory Management**: Real-time validation prevents overbooking
- **Session Auth**: express-session middleware for security

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with promise-based queries
- **Frontend**: EJS templating
- **Architecture**: MVC pattern

## 📊 Technical Details

- 11+ RESTful API endpoints
- 3 relational database tables with foreign keys
- 1,100+ lines of code
- Promise-based async/await patterns

## 📁 Database Schema
events (id, title, description, date, pricing, published status)
bookings (id, event_id, attendee_name, ticket_type, quantity)
settings (id, site_name, site_description)
## Author

Meetali Mandhare - CS Student specializing in ML/AI
