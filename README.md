# Immanuel's Store - E-Commerce Platform

A full-stack MERN e-commerce application (React + Vite + Tailwind on the front, Node/Express + MongoDB on the back) with real-time updates via Socket.io, JWT authentication, cart, wishlist, orders and an admin dashboard.

Based in Nairobi, Kenya. Prices are in KSh, VAT is 16%.

## Setup

### 1. Backend
```bash
cd server
npm install
```
Edit `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/manuDB
JWT_SECRET=a_long_random_secret
```
Create the admin user, then start the API:
```bash
node seedAdmin.js
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173

Admin login: admin@immanuelstore.com / Immanuel@2026 (change it after first login)

## Author
**Immanuel** - Nairobi, Kenya
