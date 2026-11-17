# HouseTab Mobile App

A React Native CLI mobile app for managing house expenses and teams. This project includes a **React Native** frontend, a **Node.js/Express backend**, and a **PostgreSQL database**. It uses a local PostgreSQL instance for development and the same environment variables for hosted Postgres deployments.

---

## Table of Contents

[Requirements](#requirements)
[Setup](#setup)
[Running the App](#running-the-app)
[PostgresSQL](#PostgresSQL)
[Migrations](#migrations)
[Railway Deployment](#railway-deployment)
[Project Structure](#project-structure)
[Environment Variables](#environment-variables)

---

## Requirements

Make sure the following are installed on your system:

- nvm (Node Version Manager) – recommended to manage Node versions
  - Windows: https://github.com/coreybutler/nvm-windows?tab=readme-ov-file
  - Linux: https://github.com/nvm-sh/nvm
- Node.js 20
- PostgreSQL 16 client/server
  - https://www.postgresql.org/download/
- Java 17+ (required for some Android tooling)
- Android Studio (if building mobile components)

---

## Local PostgreSQL setup

1. Install PostgreSQL 16 and make sure `psql` is on your PATH.
2. Create a local database:

```bash
createdb housetab
```

3. Set the backend environment variables in `backend/.env`:

```dotenv
PORT=3000
JWT_SECRET=your-secret
AUTO_MIGRATE=true
DB_TARGET=local

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=housetab
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/housetab
```

4. Verify the local database works:

```bash
psql "host=localhost port=5432 dbname=housetab user=postgres password=postgres"
```

---

## Backend setup

From `backend/`:

```bash
npm install
npm run migrate:up
npm start
```

The backend listens on `http://localhost:3000` and uses the local PostgreSQL database configured in `backend/.env`.

---

## Migrations

From `backend/`:

```bash
npm run migrate:create --name=describe-change
npm run migrate:up
```

The migration system creates and tracks tables in PostgreSQL using the local database connection configured by `DATABASE_URL` or `POSTGRES_*` variables.

---

## Running the app

Start Metro Bundler:

```bash
cd mobile
npx react-native start
```

Then run the app:

```bash
cd mobile
npx react-native run-android
```

---

## PostgreSQL CLI notes

Use the CLI for direct inspection or manual tasks:

```bash
psql "host=localhost port=5432 dbname=housetab user=postgres password=postgres"
\dt
SELECT * FROM users;
```

If you want to create a fresh local database again:

```bash
dropdb --if-exists housetab
createdb housetab
```

---

## Deployment

The backend is still compatible with hosted Postgres services such as Railway or Supabase, using the same environment variables (`DATABASE_URL` or `POSTGRES_*`). Docker is no longer required for local development.
