# HouseTab Mobile App

A React Native CLI mobile app for managing house expenses and teams. This project includes a **React Native** frontend, a **Node.js/Express backend**, and a **MySQL database**. Docker is included for easy local development.

-------------------

## Table of Contents

[Requirements](#requirements)
[Setup](#setup)
[Running the App](#running-the-app)
[Project Structure](#project-structure)
[Environment Variables](#environment-variables)

------------

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
Copy the `.env.example` in the backend folder and edit with your configuration:
'cp backend/.env.example backend/.env'
**Example** `.env`: (Needs Updates)

---------------

## Running the App

**1. Start Backend + MySQL (Docker)**
```
cd backend
docker compose up
```
- Backend API will be available at `http://localhost:3000`
- MySQL database credentials are defined in `.env`

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
- Ensure `API_URL` in `mobile/.env` points to your backend (use your host IP if on device):
`API_URL=http://192.168.1.100:3000`
- If `npm ci` fails due to file locks (EBUSY), close Android Studio, VS Code, and any Metro terminals, then retry.

--------------------

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
├─ mobile/          # Next.js / React frontend
│  ├─ __tests__/    # jest tests
│  ├─ android/
│  ├─ ios/
│  ├─ src/
│  ├─ .env
│  ├─ .env.example
│  ├─ .env
│  ├─ .App.tsx
│  ├─ package-lock.json
│  └─ package.json
├─ .gitignore
├─ docker-compose.yml
└─ README.md
```

## Environment Variables
