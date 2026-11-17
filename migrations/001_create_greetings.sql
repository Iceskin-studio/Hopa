-- migrations/001_create_greetings.sql
-- Migration: create the greetings table and seed initial data.

BEGIN;

-- Table definition
CREATE TABLE greetings (
    id          SERIAL PRIMARY KEY,
    text        VARCHAR(255) NOT NULL,
    language    VARCHAR(10) NOT NULL DEFAULT 'ar',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for language look‑ups
CREATE INDEX idx_greetings_language ON greetings (language);

-- Seed data
INSERT INTO greetings (text, language)
VALUES
    ('اهلا', 'ar'),
    ('Hello', 'en');

COMMIT;
