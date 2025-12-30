
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DE AMBIENTE ---
// ATENÇÃO: Credenciais injetadas conforme solicitação.
// URL e Chave fornecidas pelo usuário.

const HARDCODED_URL = "https://mqoxwkgsyrpntzylwdvg.supabase.co";
const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3h3a2dzeXJwbnR6eWx3ZHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjczMjUsImV4cCI6MjA4MjcwMzMyNX0.M776RiZ3awXR33IWQJDbs6aUoN-ieUQtqaFB_QK9WP0";

// Tenta pegar do Vite (import.meta.env) ou fallback para process.env
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return '';
};

// Prioriza as chaves fornecidas hardcoded, depois tenta variáveis de ambiente
const SUPABASE_PROJECT_URL = HARDCODED_URL || getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = HARDCODED_KEY || getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// ----------------------------------------

export const isSupabaseConfigured = 
  !!SUPABASE_PROJECT_URL && 
  SUPABASE_PROJECT_URL.length > 0 &&
  !!SUPABASE_ANON_KEY && 
  SUPABASE_ANON_KEY.length > 0 &&
  !SUPABASE_PROJECT_URL.includes('placeholder');

// Inicialização do Cliente com opções robustas para OAuth
export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_PROJECT_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true // CRÍTICO: Permite que o Supabase leia o token na URL após o retorno do Google
    }
  }
);
