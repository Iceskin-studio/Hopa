# Arabic Greeting App — Database Extension

The original project serves a static page with the Arabic greeting **"اهلا"**.  
This addition introduces a **PostgreSQL** data layer so the application can:

- Store multiple greetings in different languages.
- Retrieve greetings via a future API (e.g., `/api/greetings`).
- Manage greetings (create / delete) through a service layer.

## Quick Start (Database)

1. **Install the PostgreSQL client library**

   ```bash
   npm install pg
   ```

2. **Create the database**

   ```bash
   createdb arabic_greeting
   ```

3. **Run the migration**

   ```bash
   psql -d arabic_greeting -f migrations/001_create_greetings.sql
   ```

4. **(Optional) Seed initial data**

   ```bash
   psql -d arabic_greeting -f db/seed.sql
   ```

5. **Configure environment variables**

   Copy `.env.example` to `.env` and adjust the `DB_*` values.

6. **Start the server**

   ```bash
   npm start
   ```

## Development & QA

### Environment Validation

The server now validates required environment variables at startup using
`utils/validateEnv.js`. If any required variable is missing, the process will
terminate with a clear error message.

### Running Tests

We added a small test suite to verify the environment validation logic.

```bash
# Install dev dependencies (if not already installed)
npm install --save-dev jest

# Run the test suite
npm test
```

The test suite lives in the `test/` directory and uses **Jest**. It checks that:

- No error is thrown when all required variables are present.
- An informative error is thrown when one or more variables are missing.

### Continuous Integration (Optional)

A basic CI workflow can be added (e.g., GitHub Actions) to run linting and tests
on every push. The `jest.config.js` file is already prepared for coverage
reporting.

---

Happy coding! 🚀
