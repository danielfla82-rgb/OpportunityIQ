
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Loader2, Mail, ArrowRight, ShieldCheck, Database, HardDrive } from 'lucide-react';

interface Props {
  onDemoLogin?: () => void;
}

const AuthScreen: React.FC<Props> = ({ onDemoLogin }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
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
           {!isSupabaseConfigured ? (
             <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                   <Database className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-serif text-white mb-2">Cloud Não Configurada</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                   O banco de dados externo não foi detectado. Você pode rodar o sistema em <strong>Modo Demo (Local)</strong> para testar as funcionalidades.
                </p>
                <button 
                  onClick={onDemoLogin}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                   <HardDrive className="w-5 h-5" /> Entrar em Modo Offline
                </button>
             </div>
           ) : !sent ? (
             <form onSubmit={handleLogin} className="space-y-6">
                <div>
                   <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">Identifique-se, Operador</label>
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
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Acessar Sistema"}
                   {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
             </form>
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
                <button 
                  onClick={() => setSent(false)}
                  className="text-emerald-400 text-sm hover:underline"
                >
                  Usar outro email
                </button>
             </div>
           )}
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-8">
           v5.1 (Cloud Uplink Active) • Secure Connection
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
