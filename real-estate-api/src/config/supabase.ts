import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Falta configuración de SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
