import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lyyymymdbxpxxtrsilpa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eXlteW1kYnhweHh0cnNpbHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjY3NzYsImV4cCI6MjA5NDk0Mjc3Nn0.h07vXZuUljpzSEUrJK4qcugmDDW9Uhxu6Sl3lzYlvHc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
