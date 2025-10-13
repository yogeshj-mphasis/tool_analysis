// server.js
const express = require('express');
const app = express();
const port = 3000;
const db = require('./database');

// Configure Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // To parse form data

// --- C R U D   O P E R A T I O N S ---

// 1. READ: Display all employees (R)
app.get('/', (req, res) => {
    const sql = "SELECT * FROM employees ORDER BY id DESC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({"error": err.message});
            return;
        }
        // Render the index.ejs template and pass the employee data (rows) to it
        res.render('index', { employees: rows });
    });
});

// 2. CREATE: Add a new employee (C)
app.post('/add', (req, res) => {
    const { name, department, salary } = req.body;
    
    // Basic validation
    if (!name || !department) {
        return res.status(400).send("Name and Department are required.");
    }

    const sql = 'INSERT INTO employees (name, department, salary) VALUES (?, ?, ?)';
    const params = [name, department, parseFloat(salary) || 0];

    db.run(sql, params, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Employee added with ID: ${this.lastID}`);
        res.redirect('/'); // Go back to the list
    });
});

// 3. UPDATE: Edit an existing employee (U)
app.post('/update/:id', (req, res) => {
    const id = req.params.id;
    const { name, department, salary } = req.body;

    // Basic validation
    if (!name || !department) {
        return res.status(400).send("Name and Department are required for update.");
    }
    
    const sql = 'UPDATE employees SET name = ?, department = ?, salary = ? WHERE id = ?';
    const params = [name, department, parseFloat(salary) || 0, id];

    db.run(sql, params, function(err) {
        if (err) {
            return console.error(err.message);
        }
        if (this.changes === 0) {
            console.log(`No employee found with ID ${id} to update.`);
        } else {
            console.log(`Employee ${id} updated.`);
        }
        res.redirect('/'); // Go back to the list
    });
});

// 4. DELETE: Remove an employee (D)
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM employees WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            return console.error(err.message);
        }
        if (this.changes === 0) {
            console.log(`No employee found with ID ${id} to delete.`);
        } else {
            console.log(`Employee ${id} deleted.`);
        }
        res.redirect('/'); // Go back to the list
    });
});


// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});