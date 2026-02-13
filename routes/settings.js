const express = require('express');
const router = express.Router();

// Endpoint to fetch current site settings
router.get('/', (req, res) => {
    const query = `SELECT site_name, site_description FROM site_settings ORDER BY id DESC LIMIT 1`;

    global.db.get(query, (err, row) => {
        if (err) {
            console.error("Error fetching site settings:", err.message);
            res.status(500).send("Error retrieving site settings.");
        } else {
            res.json(row || { site_name: "Default Site Name", site_description: "Default Description" });
        }
    });
});

// Endpoint to update site settings
router.post('/update', (req, res) => {
    const { site_name, site_description } = req.body;

    if (!site_name || !site_description) {
        res.status(400).json({ error: "Both fields are required." });
        return;
    }

    const query = `INSERT INTO site_settings (site_name, site_description) VALUES (?, ?)`;

    global.db.run(query, [site_name, site_description], function (err) {
        if (err) {
            console.error("Error updating site settings:", err.message);
            res.status(500).json({ error: "Error saving site settings." });
        } else {
            res.json({ success: true });
        }
    });
});

module.exports = router;
