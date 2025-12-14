import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://kdghyuxvsrtcghtdmzvg.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZhNTUzMGUzLTkxMjYtNDAyZS1iYWMwLWNkNzI5ODcxMGQ2NiJ9.eyJwcm9qZWN0SWQiOiJrZGdoeXV4dnNydGNnaHRkbXp2ZyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY0ODczOTIzLCJleHAiOjIwODAyMzM5MjMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.TqeaPbw8cyHHXdzdFKoIu73DN-4QTtTw8Gn0A6RVf8I';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };