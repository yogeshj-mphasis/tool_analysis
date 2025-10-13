// database.js
const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = 'employee.sqlite';

// Open or create the database file
let db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error("Database connection error: " + err.message);
        throw err;
    } else {
        console.log('Connected to the Employee SQLite database.');
        // Create an 'employees' table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            department TEXT,
            salary REAL
        )`,
        (err) => {
            if (err) {
                console.error("Table creation error: " + err.message);
            } else {
                console.log('Employees table created or already exists.');
                // Ensure 'email' column exists; add it if missing for backward compatibility
                db.all("PRAGMA table_info(employees)", [], (infoErr, columns) => {
                    if (infoErr) {
                        console.error("Failed to read table info: " + infoErr.message);
                        return;
                    }
                    const hasEmailColumn = columns.some((column) => column.name === 'email');
                    if (!hasEmailColumn) {
                        db.run("ALTER TABLE employees ADD COLUMN email TEXT", (alterErr) => {
                            if (alterErr) {
                                console.error("Failed to add email column: " + alterErr.message);
                            } else {
                                console.log("Added 'email' column to employees table.");
                            }
                        });
                    }
                });
            }
        });
    }
});

module.exports = db;