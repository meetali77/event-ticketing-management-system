/**
 * index.js
 * This is your main app entry point
 */

// Set up express, body-parser, and EJS
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session"); // Add this

// Session middleware must be set up before any routes
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if using https
  })
);

// Set EJS as the view engine
app.set("view engine", "ejs"); // Add this line to set EJS as the view engine

// Make Express serve the file outside of the 'public' folder
app.use(
  "/js",
  express.static(path.join(__dirname, "path_to_index.js_directory"))
);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add JSON parsing middleware
app.set("view engine", "ejs"); // Set the app to use EJS for rendering
app.use(express.static(path.join(__dirname, "public"))); // Set location of static files

// Set up SQLite
global.db = new sqlite3.Database("./database.db", function (err) {
  if (err) {
    console.error(err);
    process.exit(1); // Bail out if we can't connect to the DB
  } else {
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); // Enable foreign key constraints
  }
});

// Serve the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Serve the site-setting page
app.get("/site-settings", (req, res) => {
  const query = `SELECT site_name, site_description FROM site_settings ORDER BY id DESC LIMIT 1`;

  global.db.get(query, (err, row) => {
    if (err) {
      console.error("Error fetching site settings:", err.message);
      return res.status(500).send("Error retrieving site settings.");
    }
    res.render("site-setting", {
      site_name: row ? row.site_name : "Default Site Name",
      site_description: row ? row.site_description : "Default description.",
    });
  });
});

