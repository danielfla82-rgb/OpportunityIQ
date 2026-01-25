
/**
 * ARQUITETURA DE CONFIGURAÇÃO DE IA
 * Centraliza a gestão de chaves e estratégias de fallback.
 */

// Chave fornecida manualmente para fallback (Hardcoded conforme solicitação)
// NOTA DE SEGURANÇA: Em produção real, evite commitar chaves no código.
const FALLBACK_KEY = "AIzaSyCYQnFsbssa6-324JjV9nbMhAEriRrEpKE";

/**
 * Recupera a API Key com estratégia de prioridade:
 * 1. Variável de Ambiente (Vite/Process)
 * 2. Fallback Manual
 * 
 * Realiza limpeza (trim) para evitar erros comuns de colar com espaço.
 */
export const getGeminiApiKey = (): string => {
  let key = '';

  // Tenta recuperar do import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_API_KEY) {
    key = (import.meta as any).env.VITE_GOOGLE_API_KEY;
  }
  
  // Tenta recuperar do process.env (Node/Next/Polyfill)
  else if (typeof process !== 'undefined' && process.env?.API_KEY) {
    key = process.env.API_KEY;
  }

  // Fallback final
  else {
    key = FALLBACK_KEY;
  }

  return key ? key.trim() : '';
};

/**
 * Estratégia Smart Runner (Cascata de Modelos)
 * Prioridade: Gemini 3 Flash -> Gemini 3 Pro
 * Se o primeiro falhar (404/500), o sistema tenta o próximo automaticamente.
 */
export const MODEL_CASCADE = [
  'gemini-3-flash-preview',  // Primário: Rápido e inteligente
  'gemini-3-pro-preview',    // Fallback: Mais robusto
  'gemini-flash-latest'      // Legacy: Último recurso
];

export const SYSTEM_INSTRUCTIONS = {
  DEFAULT: "Você é Zeus, um estrategista estoico e brutalmente racional. Responda com precisão cirúrgica.",
  JSON_MODE: "Retorne APENAS JSON válido. Sem markdown, sem explicações adicionais."
};
