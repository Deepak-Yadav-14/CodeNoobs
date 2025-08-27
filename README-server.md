Server (C/C++ compile) setup

1. Install server dependencies:

   cd server
   npm install

2. Ensure system has `gcc` and `g++` available in PATH.

3. Start server:

   npm start

4. During development you can run both frontend and backend:

   # from project root

   npm install
   npm run server:dev # starts server with nodemon
   npm run dev # starts vite

Or use the combined script (requires concurrently installed):
npm run dev:all

Security note: This is a minimal example. For production use sandboxing (containers), resource limits, authentication, and input sanitization.
