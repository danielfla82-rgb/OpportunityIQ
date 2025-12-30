
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Loader2, Mail, ArrowRight, ShieldCheck, Database, HardDrive, CloudLightning, CloudOff, AlertCircle, Lock, LogIn, UserPlus, Zap } from 'lucide-react';

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

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setErrorMsg(null);
    
    try {
      // Garante que a URL não tenha barras no final para evitar mismatch
      const redirectUrl = window.location.origin.replace(/\/$/, '');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Força o prompt de consentimento para evitar loops se o usuário tiver múltiplos cookies
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Login failed:", err);
      let msg = "Erro ao iniciar login com Google.";
      
      const errorBody = err?.message || JSON.stringify(err);
      
      // Diagnóstico de erros comuns
      if (errorBody.includes("missing OAuth secret") || errorBody.includes("Unsupported provider")) {
         msg = "Configuração Supabase Pendente: Ative o Google Provider no painel e insira Client ID/Secret.";
      } else if (errorBody.includes("redirect_uri_mismatch")) {
         msg = "Erro de URL: Adicione '" + window.location.origin + "' nas URLs de Redirecionamento no painel do Supabase.";
      }
      
      setErrorMsg(msg);
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
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setConfirmationSent(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Auth failed:", err);
      let msg = err.message || "Falha na autenticação.";
      
      if (err.status === 429) msg = "Muitas tentativas. Aguarde um momento.";
      if (msg.includes("Invalid login credentials")) msg = "Email ou senha incorretos.";
      if (msg.includes("User already registered")) msg = "Este email já está cadastrado. Tente entrar.";
      if (msg.includes("Password should be")) msg = "A senha deve ter pelo menos 6 caracteres.";
      if (msg.includes("Email not confirmed")) msg = "Email não confirmado. Verifique sua caixa de entrada.";

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
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-800 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl text-slate-900 mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
             <Zap className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-serif text-white mb-2">Zeus</h1>
           <p className="text-slate-400 text-sm">Plataforma organizadora de tempo e patrimônio</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
           {errorMsg && (
              <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 mb-4 animate-fade-in flex items-start gap-2">
                 <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                 <p className="text-sm text-red-200 font-medium">{errorMsg}</p>
              </div>
           )}

           {confirmationSent ? (
             <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Mail className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-serif text-white mb-2">Verifique seu Email</h3>
                <p className="text-slate-400 text-sm mb-6">
                   Enviamos um link de confirmação para <strong>{email}</strong>.
                </p>
                <button 
                  onClick={() => setConfirmationSent(false)}
                  className="text-emerald-400 text-sm hover:underline"
                >
                  Voltar para o login
                </button>
             </div>
           ) : (
             <>
               {isSupabaseConfigured ? (
                 <>
                   {/* Google Login Button */}
                   <button 
                     onClick={handleGoogleLogin}
                     disabled={loading}
                     className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 mb-6 relative overflow-hidden"
                   >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.24-1.19-2.24z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      )}
                      Continuar com Google
                   </button>

                   <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0f172a] px-2 text-slate-500">Ou use email</span>
                      </div>
                   </div>

                   <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div>
                         <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">Email</label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                            </div>
                            <input 
                              type="email"
                              required
                              className="block w-full pl-10 bg-slate-950 border border-slate-700 rounded-xl py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                              placeholder="seu@email.com"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                            />
                         </div>
                      </div>

                      <div>
                         <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">Senha</label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                            </div>
                            <input 
                              type="password"
                              required
                              minLength={6}
                              className="block w-full pl-10 bg-slate-950 border border-slate-700 rounded-xl py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                              placeholder="••••••••"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                            />
                         </div>
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
                      >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                           mode === 'LOGIN' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />
                         )}
                         {mode === 'LOGIN' ? "Entrar" : "Criar Conta"}
                      </button>
                   </form>

                   <div className="mt-4 text-center">
                     <button 
                       onClick={() => {
                         setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                         setErrorMsg(null);
                       }}
                       className="text-xs text-slate-400 hover:text-white transition-colors"
                     >
                       {mode === 'LOGIN' ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça Login"}
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="text-center pb-6">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                       <CloudOff className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-serif text-white mb-2">Cloud Desconectada</h3>
                    <p className="text-slate-400 text-sm">Configure o Supabase para habilitar login.</p>
                 </div>
               )}

               <div className="mt-6 pt-6 border-t border-slate-800/50">
                 <button 
                   onClick={onDemoLogin}
                   className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium py-3 rounded-xl transition-all border border-slate-700/50 hover:border-slate-600 flex items-center justify-center gap-2 text-sm"
                 >
                    <HardDrive className="w-4 h-4" /> 
                    {isSupabaseConfigured ? "Entrar em Modo Offline (Sem Login)" : "Entrar em Modo Offline"}
                 </button>
               </div>
             </>
           )}
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-8 flex items-center justify-center gap-2">
           v5.4.0 <span className="w-1 h-1 bg-slate-600 rounded-full"></span> 
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