// This is where you handle the form submission from the frontend
app.post("/update-settings", (req, res) => {
  const { site_name, site_description } = req.body;

  // Ensure that site_name and site_description are being passed correctly
  if (!site_name || !site_description) {
    return res.status(400).send("Both site name and description are required");
  }

  const query = `INSERT INTO site_settings (site_name, site_description) VALUES (?, ?)`;

  global.db.run(query, [site_name, site_description], function (err) {
    if (err) {
      console.error("Error inserting site settings:", err.message);
      return res.status(500).send("Error saving site settings.");
    }

    // After saving, redirect back to the organiser page or show a success message
    res.redirect("/organiser");
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Remove the duplicate and fix the /create-event GET route
app.get("/create-event", (req, res) => {
  // Check if user is logged in (add this if needed)
  // if (!req.session.managerId) {
  //     return res.redirect('/login');
  // }

  res.render("create-event"); // Just render the form, no need to fetch events here
});

// Handle the event creation (POST) with better error handling
app.post("/create-event", (req, res) => {
  const {
    event_name,
    event_description,
    event_date,
    venue,
    tickets_available,
    ticket_price,
  } = req.body;

  // Map form fields to database columns
  const name = event_name;
  const description = event_description;

  console.log("Received form data:", req.body); // Debug log

  // Ensure the tickets_available is parsed as an integer
  const ticketsAvailable = parseInt(tickets_available, 10);
  // Ensure the ticket_price is parsed as a float
  const ticketPrice = parseFloat(ticket_price);

  console.log("Parsed values:", { ticketsAvailable, ticketPrice }); // Debug log

  // Validate form fields
  if (
    !event_name ||
    !event_description ||
    !event_date ||
    isNaN(ticketsAvailable) ||
    isNaN(ticketPrice)
  ) {
    console.log("Validation failed:", {
      event_name: !!event_name,
      event_description: !!event_description,
      event_date: !!event_date,
      ticketsAvailable: !isNaN(ticketsAvailable),
      ticketPrice: !isNaN(ticketPrice),
    });
    return res
      .status(400)
      .send("All fields are required and must have valid values.");
  }

  // Column names match the database schema: name, description, event_date, tickets_available, ticket_price
  const query = `INSERT INTO events (name, description, event_date, venue, tickets_available, ticket_price, publish_date) 
                   VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;

  console.log("Executing query:", query);
  console.log("With values:", [
    event_name,
    event_description,
    event_date,
    ticketsAvailable,
    ticketPrice,
  ]);

  db.run(
    query,
    [
      event_name,
      event_description,
      event_date,
      venue,
      ticketsAvailable,
      ticketPrice,
    ],
    function (err) {
      if (err) {
        console.error("Database error details:", err); // More detailed error logging
        console.error("Error message:", err.message);
        console.error("Error code:", err.code);
        return res.status(500).send(`Error creating event: ${err.message}`);
      }

      console.log("Event created successfully with ID:", this.lastID);
      res.redirect("/organiser");
    }
  );
});

// Handle event deletion (POST)
app.post("/delete-event/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM events WHERE id = ?`;
  db.run(query, [id], function (err) {
    if (err) {
      console.error("Error deleting event:", err.message);
      return res.status(500).send("Error deleting event.");
    }
    res.redirect("/organiser");
  });
});

// Consolidated organiser route
app.get("/organiser", (req, res) => {
  // Check if user is logged in
  if (!req.session.managerId) {
    return res.redirect("/login");
  }

  const settingsQuery = `SELECT site_name, site_description FROM site_settings ORDER BY id DESC LIMIT 1`;
  const eventsQuery = `SELECT * FROM events ORDER BY publish_date DESC`;
  const managerQuery = `SELECT * FROM managers WHERE id = ?`;

  db.all(eventsQuery, (err, events) => {
    if (err) {
      console.error("Events query error:", err);
      return res.status(500).send("Error retrieving events.");
    }

    db.get(settingsQuery, (err, siteSettings) => {
      if (err) {
        console.error("Settings query error:", err);
        return res.status(500).send("Error retrieving site settings.");
      }

      db.get(managerQuery, [req.session.managerId], (err, manager) => {
        if (err) {
          console.error("Manager query error:", err);
          return res.status(500).send("Error retrieving manager info.");
        }

        console.log("Session manager ID:", req.session.managerId);
        console.log("Manager data:", manager);

        const viewData = {
          manager: manager || {
            id: req.session.managerId,
            name: req.session.managerName,
          },
          site_name: siteSettings
            ? siteSettings.site_name
            : "Default Site Name",
          site_description: siteSettings
            ? siteSettings.site_description
            : "Default Description",
          events: events || [],
        };

        res.render("organiser", viewData);
      });
    });
  });
});

// Route to display the Edit Event page with current event details
app.get("/edit-event/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM events WHERE id = ?`;

  db.get(query, [id], (err, event) => {
    if (err) {
      console.error("Error fetching event:", err.message);
      return res.status(500).send("Error retrieving event.");
    }

    if (!event) {
      return res.status(404).send("Event not found.");
    }

    res.render("edit-event", { event: event });
  });
});

// Route to handle updating an event
app.post("/edit-event/:id", (req, res) => {
  const { id } = req.params;
  const {
    event_name,
    event_description,
    event_date,
    tickets_available,
    ticket_price,
  } = req.body;

  // Map form fields to database columns
  const name = event_name;
  const description = event_description;

  const ticketsAvailable = parseInt(tickets_available, 10);
  const ticketPrice = parseFloat(ticket_price);

  if (
    !event_name ||
    !event_description ||
    !event_date ||
    isNaN(ticketsAvailable) ||
    isNaN(ticketPrice)
  ) {
    return res
      .status(400)
      .send("All fields are required and must have valid values.");
  }

  const query = `
        UPDATE events 
        SET name = ?, description = ?, event_date = ?, tickets_available = ?, ticket_price = ?
        WHERE id = ?
    `;

  db.run(
    query,
    [name, description, event_date, ticketsAvailable, ticketPrice, id],
    function (err) {
      if (err) {
        console.error("Error updating event:", err.message);
        return res.status(500).send("Error updating event.");
      }

      res.redirect("/organiser");
    }
  );
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Route to publish an event
app.post("/publish-event/:id", (req, res) => {
  const { id } = req.params;
  const publishDate = new Date().toISOString(); // Current date and time

  const query = `UPDATE events SET is_published = 1, publish_date = ? WHERE id = ?`;

  global.db.run(query, [publishDate, id], function (err) {
    if (err) {
      console.error("Error publishing event:", err.message);
      return res.status(500).send("Error publishing event.");
    }

    res.redirect("/organiser"); // Redirect to organiser page to see the updated list
  });
});

// Route to delete a published event
app.post("/delete-published-event/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM events WHERE id = ? AND is_published = 1`; // Only delete if the event is published

  global.db.run(query, [id], function (err) {
    if (err) {
      console.error("Error deleting event:", err.message);
      return res.status(500).send("Error deleting event.");
    }

    res.redirect("/organiser"); // Redirect back to the organiser page
  });
});

// Route to handle unpublishing an event (set is_published to false)
app.post("/unpublish-event/:id", (req, res) => {
  const { id } = req.params;

  // Update the event to mark it as unpublished
  const query = `UPDATE events SET is_published = 0 WHERE id = ?`;

  global.db.run(query, [id], function (err) {
    if (err) {
      console.error("Error unpublishing event:", err.message);
      return res.status(500).send("Error unpublishing event.");
    }

    res.redirect("/organiser"); // Redirect back to the organiser page
  });
});

app.post("/organiser/publish", (req, res) => {
  const eventId = req.body.id;
  const currentTime = new Date().toISOString(); // Get current date and time in ISO format

  // Update the event's publish_date and set is_published to true (1)
  db.run(
    "UPDATE events SET is_published = 1, publish_date = ? WHERE id = ?",
    [currentTime, eventId],
    function (err) {
      if (err) {
        console.error("Error updating event:", err);
        return res.status(500).send("Error updating event");
      }

      console.log(`Event ${eventId} published at: ${currentTime}`);

      // Redirect to the organiser page after publishing
      res.redirect("/organiser");
    }
  );
});

app.get("/organiser", (req, res) => {
  db.all("SELECT * FROM events WHERE is_published = 1", (err, events) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).send("Error fetching events");
    }

    // Pass events data to the view
    res.render("organiser", { events });
  });
});

app.get("/attendee", (req, res) => {
  db.all(
    "SELECT * FROM events WHERE is_published = 1 ORDER BY publish_date DESC",
    (err, events) => {
      if (err) {
        console.error("Error fetching events:", err);
        return res.status(500).send("Error fetching events");
      }

      res.render("attendee", { events });
    }
  );
});

// Route to render attendee.ejs
app.get("/attendee", (req, res) => {
  res.render("attendee"); // Ensure attendee.ejs exists in the 'views' directory
});

// Route to render the Attendee Home Page (attendee.ejs)
app.get("/attendee", (req, res) => {
  const query = "SELECT * FROM events WHERE is_published = 1";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching events:", err.message);
      res.status(500).send("Error fetching events");
    }

    const formattedEvents = rows.map((event) => {
      if (event.event_date) {
        const dateObj = new Date(event.event_date);
        event.formatted_date = dateObj.toLocaleDateString("en-US", {
          dateStyle: "medium",
        });
      } else {
        event.formatted_date = "TBD";
      }
      return event;
    });

    res.render("attendee", { events: formattedEvents }); // Render the attendee.ejs page
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Route to display the event details and a form to buy tickets
// app.get("/event-tix/:id", (req, res) => {
//   const eventId = req.params.id;

//   db.get("SELECT * FROM tickets WHERE id = ?", [eventId], (err, event) => {
//     if (err) {
//       console.error("Error fetching event:", err);
//       return res.status(404).send("Error fetching event");
//     }

//     if (!event) {
//       return res.status(500).send("Event not found");
//     }
//   });
// });

// Route to handle ticket purchase
app.post("/purchase/:id", (req, res) => {
  const eventId = req.params.id;
  const quantity = parseInt(req.body.quantity);
  const attendeeName = req.body.name;

  if (!attendeeName || quantity <= 0 || isNaN(quantity)) {
    console.log("❌ Invalid input detected");
    return res.redirect("/purchase/fail");
  }

  // Step 1: Check event availability
  const eventQuery = `SELECT * FROM events WHERE id = ?`;
  db.get(eventQuery, [eventId], (err, event) => {
    if (err || !event) {
      console.log("❌ Event not found");
      return res.status(404).send("Event not found.");
    }

    if (Number(event.tickets_available) < Number(quantity)) {
      console.log(
        `❌ Not enough tickets. Requested: ${quantity}, Available: ${event.tickets_available}`
      );
      return res.redirect("/purchase/fail");
    }

    // Step 2: Update tickets and log booking in transaction
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // Reduce tickets
      //   const updateTickets = `UPDATE events SET tickets_available = tickets_available - ? WHERE id = ?`;
      //   db.run(updateTickets, [quantity, eventId]);

      // Log booking
      const insertBooking = `
                INSERT INTO bookings (event_id, attendee_name, tickets_booked)
                VALUES (?, ?, ?)
            `;
      db.run(insertBooking, [eventId, attendeeName, quantity], (err2) => {
        if (err2) {
          db.run("ROLLBACK");
          return res.status(500).send("Booking failed.");
        }
        const updateQuery = `UPDATE events SET tickets_available = tickets_available - ?
        WHERE id = ?
        `;
        db.run(updateQuery, [quantity, eventId], function (err3) {
          if (err3) {
            console.error("❌ Ticket count update failed:", err3);
            return res.status(500).send("Failed to update ticket count.");
          }
        });
        db.run("COMMIT", (commitErr) => {
          if (commitErr) {
            return res.status(500).send("Transaction failed");
          }
          return res.redirect("/purchase/success");
        });
      });
    });
  });
});

