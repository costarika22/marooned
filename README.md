# Marooned

A simple full-stack starter project for a mini game called **Marooned**.

## Tech Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Styling: Tailwind CSS
- Language: JavaScript only
- Package manager: npm

## Project Structure

```text
marooned/
  client/
  server/
  package.json
  README.md
```

## Ports

- Frontend: `5173`
- Backend: `3001`

## First-Time Setup

From the project root, run:

```bash
npm run setup
```

This installs:

- the root package
- the backend packages
- the frontend packages

## Run the App

From the project root, run:

```bash
npm run dev
```

That starts both apps together:

- React frontend at `http://localhost:5173`
- Express backend at `http://localhost:3001`

## Helpful Commands

Run only the backend:

```bash
npm run server
```

Run only the frontend:

```bash
npm run client
```

## What Is Included

- a simple Express server with CORS enabled for local development
- a starter React screen for **Marooned**
- Tailwind CSS already set up
- root scripts to make local development easy

## Notes

- No database
- No authentication
- No game logic yet
- This is only the initial scaffold
