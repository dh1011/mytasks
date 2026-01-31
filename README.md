# MyTasks

A cross-platform task management app built with React Native and Expo, featuring PostgreSQL remote database support.

## Features

- ✅ Create, complete, and delete tasks
- 🗄️ Local storage with AsyncStorage
- 🐘 Optional PostgreSQL remote database sync
- 🎨 Modern dark theme UI with grid background
- 📱 Works on iOS, Android, and Web

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker (for PostgreSQL integration tests)

### Installation

```bash
npm install
```

### Running the App

```bash
# Web
npm run web

# iOS
npm run ios

# Android
npm run android
```

## Testing

```bash
# Unit tests (mocked, no database needed)
npm run test:unit

# Integration tests (requires PostgreSQL container)
docker compose up -d
npm run test:integration
```

## Backend Setup

The app uses a **PostgREST** compatible backend (PostgreSQL + PostgREST). You can run this locally or use a managed service like Supabase.

### Option 1: Local Development (Docker)

The easiest way to run the backend locally is using Docker Compose. This will start a PostgreSQL database and a PostgREST server.

1. Start the services:
   ```bash
   docker compose up -d
   ```
2. The database will be automatically initialized with the necessary tables and roles via `db/init.sql`.
3. The PostgREST API will be available at `http://localhost:3001`.

### Option 2: Supabase

If you prefer to use Supabase, you need to manually create the table and policies since Supabase does not use our local `init.sql`.

1. Create a new Supabase project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Run the following SQL to create the table and enable access:

   ```sql
   -- 1. Create the table
   CREATE TABLE IF NOT EXISTS tasks (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       title TEXT NOT NULL,
       completed BOOLEAN NOT NULL DEFAULT FALSE,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   -- 2. Create the index
   CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

   -- 3. Enable public access (simplest for this demo)
   -- Note: Supabase enables RLS by default. We'll disable it for simplicity here,
   -- or you can add policies for 'anon' role.
   ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
   ```

### Connecting the App

1. Open the App.
2. Click the ⚙️ icon in the top header.
3. Enter your connection details:
   - **Local**: 
     - API URL: `http://localhost:3001`
     - Anon Key: (Leave empty for local PostgREST unless configured)
   - **Supabase**: 
     - API URL: `https://<your-project>.supabase.co/rest/v1`
     - Anon Key: `<your-anon-public-key>`

## Project Structure

```
├── App.tsx                 # Main app component
├── components/             # React components
├── hooks/                  # Custom React hooks
├── services/               # Backend services
├── types/                  # TypeScript types
├── __tests__/              # Unit tests
└── scripts/                # Integration test scripts
```

## License

MIT
