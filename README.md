Project README — Discovery Map (Next.js + React-Leaflet)

# Short summary
This repo is a Next.js app that renders a property discovery map using react-leaflet. The app currently contains a few UI/UX bugs and small functional issues. Your task is to run the app locally, locate the TODO tasks in the codebase (files called discovery-map.tsx and page.tsx), and apply sensible fixes. This README explains how to run the app, where the tasks are, recommended fixes (practical, minimal, and robust), and how to verify them.

## Quick start

Clone the repo (if not already done):

git clone [<repo-url>](https://github.com/trishna-ps/frontend-engineer-task.git)
cd frontend-engineer-task


# Install dependencies:
pnpm i

🔧 Environment Setup (Important)
Before running the development server, you must create a .env.local file in the project root and add this environment variable :
NEXT_PUBLIC_API_URL=http://localhost:{port_number}



# Start dev server:
pnpm run dev


# Open in browser:
http://localhost:3000


# Notes

This project uses pnpm. If you don’t have pnpm: npm i -g pnpm.

Node version: use a recent LTS (16.x / 18.x / 20.x). If you use nvm, run e.g. nvm use 18.



# Where the tasks live:

Open these files and look for the TODO comments at the top of the file:

components/discovery-map.tsx

src/app/page.tsx


## Submission
Create a new repo and send the URL via email.
