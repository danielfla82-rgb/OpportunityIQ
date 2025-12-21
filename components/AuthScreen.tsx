
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Loader2, Mail, ArrowRight, ShieldCheck, Database, HardDrive, CloudLightning, CloudOff, AlertCircle } from 'lucide-react';

interface Props {
  onDemoLogin?: () => void;
}

const AuthScreen: React.FC<Props> = ({ onDemoLogin }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      } else {
        setSent(true);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      let msg = err.message || "Falha ao conectar.";
      
      // Translate common Supabase errors for better UX
      if (msg.includes("Error sending confirmation email")) {
         msg = "Erro no envio de email (Limite de API ou SMTP). Use o Modo Offline.";
      } else if (msg.includes("Signups not allowed")) {
         msg = "Novos cadastros estão desativados. Use o Modo Offline.";
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
      <div className="noise-bg"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-800 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl text-slate-900 mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
             O
           </div>
           <h1 className="text-4xl font-serif text-white mb-2">OpportunityIQ</h1>
           <p className="text-slate-400">Sistema Operacional de Decisão</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
           {errorMsg && (
              <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 mb-4 flex items-start gap-2 animate-fade-in">
                 <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                 <div className="flex-1">
                    <p className="text-sm text-red-200 font-medium">{errorMsg}</p>
                    <button 
                       onClick={onDemoLogin} 
                       className="text-xs text-red-300 underline mt-1 hover:text-white"
                    >
                       Entrar agora com Modo Offline
                    </button>
                 </div>
              </div>
           )}

           {!sent ? (
             <>
               {isSupabaseConfigured ? (
                 <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                       <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">Acesso Nuvem (Sincronizado)</label>
                       <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          </div>
                          <input 
                            type="email"
                            required
                            className="block w-full pl-10 bg-slate-950 border border-slate-700 rounded-xl py-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                          />
                       </div>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Receber Link Mágico"}
                       {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                 </form>
               ) : (
                 <div className="text-center pb-6">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                       <CloudOff className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-serif text-white mb-2">Cloud Desconectada</h3>
                    <p className="text-slate-400 text-sm">Use o modo offline para continuar.</p>
                 </div>
               )}

               <div className="mt-8 pt-6 border-t border-slate-800/50">
                 <button 
                   onClick={onDemoLogin}
                   className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium py-3 rounded-xl transition-all border border-slate-700/50 hover:border-slate-600 flex items-center justify-center gap-2 text-sm"
                 >
                    <HardDrive className="w-4 h-4" /> 
                    {isSupabaseConfigured ? "Entrar em Modo Offline (Sem Login)" : "Entrar em Modo Offline"}
                 </button>
               </div>
             </>
           ) : (
             <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-serif text-white mb-2">Link Enviado</h3>
                <p className="text-slate-400 text-sm mb-6">
                   Enviamos um link mágico para <strong>{email}</strong>.<br/>
                   Clique nele para inicializar o sistema.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setSent(false)}
                    className="text-emerald-400 text-sm hover:underline block w-full"
                  >
                    Usar outro email
                  </button>
                  <button 
                    onClick={onDemoLogin}
                    className="text-slate-500 text-sm hover:text-white transition-colors block w-full"
                  >
                    Ou entre em Modo Offline
                  </button>
                </div>
             </div>
           )}
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-8 flex items-center justify-center gap-2">
           v5.2.3 <span className="w-1 h-1 bg-slate-600 rounded-full"></span> 
           {isSupabaseConfigured ? (
             <span className="flex items-center gap-1 text-emerald-500/80"><CloudLightning className="w-3 h-3" /> Online</span>
           ) : (
             <span className="flex items-center gap-1 text-amber-500/80"><Database className="w-3 h-3" /> Local</span>
           )}
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