// POST route to handle ticket purchase
// app.post("/buy-tixs/:id", (req, res) => {
//   const eventId = req.id;
//   const ticketsToBuy = parseInt(req.tickets);

//   db.get("SELECT * FROM buy WHERE id = ?", [req.Id], (err, event) => {
//     if (err) {
//       console.error("Error fetching event:", err);
//       return res.redirect("/attendee");
//     }

//     if (!event) {
//       return res.redirect("/attendee");
//     }

//     if (ticketsToBuy > event.tickets_available) {
//       return res.redirect("/attendee");
//     }
//     const TixAvailable = event.tix_available - tixToBuy;

//     db.run(
//       "SELECT * purchase SET tickets_available = ? WHERE id = ?",
//       [TixAvailable],
//       function (err) {
//         if (err) {
//           console.error("Error updating tickets:", err);
//           return console.redirect("/attendee");
//         }
//         res.redirect("/attendee");
//       }
//     );
//   });
// });

// Route to display the buy ticket page for a specific event
app.get("/buy-tickets/:id", (req, res) => {
  const eventId = req.params.id;

  const query = "SELECT * FROM events WHERE id = ? AND is_published = 1";
  db.get(query, [eventId], (err, event) => {
    if (err || !event) {
      console.error("Error fetching event:", err?.message);
      return res.status(404).send("Event not found");
    }

    res.render("buy-ticket", { event }); // Renders buy-ticket.ejs
  });
});

