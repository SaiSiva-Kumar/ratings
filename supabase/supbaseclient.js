import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://iyoyrujxcajqbelaqtdx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3lydWp4Y2FqcWJlbGFxdGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MzUzNDEsImV4cCI6MjA1MTQxMTM0MX0.8ltvqBWWt10hyTU_-L8QDmP-Uli0GKhA-xRXCWipYnU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);