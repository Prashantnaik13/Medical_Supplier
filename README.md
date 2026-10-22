# Medora Supply Co.

Medora Supply Co. is a local-development starter for a single-supplier medical-supplies website. It has a React website, a Node/Express API, Sequelize models, a MySQL database, and JWT login.

> **Important:** This is a software starter, not a tax, medical-device, or regulatory certification. Do not put patient or clinical records in this app. Get qualified advice on GST invoices, privacy, product compliance, and payments before production use.

## First, understand the folders

| Folder/file | What it is for | Commands you run there |
|---|---|---|
| Project folder (`medora-supply/`) | Installs the shared npm workspace dependencies and starts the local MySQL container. | `npm install`; `docker compose ...` |
| `backend/` | Node/Express API, database models, routes, controllers, migrations, and seed data. | `npm run dev`, `npm run db:migrate`, `npm run seed` |
| `frontend/` | React website served by Vite. | `npm run dev`, `npm run build` |

**Important:** Do not start the app with `npm run dev` from the project folder. Start the backend from `backend/` and the website from `frontend/` in two separate terminals. The one-time `npm install` and Docker database commands are run from the project folder because the npm workspaces and Compose file live there.

**Where to start each terminal:** First open a terminal in the folder named `medora-supply` (the folder containing the main `package.json`). Unless a step says otherwise, commands such as `cd backend` or `cd frontend` assume the terminal starts there. For every new terminal, go back to `medora-supply` first, then enter the folder shown in that step.

## What the app includes

- Public storefront, sign-in, and buyer self-registration.
- Four role workspaces: platform admin, supplier/operations, buyer, and warehouse/delivery.
- Product and service catalogues, cart and checkout, orders, inventory, and PDF invoices.
- Team invitations, customers, profile/settings, and an admin panel.
- Interactive coverage and delivery map with selectable locations and OpenStreetMap direction links. Live vehicle GPS tracking and live map tiles are not included.
- In-app notifications. Email is simulated/logged until you configure SMTP.
- Optional Razorpay payment hooks. Real payments need Razorpay credentials.

## Requirements

- Node.js **20.19 or newer** (or **22.12 or newer**) and npm.
- For the full app only: Docker Desktop / Docker Engine with Docker Compose, or a compatible MySQL 8 server.

## Option A — open the frontend demo (no database)

The demo uses sample data saved in your browser. It does not need MySQL or the backend API.

### 1. Install dependencies once

Open a terminal in the project folder (the folder containing the main `package.json`) and run:

```bash
npm install
```

This only installs dependencies; it does **not** start the app.

### 2. Configure and start the frontend

In the same terminal:

```bash
cd frontend
cp .env.example .env
npm run dev
```

Leave this terminal open. Open the Vite address shown in the terminal, usually **http://localhost:5173**. The example frontend settings use demo mode (`VITE_DEMO_MODE=true`). Use the profile menu to preview the different roles.

To reset demo edits, clear browser entries beginning with `medora:` or use a private browser window.

## Option B — run the full app with MySQL

Follow these steps to run the website and API separately. Keep each terminal open while using the app.

### 1. Install dependencies once

From the project folder—the folder containing the main `package.json`—run:

```bash
npm install
```

If you already followed Option A and installed dependencies, skip this step.

### 2. Start the MySQL database

From the project folder, run:

```bash
cp .env.example .env
docker compose up -d mysql
docker compose ps
```

Wait until MySQL shows **healthy** before starting the API. The root `.env` file contains local-only credentials for Docker. The backend's example settings already use the matching database name, username, and password.

### 3. Set up the backend environment

