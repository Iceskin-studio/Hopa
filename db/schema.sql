-- db/schema.sql
-- Central schema for the Arabic Greeting App.
-- Defines a single table to store multilingual greetings.

CREATE TABLE IF NOT EXISTS greetings (
    id          SERIAL PRIMARY KEY,
    text        VARCHAR(255) NOT NULL,
    language    VARCHAR(10)  NOT NULL DEFAULT 'ar',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index to speed up look‑ups by language
CREATE INDEX IF NOT EXISTS idx_greetings_language ON greetings (language);
