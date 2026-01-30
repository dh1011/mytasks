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

## Database Configuration

The app supports connecting to any PostgreSQL-compatible database:
- PostgreSQL
- Supabase
- CockroachDB

Click the ⚙️ icon in the app to configure your database connection.

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
