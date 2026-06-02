# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps + prisma generate + migrate
npm run dev          # Dev server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest (all tests)
npm run db:reset     # Force-reset and re-migrate the SQLite database
```

After changing `prisma/schema.prisma`, run:
```bash
npx prisma migrate dev    # creates migration + regenerates client
npx prisma generate       # regenerate client without migrating
```

The `NODE_OPTIONS='--require ./node-compat.cjs'` prefix in all scripts is required for Prisma + Next.js compatibility on Node — do not remove it.

## Architecture

**UIGen** is an AI-powered React component generator. The user describes a component in chat; Claude generates JSX/TSX files into a virtual file system; the browser renders them live in an iframe.

### Core data flow

1. User sends a message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. API streams text via Vercel AI SDK using two tools: `str_replace_editor` and `file_manager`
3. Tools write to a `VirtualFileSystem` instance (in-memory, never touches disk)
4. The VFS serializes to a plain object and is sent back in the stream
5. Client-side, `FileSystemContext` holds the current VFS state
6. `PreviewFrame` transforms files client-side with `@babel/standalone`, creates blob URLs, builds an import map, and injects it into an `<iframe srcdoc>`
7. Third-party npm packages in the preview resolve to `https://esm.sh/<package>`

### Key modules

| Path | Purpose |
|---|---|
| `src/lib/file-system.ts` | `VirtualFileSystem` class — all file ops (create, update, delete, rename, serialize/deserialize) |
| `src/lib/transform/jsx-transformer.ts` | Babel transform → blob URLs → import map → preview HTML |
| `src/lib/provider.ts` | `getLanguageModel()` — returns real `claude-haiku-4-5` or `MockLanguageModel` when no API key |
| `src/lib/auth.ts` | JWT sessions via `jose` + httpOnly cookies (`server-only`) |
| `src/lib/tools/str-replace.ts` | AI SDK tool wrapping VFS string-replace operations |
| `src/lib/tools/file-manager.ts` | AI SDK tool wrapping VFS create/delete/rename |
| `src/lib/prompts/generation.tsx` | System prompt injected at the start of every chat request |
| `src/lib/contexts/` | `FileSystemContext` and `ChatContext` — React state shared across the UI |
| `src/actions/` | Next.js server actions for project CRUD |
| `src/middleware.ts` | Protects `/api/projects` and `/api/filesystem` routes (JWT required) |

### Database (Prisma + SQLite)

The database schema is defined in `prisma/schema.prisma` — reference it whenever you need to understand the structure of data stored in the database.

Two models: `User` (email + bcrypt password) and `Project` (belongs to optional user). Both `messages` and `data` (VFS snapshot) are stored as JSON strings. The generated client lives in `src/generated/prisma/`.

### Auth

Custom JWT auth via `jose`. `getSession()` is server-only (reads cookies). `verifySession()` is used in middleware (reads from `NextRequest`). Anonymous users can use the app; persistence requires signing up. JWT secret defaults to `"development-secret-key"` in dev.

### Mock provider

When `ANTHROPIC_API_KEY` is absent, `MockLanguageModel` streams static hardcoded components (Counter, Card, ContactForm). `maxSteps` is reduced to 4 in mock mode.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Falls back to mock provider without it |
| `JWT_SECRET` | No | Defaults to `"development-secret-key"` in dev |
