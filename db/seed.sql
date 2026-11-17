-- db/seed.sql
-- Initial data for the greetings table.

INSERT INTO greetings (text, language)
VALUES
    ('اهلا', 'ar'),
    ('Hello', 'en'),
    ('مرحبا', 'ar'),
    ('Bonjour', 'fr')
ON CONFLICT DO NOTHING;
