# ⚡ CrystalTides Web Server (Backend)

The core backend API for the **CrystalTides SMP** platform. It handles authentication, game data processing, payments, and integrations with external services (Discord, Twitch, Minecraft).

## 🏗️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express / Custom (TypeScript)
- **Database**: Supabase (PostgreSQL) & MySQL (Game Data)
- **Authentication**: Supabase Auth
- **Integrations**:
  - Google Calendar (Events)
  - Pterodactyl (Server Control)
  - Twitch API (Clips & Auth)

## 📂 Project Structure

- `controllers/`: Request handlers.
- `routes/`: API endpoint definitions.
- `services/`: Business logic and external API clients.
- `middleware/`: Auth and validation layers.
- `schemas/`: Zod validation schemas.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

See `.env.example` for the required configuration keys. You will need credentials for Supabase, Google Cloud, and Twitch.

### Development

```bash
# Start dev server
npm run dev
```

### Build

```bash
npm run build
```
