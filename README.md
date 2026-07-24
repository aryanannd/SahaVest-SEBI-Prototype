# SahaVest - Project Scaffolding

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Setup Instructions
1. Install dependencies in the root, frontend, and backend folders:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Setup environment variables:
   Copy the `.env.example` files in both `frontend/` and `backend/` to `.env` and fill in the required values.

3. Run the development servers concurrently:
   ```bash
   npm run dev
   ```

   This will start both:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Structure
- `/frontend` - React + TypeScript + Vite + Tailwind CSS
- `/backend` - Node.js + Express + TypeScript
- `/screens` - Reference static HTML UI mockups
- `/reference` - Technical specs and master plan
