
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Loader2, Mail, Lock, LogIn, UserPlus, AlertTriangle, Terminal, Key, Copy, X, Activity, ArrowRight, Zap } from 'lucide-react';

interface Props {
  onDemoLogin?: () => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP';

const AuthScreen: React.FC<Props> = ({ onDemoLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // SUPABASE CONFIG
  const supabaseUrl = (supabase as any).supabaseUrl || "";
  const projectId = supabaseUrl.split('https://')[1]?.split('.')[0] || "se_projeto";
  const callbackUrl = `https://${projectId}.supabase.co/auth/v1/callback`;

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg("Erro na conexão Google. Verifique o console.");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'SIGNUP') {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) setConfirmationSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      let msg = err.message || "Falha na autenticação.";
      if (msg.includes("Invalid login")) msg = "Credenciais inválidas.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617] font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
         <img 
            src="https://i.postimg.cc/C1NN6wt7/Gemini-Generated-Image-pwcfvpwcfvpwcfvp.png" 
            alt="Zeus Background" 
            className="w-full h-full object-cover filter contrast-125 brightness-75 scale-105 animate-pulse-slow"
            style={{ animationDuration: '20s' }}
         />
         {/* Gradient Overlay for Text Readability */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
         <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
         
         {/* Noise Texture */}
         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* 2. DIAGNOSTICS MODAL */}
      {showDiagnostics && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
           <div className="w-full max-w-lg border border-emerald-900 bg-black/50 p-6 font-mono text-xs">
              <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-2">
                 <span className="text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Diagnóstico de Rede
                 </span>
                 <button onClick={() => setShowDiagnostics(false)}><X className="w-5 h-5 text-emerald-700 hover:text-white" /></button>
              </div>
              <div className="space-y-4 text-emerald-100/70">
                 <p>Callback URL para Google Cloud:</p>
                 <div className="flex bg-emerald-950/30 border border-emerald-900/50 p-2">
                    <code className="flex-1 break-all">{callbackUrl}</code>
                    <button onClick={() => navigator.clipboard.writeText(callbackUrl)}><Copy className="w-4 h-4 hover:text-white" /></button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 3. MAIN CONTENT - BRUTALIST CENTER CARD */}
      <div className="relative z-10 w-full max-w-md px-6">
         
         {/* HEADER */}
         <div className="text-center mb-10 animate-fade-in-up">
            <h1 className="text-8xl md:text-9xl font-serif text-white tracking-tighter leading-none mb-2 mix-blend-overlay opacity-90">
               ZEUS
            </h1>
            <div className="flex items-center justify-center gap-3">
               <div className="h-px w-8 bg-emerald-500"></div>
               <p className="text-emerald-400 uppercase tracking-[0.4em] text-[10px] font-bold shadow-emerald-500/50 drop-shadow-lg">
                  Sistema Operacional v6.0
               </p>
               <div className="h-px w-8 bg-emerald-500"></div>
            </div>
         </div>

         {/* FORM CONTAINER */}
         <div className="bg-black/40 backdrop-blur-md border-y border-white/10 p-8 md:p-10 shadow-2xl animate-fade-in space-y-8">
            
            {/* ERROR MESSAGE */}
            {errorMsg && (
               <div className="bg-red-500/10 border-l-2 border-red-500 p-3 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                     <p className="text-xs text-red-200">{errorMsg}</p>
                     <button onClick={() => setShowDiagnostics(true)} className="text-[10px] text-red-400 hover:text-white underline mt-1">Debug</button>
                  </div>
               </div>
            )}

            {confirmationSent ? (
               <div className="text-center py-8">
                  <div className="inline-flex p-4 border border-emerald-500/30 rounded-full mb-4 bg-emerald-500/10">
                     <Mail className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-serif text-xl mb-2">Confirme seu Acesso</h3>
                  <p className="text-slate-400 text-sm mb-6">Link enviado para {email}</p>
                  <button onClick={() => setConfirmationSent(false)} className="text-xs text-white underline decoration-emerald-500 underline-offset-4 hover:text-emerald-400 uppercase tracking-widest">Voltar</button>
               </div>
            ) : (
               <>
                  {/* GOOGLE LOGIN */}
                  {isSupabaseConfigured && (
                     <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white hover:bg-emerald-400 text-black font-bold h-12 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] group"
                     >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                           <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12.5S6.42 23 12.1 23c5.83 0 10.16-4.1 10.16-10.16 0-.75-.06-1.52-.15-2.24z"/></svg>
                        )}
                        Continuar com Google
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                     </button>
                  )}

                  <div className="relative flex items-center py-2 opacity-50">
                     <div className="flex-grow border-t border-slate-600"></div>
                     <span className="flex-shrink-0 mx-4 text-[10px] text-slate-400 uppercase tracking-widest">Credenciais</span>
                     <div className="flex-grow border-t border-slate-600"></div>
                  </div>

                  {/* EMAIL FORM - LINE STYLE */}
                  <form onSubmit={handleEmailAuth} className="space-y-6">
                     <div className="group relative">
                        <Mail className="absolute left-0 bottom-3 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                           type="email" 
                           required 
                           placeholder="EMAIL CORPORATIVO"
                           className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition-colors font-mono text-sm uppercase"
                           value={email}
                           onChange={e => setEmail(e.target.value)}
                        />
                     </div>
                     <div className="group relative">
                        <Lock className="absolute left-0 bottom-3 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                           type="password" 
                           required 
                           minLength={6}
                           placeholder="CHAVE DE ACESSO"
                           className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition-colors font-mono text-sm uppercase"
                           value={password}
                           onChange={e => setPassword(e.target.value)}
                        />
                     </div>

                     <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] disabled:opacity-50 mt-4 border border-transparent hover:border-emerald-300"
                     >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
                        {mode === 'LOGIN' ? "Iniciar Sessão" : "Criar Registro"}
                     </button>
                  </form>
               </>
            )}

            {/* FOOTER ACTIONS */}
            <div className="flex justify-between items-center pt-2">
               <button onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-wider transition-colors">
                  {mode === 'LOGIN' ? "Solicitar Acesso" : "Voltar ao Login"}
               </button>
               <button onClick={onDemoLogin} className="text-[10px] text-slate-500 hover:text-emerald-400 uppercase tracking-wider transition-colors flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Modo Demo
               </button>
            </div>
         </div>

         {/* STATUS BAR */}
         <div className="text-center mt-12 opacity-40">
            <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em] font-mono">
               Acesso Seguro • Encriptação 256-bit • {isSupabaseConfigured ? 'Online' : 'Offline'}
            </p>
         </div>
      </div>
    </div>
  );
};

export default AuthScreen;
