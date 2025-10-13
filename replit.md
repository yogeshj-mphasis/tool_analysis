# Employee CRUD Application

## Overview
A simple web-based Employee Management System built with Node.js, Express, EJS, and SQLite3. This application allows users to Create, Read, Update, and Delete (CRUD) employee records.

**Import Date:** October 13, 2025
**Status:** Configured for Replit environment

## Project Architecture

### Technology Stack
- **Backend:** Node.js with Express.js (v5.1.0)
- **Template Engine:** EJS (v3.1.10)
- **Database:** SQLite3 (v5.1.7)
- **Module Type:** CommonJS

### File Structure
```
/
├── server.js           # Main Express server
├── database.js         # SQLite database configuration
├── views/
│   └── index.ejs      # Main UI template
├── employee.sqlite     # SQLite database file
└── package.json       # Node.js dependencies
```

### Database Schema
**Table: employees**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `name` (TEXT, NOT NULL)
- `department` (TEXT)
- `salary` (REAL)

### Features
- **Create:** Add new employees with name, department, and salary
- **Read:** View all employees in a sortable table
- **Update:** Edit existing employee information inline
- **Delete:** Remove employees with confirmation dialog

### Recent Changes
- **Oct 13, 2025:** Initial import and Replit configuration
  - Updated server to run on port 5000 (Replit standard)
  - Changed host binding to 0.0.0.0 for external access
  - Added npm start script
  - Configured for Replit environment

### Configuration
- **Port:** 5000 (configurable via PORT environment variable)
- **Host:** 0.0.0.0 (allows external connections)
- **Database:** SQLite file-based (employee.sqlite)

## Development
- Start the server: `npm start`
- The application will be available at the Replit webview URL
