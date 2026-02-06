# Backend Final Project

Production-ready Full-Stack application built with Node.js/Express + MongoDB and a frontend served from the backend
Includes JWT Authentication, CRUD, relational integrity in MongoDB, and RBAC

## Live Demo
- Render URL: (https://backend-final-nvus.onrender.com/#/notes)

## Features

- Relational integrity in MongoDB:
  - Notes are linked to Users (owner)
  - Notes are linked to Categories
- RBAC:
  - Only the admin has access to all users' notes
  - Regular users can manage only their own notes

### 2) Frontend Integration
- Login/Registration UI
- Stores JWT token and uses it for authorized requests
- Dynamic updates using Fetch API + DOM updates
- Responsive UI

### 3) Deployment
- Deployed on Render

### Run Locally
npm install
node server.js
# open http://localhost:3000

### Auth
Register
POST /auth/register
Body:
{ "email": "user@test.com", "password": "12345678" }

Register Admin
POST /auth/register
Header:
x-admin-secret: <106CM>
Body:
{ "email": "admin@test.com", "password": "12345678" }

Login
POST /auth/login
Body:
{ "email": "user@test.com", "password": "123456" }

Current User
GET /auth/me
Header:
Authorization: Bearer <TOKEN>