Open a new terminal, go to the `backend/` folder, and copy its example settings:

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` in a text editor and change `JWT_SECRET` to a private random value of at least 24 characters. To generate one, run this from the project folder:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `JWT_SECRET` in `backend/.env`. For a local first run, keep these settings:

```env
DB_AUTO_SYNC=true
SEED_DEMO=true
```

They create the development tables and sample accounts when the API starts. These settings and demo accounts are for local development only—not production.

### 4. Set up the frontend to use the backend

Open another terminal, go to the `frontend/` folder, and copy its example settings:

```bash
cd frontend
cp .env.example .env
```

Open `frontend/.env` and set:

```env
VITE_DEMO_MODE=false
VITE_API_BASE_URL=/api
```

This setting is important: if `VITE_DEMO_MODE=true`, the website uses browser demo data instead of the API. Restart Vite after changing this file.

### 5. Start the backend API — terminal 1

In the backend terminal, make sure the current folder is `backend/`, then run:

```bash
npm run dev
```

Leave this terminal open. The API runs at **http://localhost:4000**. Its health check is **http://localhost:4000/health**.

### 6. Start the website — terminal 2

In the frontend terminal, make sure the current folder is `frontend/`, then run:

```bash
npm run dev
```

Leave this terminal open. Open **http://localhost:5173**. The website sends API requests through Vite to the backend on port 4000.

The first API startup creates the local database tables and sample data when `DB_AUTO_SYNC=true` and `SEED_DEMO=true` are set.

### Demo API logins

Use the password `medora-demo` for these local sample accounts:

| Role | Email |
|---|---|
| Platform admin | `ananya@medora.demo` |
| Supplier / operations | `rahul@medora.demo` |
| Clinic / hospital buyer | `meera@westsideclinic.demo` |
| Warehouse / delivery | `arjun@medora.demo` |

Do not use these accounts or passwords in production.

## Optional — use SQL migrations instead of automatic schema setup

For local migration testing, first make sure MySQL is running. Edit `backend/.env` and set:

```env
DB_AUTO_SYNC=false
SEED_DEMO=false
```

Then open a terminal in `backend/` and run:

```bash
npm run db:migrate
npm run seed
```

After that, start the API with `npm run dev` from `backend/` and the website with `npm run dev` from `frontend/`, as described above. The migration runner records applied SQL files in `schema_migrations`. Add a new numbered SQL migration for every schema change. Do not use Sequelize `sync({ alter: true })` on production data.

## Useful commands by folder

### Project folder (`medora-supply/`)

Run once to install all workspace dependencies:

```bash
npm install
```

Start or stop the local MySQL container here:

```bash
docker compose up -d mysql
docker compose ps
docker compose down
```

`docker compose down` keeps your database data. To delete the local database too, use `docker compose down -v`.

### Backend folder (`backend/`)

```bash
npm run dev          # start the API in development mode
npm run db:sync      # create missing local database tables from Sequelize models
npm run db:migrate   # apply pending SQL migration files
npm run seed         # add local sample accounts and data
npm start            # run the API without the development file watcher
```

### Frontend folder (`frontend/`)

```bash
npm run dev          # start the website at http://localhost:5173
npm run build        # build the website for release
```

To stop a running API or website, press **Ctrl+C** in that service's terminal.

## If something does not work

- **The API cannot connect to MySQL:** run `docker compose ps` from the project folder and wait until MySQL is healthy. Check that the database values in `backend/.env` match the root `.env` values.
- **The API says `JWT_SECRET` is missing or too short:** set a private value at least 24 characters long in `backend/.env`, then restart the API.
- **The website still shows demo data:** set `VITE_DEMO_MODE=false` in `frontend/.env`, then stop and restart the frontend.
- **Port 5173 or 4000 is already in use:** stop the other app using that port, then try again.
- **You edited an `.env` file but nothing changed:** restart the relevant service. Vite reads frontend environment variables when it starts.

## Checks and production notes

Build the website from the `frontend/` folder:

```bash
npm run build
```

Check dependencies from the project folder (the folder containing the main `package.json`):

```bash
npm audit --audit-level=moderate
```

Check backend JavaScript syntax from the `backend/` folder:

```bash
find src -type f -name '*.js' -print0 | xargs -0 -n1 node --check
```

Before production, arrange a security review, database backups and monitoring, payment webhooks/refunds, email retries, delivery GPS integration if needed, and legal/accounting review of GST and privacy requirements.
