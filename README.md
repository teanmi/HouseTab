# HouseTab Mobile App

A React Native CLI mobile app for managing house expenses and teams. This project includes a **React Native** frontend, a **Node.js/Express backend**, and a **MySQL database**. It supports both **local Docker development** and **Railway deployment** for the backend + MySQL database.

---

## Table of Contents

[Requirements](#requirements)
[Setup](#setup)
[Running the App](#running-the-app)
[Railway Deployment](#railway-deployment)
[Project Structure](#project-structure)
[Environment Variables](#environment-variables)

---

## Requirements

Make sure the following are installed on your system:

- nvm (Node Version Manager) – recommended to manage Node versions
  - Windows: https://github.com/coreybutler/nvm-windows?tab=readme-ov-file
  - Linux: https://github.com/nvm-sh/nvm
- Node.js 20 (should include npm 10+ and npx)
  - Install using Command line with nvm (`nvm install 20`)
- Java 17+ (required for some backend tasks, if applicable)
  - https://adoptium.net/temurin/releases/?version=17&os=any&arch=any
- Android Studio (if building mobile components)
  - https://developer.android.com/studio
- Docker (for containerized development)
  - https://developer.android.com/studio

## Setup

**1. Clone the repository:**

```
git clone https://github.com/teanmi/HouseTab.git
cd housetab
```

**2. Install Node via NVM (Node Version Manager):**

- Make sure nvm is installed:
- Install and use Node.js v20:

```
nvm install 20
nvm use 20
node -v    # should show v20.x.x
npm -v     # should show npm 10.x.x
```

**3. Install dependencies:**
**Frontend:**

```
cd mobile
npm ci
```

**Backend:**

```
cd ../backend
npm ci
```

**4. Set up environment variables:**
Copy `backend/.env.example` to `backend/.env` and fill in Railway test/prod MySQL values.

For local testing against Railway test DB, set `DB_TARGET=test`.
Use `DB_TARGET=prod` only when you intentionally want production writes.

---

## Running the App

**1. Start Backend (Docker)**

```
docker compose up --build
```

- Backend API will be available at `http://localhost:3000`
- Backend reads Railway DB credentials from `backend/.env`
- This compose setup does **not** run a local MySQL container

**2. Start Metro Bundler (React Native)**

```
cd ../mobile
npx react-native dev
```

- Keep this terminal open — it serves your JavaScript bundle to the emulator or device.

**3. Run Android App**

- Open a Pixel 5 emulator via Android Studio, or connect a physical device.
- In a separate terminal:

```
cd mobile
npx react-native run-android
```

- App will build and launch on the device/emulator.

**4. Notes**

- For Windows + WSL users: Metro Bundler can run in WSL, Android Studio must run in Windows.
- In development, the mobile app uses localhost automatically.
- In production builds, update `mobile/src/config.ts` so `API_BASE_URL` matches your Railway backend URL.
- If `npm ci` fails due to file locks (EBUSY), close Android Studio, VS Code, and any Metro terminals, then retry.

## Railway Deployment

**Backend service**

- Create a Railway service for the `backend` folder.
- Set the start command to `npm start`.
- Railway will inject `PORT`; the server already listens on `0.0.0.0`.

**MySQL service**

- Add a Railway MySQL database service.
- Use scoped values in backend env:
  - `MYSQL_TEST_URL` or `MYSQL_TEST_HOST` / `MYSQL_TEST_PORT` / `MYSQL_TEST_USER` / `MYSQL_TEST_PASSWORD` / `MYSQL_TEST_DATABASE`
  - `MYSQL_PROD_URL` or `MYSQL_PROD_HOST` / `MYSQL_PROD_PORT` / `MYSQL_PROD_USER` / `MYSQL_PROD_PASSWORD` / `MYSQL_PROD_DATABASE`

**Required backend variables**

- `JWT_SECRET`
- `DB_TARGET` (`test` or `prod`)
- Test scope: `MYSQL_TEST_HOST`, `MYSQL_TEST_PORT`, `MYSQL_TEST_USER`, `MYSQL_TEST_PASSWORD`, `MYSQL_TEST_DATABASE`
- Prod scope: `MYSQL_PROD_HOST`, `MYSQL_PROD_PORT`, `MYSQL_PROD_USER`, `MYSQL_PROD_PASSWORD`, `MYSQL_PROD_DATABASE`
- Optional per-scope URL: `MYSQL_TEST_URL` or `MYSQL_PROD_URL`
- Optional: `MYSQL_SSL=true` if your Railway MySQL connection requires SSL

**Mobile app**

- After Railway deploys your backend, copy its public URL.
- Update `mobile/src/config.ts` and replace `https://your-backend.up.railway.app` with your real Railway backend URL.
- Rebuild the mobile app so login/register requests go to Railway instead of localhost.

---

## Project Structure

```
housetab/
├─ backend/         # Node.js/Express backend
│  ├─ src/
│  ├─ Dockerfile
│  ├─ .env
│  ├─ .env.example
│  ├─ package-lock.json
│  └─ package.json
├─ mobile/          # React Native frontend
│  ├─ __tests__/    # jest tests
│  ├─ android/
│  ├─ ios/
│  ├─ src/
│  ├─ App.tsx
│  ├─ package-lock.json
│  └─ package.json
├─ .gitignore
├─ docker-compose.yml
└─ README.md
```

## Environment Variables

Backend variables are defined in `backend/.env.example`.

For Railway, prefer these:

```
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
DB_TARGET=test

MYSQL_TEST_HOST=
MYSQL_TEST_PORT=3306
MYSQL_TEST_USER=
MYSQL_TEST_PASSWORD=
MYSQL_TEST_DATABASE=

MYSQL_PROD_HOST=
MYSQL_PROD_PORT=3306
MYSQL_PROD_USER=
MYSQL_PROD_PASSWORD=
MYSQL_PROD_DATABASE=
MYSQL_SSL=false
```

You can also use one of these URL-based variables instead of individual fields:

```
MYSQL_TEST_URL=
MYSQL_PROD_URL=
```
