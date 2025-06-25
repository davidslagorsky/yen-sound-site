import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjpyojjgrfoqkbddygiil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHlvampncmZvcWtiZGR5Z2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzgxNjEsImV4cCI6MjA2NjQ1NDE2MX0.a6Sf-UwyBUDumCSI3k14UQEEe-iddzoXgs-bk8Np3Pw';

export const supabase = createClient(supabaseUrl, supabaseKey);
