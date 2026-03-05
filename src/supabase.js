import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctsrszcgupgondawghnj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3JzemNndXBnb25kYXdnaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Njk0MDIsImV4cCI6MjA4ODA0NTQwMn0.MD8cG-a1of2C1QtLLpoHx7Ajgyygd-waxnc7qIW5kY4';

export const supabase = createClient(supabaseUrl, supabaseKey);