// // Route to handle ticket purchase
// app.post("/buy/:id", (req, res) => {
//   db.get("SELECT * FROM Buy WHERE id = ?", [eventId], (err, event) => {
//     if (err || !event) {
//       return res.status(500).send("Event not found");
//     }

//     if (event.tickets_available != quantity) {
//       return res.redirect("/purchase-fail");
//     }

//     db.run(
//       "UPDATE e-purchase SET tickets_available = ? WHERE id = ?",
//       function (err) {
//         if (err) {
//           return res.status(500).send("Error updating tickets");
//         }
//         res.redirect("/purchase-pass");
//       }
//     );
//   });
// });

// Route to handle successful purchase and show confirmation page
app.get("/purchase/success", (req, res) => {
  res.render("purchase-pass");
});

// Route to handle failed ticket purchase (e.g., insufficient tickets)
app.get("/purchase/fail", (req, res) => {
  res.render("purchase-fail");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Login page route
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle login form submission
// Login route handler
// Then modify your login route:
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM managers WHERE name = ? AND password = ?",
    [username, password],
    (err, manager) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error");
      }

      if (manager) {
        // Store manager info in session
        req.session.managerId = manager.id;
        req.session.managerName = manager.name;

        // Log to verify session data
        console.log("Session data:", req.session);

        const settingsQuery = `SELECT site_name, site_description FROM site_settings ORDER BY id DESC LIMIT 1`;
        const eventsQuery = `SELECT * FROM events ORDER BY publish_date DESC`;

        db.all(eventsQuery, (err, events) => {
          if (err) {
            return res.status(500).send("Error retrieving events.");
          }

          db.get(settingsQuery, (err, siteSettings) => {
            if (err) {
              return res.status(500).send("Error retrieving site settings.");
            }

            const viewData = {
              manager: manager,
              site_name: siteSettings
                ? siteSettings.site_name
                : "Default Site Name",
              site_description: siteSettings
                ? siteSettings.site_description
                : "Default Description",
              events: events || [],
            };

            res.render("organiser", viewData);
          });
        });
      } else {
        res.redirect("/auth-fail");
      }
    }
  );
});

// Authentication fail route
app.get("/auth-fail", (req, res) => {
  res.render("auth-fail");
});

// Register page route
app.get("/register", (req, res) => {
  res.render("register");
});

// Handle registration form submission
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Insert new manager into database
  db.run(
    "INSERT INTO managers (name, password) VALUES (?, ?)",
    [username, password],
    (err) => {
      if (err) {
        return res.status(500).send("Registration failed");
      }
      // Redirect to login page after successful registration
      res.redirect("/login");
    }
  );
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Serve static files from the 'img' directory
app.use("/img", express.static(path.join(__dirname, "img")));

// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require("./routes/users");
app.use("/users", usersRoutes);

// Make the web application listen for HTTP requests
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
