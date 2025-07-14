# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Additional AI instructions and specifications can be found in the `.ai/` and `.cursor/rules/` folders.

## Project Overview

Aura is a personal budget management web application built with Astro 5, React 19, TypeScript, and Supabase. The app allows users to track incomes, expenses, and transfers across multiple financial accounts with manual data entry. It features budgeting, analytics, and category management.

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## Tech Stack

- **Frontend**: Astro 5 (SSR), React 19, TypeScript 5, Tailwind CSS 4
- **UI Components**: Shadcn/ui (in `src/components/ui/`)
- **Backend**: Supabase (PostgreSQL, Authentication, BaaS)
- **Styling**: Tailwind CSS 4 with "new-york" variant and "neutral" color scheme
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner

## Architecture

### Directory Structure

```
src/
├── components/           # React components organized by feature
│   ├── ui/              # Shadcn/ui components
│   ├── auth/            # Authentication forms
│   ├── dashboard/       # Dashboard components
│   ├── accounts/        # Account management
│   ├── categories/      # Category management
│   └── hooks/           # Custom React hooks
├── pages/               # Astro pages and API routes
│   ├── api/             # API endpoints
│   └── *.astro          # Server-rendered pages
├── layouts/             # Astro layouts
├── lib/                 # Services and utilities
│   ├── services/        # Business logic services
│   ├── schemas/         # Zod validation schemas
│   └── hooks/           # Shared hooks
├── db/                  # Supabase client and types
├── middleware/          # Astro middleware
└── types.ts             # Shared TypeScript types
```

### Key Patterns

**Service Layer**: Business logic is extracted into services in `src/lib/services/` (AccountService, TransactionService, etc.)

**Authentication**: Uses Supabase Auth with SSR support via `@supabase/ssr`. Middleware handles authentication state and redirects.

**Data Flow**:

- API routes in `src/pages/api/` handle requests
- Services interact with Supabase
- React components use custom hooks for data fetching
- Balance calculations done in AccountService by aggregating transactions

**Component Structure**:

- Use Astro components (.astro) for static content
- Use React components (.tsx) only when interactivity is needed
- Follow existing component patterns with TypeScript interfaces

## Configuration

- **Path aliases**: `@/*` maps to `./src/*`
- **Server**: Configured for SSR with standalone Node.js adapter
- **Port**: Development server runs on port 3000
- **Supabase**: Environment variables required: `SUPABASE_URL`, `SUPABASE_KEY`

## Development Guidelines

### Code Style

- Use early returns for error conditions
- Handle errors at the beginning of functions
- Implement proper error handling with custom error messages
- Follow existing TypeScript patterns and interfaces
- Use Zod for API input validation

### Database

- Financial amounts stored as integers (cents) in database
- Balance calculations aggregate transactions: `income - expenses`
- Transfers create paired transactions between accounts
- All operations scoped to authenticated user via `user_id`

### UI Components

- Use Shadcn/ui components from `@/components/ui/`
- Install additional components with: `npx shadcn@latest add [component-name]`
- Follow Tailwind CSS 4 patterns with arbitrary values when needed
- Implement proper ARIA labels and accessibility features

### Authentication

- Protected routes redirect to `/login` via middleware
- User session available in `Astro.locals.user`
- Use `createSupabaseServerInstance` for server-side auth
- Auth forms use React hooks for state management

## Important Notes

- **Balance Calculation**: Account balances are computed by aggregating transaction amounts, not stored directly
- **Transaction Types**: "income" adds to balance, "expense" subtracts from balance
- **Transfers**: Create paired transactions between source and destination accounts
- **Error Handling**: Services throw errors with descriptive messages, caught by API routes
- **Type Safety**: Strong TypeScript usage with generated Supabase types in `database.types.ts`

## Testing

Check for existing test scripts in package.json. Currently no test framework is configured - verify testing approach before implementing tests.
