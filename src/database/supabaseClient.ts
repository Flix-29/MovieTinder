import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    "https://pszjkfcllfuiicnjqimk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzemprZmNsbGZ1aWljbmpxaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDQ3NTcsImV4cCI6MjA1Njc4MDc1N30.7uziq2NeyrbqMFHb-cT17juNy8JT-8bnC09EFExxdP4"
)