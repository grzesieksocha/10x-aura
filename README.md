# Aura (MVP)

## Project Description

Aura (MVP) is a responsive web application designed to help users efficiently manage their personal budgets. The application focuses on manual tracking of incomes, expenses, and transfers across multiple financial accounts. Users can categorize expenses, plan budgets on a monthly or yearly basis, and benefit from an intuitive overview of their financial health through dashboards and analytics.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, Authentication, Backend-as-a-Service)
- **Tools:** ESLint, Prettier, GitHub Actions for CI/CD, DigitalOcean for hosting

## Getting Started Locally

1. **Prerequisites:**

   - Ensure you have [Node.js](https://nodejs.org/) installed (refer to the version specified in the `.nvmrc` file).

2. **Clone the repository:**

   ```bash
   git clone https://github.com/grzesieksocha/10x-aura
   cd 10x-aura
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build locally.
- `npm run lint` - Runs ESLint to analyze the code for issues.
- `npm run lint:fix` - Automatically fixes linting issues where possible.
- `npm run format` - Formats the code using Prettier.

## Testing

- **Unit Tests**: Vitest - Fast unit testing framework compatible with Vite
- **Component Tests**: React Testing Library - Testing React components with user-centric approach
- **E2E Tests**: Playwright - Cross-browser end-to-end testing framework
- **API Mocking**: MSW (Mock Service Worker) - API mocking for tests
- **Coverage**: Built-in Vitest coverage reporting

## Project Scope

Aura (MVP) includes the following core features:

- **Account Management:**

  - Add, view, and delete multiple financial accounts with initial balances.
  - Automatic balance calculation based on initial balance and associated transaction history.

- **Transaction Management:**

  - Record incomes, expenses, and transfers (with appropriate paired entries for transfers).
  - Assign categories to transactions to track spending and budget adherence.

- **Budgeting:**

  - Plan monthly or yearly budgets by manually entering expected incomes and expenses.
  - Visual comparison of planned versus actual spending using color indicators.

- **Analytics and Dashboard:**

  - Overview of total balance across all accounts.
  - Detailed transaction history for individual accounts.
  - Graphical representations (e.g., pie charts) of expense distribution by category.

- **User Authentication:**
  - Secure registration and login functionality using email and password.

This MVP focuses on manual data entry and provides a streamlined experience without the complexity of automatic bank integrations.

## Project Status

This project is currently in the MVP phase and is under active development. Contributions, bug reports, and feature suggestions are welcome.

## License

This project is licensed under the MIT License.
