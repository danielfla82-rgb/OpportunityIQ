
import { createClient } from '@supabase/supabase-js';

// --- ÁREA DE CONFIGURAÇÃO DO OPERADOR ---
// Passo 1: Vá em Supabase > Settings > API
// Passo 2: Copie a "Project URL" e a "anon public key"
// Passo 3: Cole abaixo (mantenha as aspas)

const SUPABASE_PROJECT_URL = 'https://jteifpsethmwgesmxuhi.supabase.co' as string;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZWlmcHNldGhtd2dlc214dWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzg0NTYsImV4cCI6MjA4MTkxNDQ1Nn0.3QADRJgayD2rJwzm0ufUcXQn4SdGeye4burSP1Q4RZc' as string;

// ----------------------------------------

// Verificação de segurança para ativar/desativar o modo nuvem
export const isSupabaseConfigured = 
  SUPABASE_PROJECT_URL !== 'COLE_SUA_URL_AQUI' && 
  SUPABASE_PROJECT_URL.includes('supabase.co') &&
  SUPABASE_ANON_KEY !== 'COLE_SUA_KEY_AQUI';

// Inicialização do Cliente
export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_PROJECT_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-key'
);
