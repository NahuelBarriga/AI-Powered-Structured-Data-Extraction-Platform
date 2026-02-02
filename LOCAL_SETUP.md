# Local Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git**

## Project Structure

This is a full-stack application with:
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS v4

---

## Backend Setup

### 1. Navigate to the Backend Directory
```bash
cd project1/Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `project1/Backend/` directory based on `.env.example`:

```bash
# API Configuration
API_PORT=3000

# JWT Configuration
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/FinConectaDB"

# LLM Provider (Options: 'openai', 'gemini', 'groq', 'mock')
LLM_PROVIDER='groq'
GROQ_API_KEY='your-groq-api-key'
GROQ_MODEL='openai/gpt-oss-120b'

# Token Limits
MAX_TOKENS_PER_USER='10000'
MAX_INPUT_LENGTH='10000'
MAX_TOKEN_PER_REQUEST='300'

# Rate Limiting
RATE_LIMIT_MINUTE=10
RATE_LIMIT_HOUR=100
RATE_LIMIT_DAY=1000
```

### 4. Setup Database

Make sure PostgreSQL is running, then run the Prisma migrations:

```bash
npm run prisma migrate deploy
```

Optionally, seed the database:
```bash
npm run prisma db seed
```

### 5. Start the Backend Server
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

---

## Frontend Setup

### 1. Navigate to the Frontend Directory
```bash
cd project1/Frontend/ai_object_extractor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables (if needed)

Create a `.env.local` file in `project1/Frontend/ai_object_extractor/` if you need to customize the API endpoint:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Start the Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:4000`

---

## Running Both Services

### Option 1: Separate Terminals
- **Terminal 1**: Run the backend
  ```bash
  cd project1/Backend
  npm run dev
  ```
  
- **Terminal 2**: Run the frontend
  ```bash
  cd project1/Frontend/ai_object_extractor
  npm run dev
  ```

### Option 2: Using VS Code
- Open multiple VS Code terminals and run both commands above

---

## Build & Production

### Build Backend
```bash
cd project1/Backend
npm run build
npm start
```

### Build Frontend
```bash
cd project1/Frontend/ai_object_extractor
npm run build
npm start
```

---

## Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL is running on your machine
- Verify the `DATABASE_URL` in `.env` matches your PostgreSQL credentials
- Default: `postgresql://postgres:password@localhost:5432/FinConectaDB`

### Port Already in Use
- Backend default: `3000` (change with `API_PORT` in `.env`)
- Frontend default: `4000` (configured in `package.json`)

### Tailwind CSS Not Working
- Ensure you've run `npm install` in the frontend directory
- The project uses Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- Styles are imported via `@import "tailwindcss"` in `src/app/globals.css`

### Dependencies Issues
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Clear npm cache: `npm cache clean --force`

---

## Technology Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **OpenAI/Groq** - LLM integration

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Axios** - HTTP client

---

## Contributing

Before making changes:
1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally by running both services
4. Commit: `git commit -m "feat: description"`
5. Push: `git push origin feature/your-feature`

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `API_PORT` | Backend server port | `3000` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `LLM_PROVIDER` | AI provider to use | `groq`, `openai`, `gemini`, `mock` |
| `GROQ_API_KEY` | Groq API key | `your-groq-key` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | `your-openai-key` |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | `your-gemini-key` |
| `MAX_TOKENS_PER_USER` | Maximum tokens per user | `10000` |
| `MAX_INPUT_LENGTH` | Maximum input text length | `10000` |
| `MAX_TOKEN_PER_REQUEST` | Maximum tokens per request | `300` |
| `RATE_LIMIT_MINUTE` | Requests per minute | `10` |
| `RATE_LIMIT_HOUR` | Requests per hour | `100` |
| `RATE_LIMIT_DAY` | Requests per day | `1000` |

### Frontend (.env.local)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |

---

## Quick Start

For a quick start with default settings:

```bash
# Terminal 1: Backend
cd project1/Backend
npm install
npm run dev

# Terminal 2: Frontend
cd project1/Frontend/ai_object_extractor
npm install
npm run dev
```

Then open:
- Frontend: http://localhost:4000
- Backend API: http://localhost:3000
