import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlizhqeoneaklarjvudt.supabase.co';
const supabaseAnonKey = 'sb_publishable_RX6xicC3MgdUNJB5NGlpyg_wseZ9p4V';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
