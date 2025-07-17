# TUI Budgeter

**WebTUI Hackathon Submission**

TUI Budgeter is a terminal-inspired personal finance tracker built with Next.js.  
Manage your transactions quickly with keyboard shortcuts, real-time sync, and CSV export.

## Features
- Add, edit, and delete transactions
- Dashboard with balance and stats
- CSV export
- Keyboard shortcuts and command input
- Clerk authentication
- MongoDB Atlas backend
- Real-time sync via Pusher

## Getting Started

1. Clone the repo
2. Create a `.env.local` file and add your keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   MONGODB_URI=your_mongodb_atlas_uri
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the app:
   ```bash
   npm run dev