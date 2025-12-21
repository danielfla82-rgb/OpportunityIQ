
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { dataService } from './services/dataService';
import { FinancialProfile, CalculatedTHL, DelegationItem, AppView, LifeContext, ContextAnalysisResult, YearlyCompassData } from './types';
import AuthScreen from './components/AuthScreen';
import THLCalculator from './components/THLCalculator';
import DelegationMatrix from './components/DelegationMatrix';
import SunkCostSolver from './components/SunkCostSolver';
import Dashboard from './components/Dashboard';
import EssentialistNegotiator from './components/EssentialistNegotiator';
import ParetoAnalyzer from './components/ParetoAnalyzer';
import DeepWorkTimer from './components/DeepWorkTimer';
import MentalRazors from './components/MentalRazors';
import EnergyAudit from './components/EnergyAudit';
import SkillROICalculator from './components/SkillROICalculator';
import InactionCalculator from './components/InactionCalculator';
import LifestyleInflator from './components/LifestyleInflator';
import LifeContextBuilder from './components/LifeContextBuilder';
import DiagnosisReport from './components/DiagnosisReport';
import Documentation from './components/Documentation';
import BugTracker from './components/BugTracker';
import SpecialistChat from './components/SpecialistChat';
import YearlyGoals from './components/YearlyGoals';
import { LayoutDashboard, Calculator, ListTodo, BrainCircuit, ShieldAlert, Target, Timer, Scale, Battery, TrendingUp, Snowflake, ShoppingBag, Menu, X, ChevronRight, BookUser, FileText, BookOpen, Bug, MessageSquare, Compass, LogOut, Loader2, Database } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State
  const [profile, setProfile] = useState<FinancialProfile>({
    netIncome: 0,
    contractHoursWeekly: 40,
    commuteMinutesDaily: 60,
    aspirationalIncome: 0
  });

  const [thlStats, setThlStats] = useState<CalculatedTHL>({
    realTHL: 0,
    aspirationalTHL: 0,
    monthlyTotalHours: 0,
    monthlyCommuteHours: 0
  });

  const [delegations, setDelegations] = useState<DelegationItem[]>([]);
  const [lifeContext, setLifeContext] = useState<LifeContext | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ContextAnalysisResult | null>(null);
  const [yearCompass, setYearCompass] = useState<YearlyCompassData>({
    goal1: { text: "", completed: false },
    goal2: { text: "", completed: false },
    goal3: { text: "", completed: false },
    financialGoal: { targetMonthlyIncome: 0, targetTHL: 0, deadlineMonth: "" }
  });

  // Auth Initialization
  useEffect(() => {
    // If not configured, we stop loading immediately and wait for user to click "Demo Mode"
    if (!dataService.isConfigured) {
        setLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadData(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDemoLogin = () => {
      const demoUser = { user: { id: 'demo_user', email: 'demo@oiq.app' } };
      setSession(demoUser);
      loadData(demoUser.user.id);
  };

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
      const data = await dataService.loadFullData(userId);
      setProfile(data.profile);
      setDelegations(data.delegations);
      setLifeContext(data.lifeContext);
      setAnalysisResult(data.analysisResult);
      setYearCompass(data.yearCompass);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE HANDLERS (Debounced Auto-Save Logic) ---
  useEffect(() => {
    if (session?.user?.id && !loading) {
        const timeout = setTimeout(() => {
            dataService.saveProfile(session.user.id, profile);
        }, 1000);
        return () => clearTimeout(timeout);
    }
  }, [profile, session, loading]);

  useEffect(() => {
    if (session?.user?.id && !loading) {
        const timeout = setTimeout(() => {
            dataService.saveCompass(session.user.id, yearCompass);
        }, 1000);
        return () => clearTimeout(timeout);
    }
  }, [yearCompass, session, loading]);
  
  const handleTHLUpdate = (newProfile: FinancialProfile, stats: CalculatedTHL) => {
    setProfile(newProfile);
    setThlStats(stats);
  };

  const handleNavClick = (viewId: AppView) => {
    setView(viewId);
    setIsMobileMenuOpen(false);
  };

  const handleContextAnalysisComplete = async (result: ContextAnalysisResult, context: LifeContext) => {
     setLifeContext(context);
     setAnalysisResult(result);
     if (session?.user?.id) {
        await dataService.saveContext(session.user.id, context, result);
     }
     setView(AppView.DIAGNOSIS);
  };

  const handleApplyDiagnosis = () => {
     if (analysisResult && analysisResult.delegationSuggestions.length > 0) {
        setDelegations(prev => {
           const existingNames = new Set(prev.map(d => d.name.toLowerCase()));
           const newItems = analysisResult.delegationSuggestions.filter(d => !existingNames.has(d.name.toLowerCase()));
           const combined = [...prev, ...newItems];
           
           if (session?.user?.id) {
              newItems.forEach(item => dataService.addDelegation(session.user.id, item));
           }
           return combined;
        });
     }
     setView(AppView.DASHBOARD);
  };

  const handleSetDelegations = (action: React.SetStateAction<DelegationItem[]>) => {
     setDelegations(prev => {
       const newList = typeof action === 'function' ? action(prev) : action;
       
       if (session?.user?.id) {
          const added = newList.filter(n => !prev.find(p => p.id === n.id));
          added.forEach(item => dataService.addDelegation(session.user.id, item));
          
          const removed = prev.filter(p => !newList.find(n => n.id === p.id));
          removed.forEach(item => dataService.removeDelegation(session.user.id, item.id));
       }
       return newList;
     });
  };

  if (!session) {
    return <AuthScreen onDemoLogin={handleDemoLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center animate-pulse">
             <div className="w-8 h-8 bg-emerald-500 rounded-full"></div>
           </div>
           <p className="text-slate-500 font-serif animate-pulse">Carregando Sistema...</p>
        </div>
      </div>
    );
  }

  // Grouped Navigation
  const navGroups = [
    {
      title: 'Principal',
      items: [
        { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { id: AppView.THL_CALCULATOR, label: 'Calculadora THL', icon: Calculator },
        { id: AppView.YEARLY_GOALS, label: 'Bússola Anual', icon: Compass },
        { id: AppView.LIFE_CONTEXT, label: 'Mapear Vida', icon: BookUser },
        { id: AppView.DIAGNOSIS, label: 'Diagnóstico', icon: FileText, hidden: !analysisResult },
        { id: AppView.CHAT, label: 'Chat Especialista', icon: MessageSquare },
      ]
    },
    {
      title: 'Financeiro & Carreira',
      items: [
        { id: AppView.DELEGATION, label: 'Matriz de Delegação', icon: ListTodo },
        { id: AppView.SKILL_ROI, label: 'Alavancagem (ROI)', icon: TrendingUp },
        { id: AppView.LIFESTYLE_INFLATOR, label: 'Corretor Hedônico', icon: ShoppingBag },
        { id: AppView.INACTION_CALC, label: 'Custo da Inação', icon: Snowflake },
      ]
    },
    {
      title: 'Filosofia & Decisão',
      items: [
        { id: AppView.SUNK_COST, label: 'Custo Irrecuperável', icon: BrainCircuit },
        { id: AppView.RAZORS, label: 'Oráculo das Navalhas', icon: Scale },
        { id: AppView.PARETO, label: 'Analisador 80/20', icon: Target },
        { id: AppView.NEGOTIATOR, label: 'Negociador (Não)', icon: ShieldAlert },
        { id: AppView.ENERGY_AUDIT, label: 'Matriz de Energia', icon: Battery },
        { id: AppView.DEEP_WORK, label: 'Modo Deep Work', icon: Timer },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { id: AppView.DOCS, label: 'Wiki do Operador', icon: BookOpen },
        { id: AppView.BUG_TRACKER, label: 'Reportar Bug', icon: Bug },
      ]
    }
  ];

  const currentViewLabel = navGroups.flatMap(g => g.items).find(i => i.id === view)?.label || 'OpportunityIQ';

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden p-4 flex justify-between items-center sticky top-0 z-50 border-b border-white/5 bg-slate-950/85 backdrop-blur-md">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center font-serif font-bold text-slate-900 shadow-lg shadow-emerald-500/20">O</div>
            <span className="font-serif text-lg tracking-tight text-white font-medium">{currentViewLabel}</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 p-2 hover:bg-slate-800 rounded-lg transition-colors">
           {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-950/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden md:block">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center font-serif font-bold text-xl text-white">O</div>
             <div>
               <h1 className="text-xl font-serif text-white tracking-tight leading-none">OpportunityIQ</h1>
               <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-medium">Decision OS</p>
             </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-8 flex-1 overflow-y-auto no-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 opacity-80">{group.title}</h3>
              <div className="space-y-1">
                {group.items.filter(item => !item.hidden).map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all group relative overflow-hidden ${
                      view === item.id 
                        ? 'text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40'
                    }`}
                  >
                    {view === item.id && (
                       <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 border border-white/5 rounded-xl"></div>
                    )}
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon className={`w-4 h-4 transition-colors ${view === item.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      {item.label}
                    </div>
                    {view === item.id && <ChevronRight className="w-3 h-3 opacity-50 relative z-10" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-4">
           {/* THL Widget */}
           <div className="glass-card rounded-xl p-4 relative overflow-hidden group cursor-pointer border border-slate-700/30 hover:border-emerald-500/30 transition-colors" onClick={() => handleNavClick(AppView.THL_CALCULATOR)}>
             <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/10 transition-all"></div>
             <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">THL Atual</div>
             <div className="flex items-baseline gap-1">
               <span className="text-sm text-emerald-500 font-medium">R$</span>
               <span className="text-2xl font-mono text-white font-bold">{thlStats.realTHL.toFixed(2)}</span>
               <span className="text-xs text-slate-500">/h</span>
             </div>
           </div>

           {/* Logout */}
           <button 
             onClick={() => {
                if (dataService.isConfigured) supabase.auth.signOut();
                setSession(null);
             }} 
             className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors py-2"
           >
             <LogOut className="w-3 h-3" /> Desconectar {dataService.isConfigured ? '' : '(Local)'}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto h-[calc(100vh-65px)] md:h-screen w-full bg-[#020617]">
        {!dataService.isConfigured && (
           <div className="bg-amber-500/10 border-b border-amber-500/20 py-1.5 px-4 text-center">
              <p className="text-[10px] text-amber-300 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <Database className="w-3 h-3" /> Modo Demo (Offline) Ativo - Dados não estão sincronizados na nuvem
              </p>
           </div>
        )}
        <div className="max-w-6xl mx-auto p-4 md:p-10 pb-24">
          
          <div className="animate-fade-in">
            {view === AppView.THL_CALCULATOR && (
              <THLCalculator profile={profile} onUpdate={handleTHLUpdate} onNavigate={setView} />
            )}
            
            {view === AppView.LIFE_CONTEXT && (
               <LifeContextBuilder 
                 thl={thlStats} 
                 initialContext={lifeContext}
                 onAnalysisComplete={handleContextAnalysisComplete} 
               />
            )}

            {view === AppView.DIAGNOSIS && analysisResult && (
               <DiagnosisReport 
                  result={analysisResult} 
                  thl={thlStats} 
                  profile={profile}
                  onApply={handleApplyDiagnosis}
                  onBack={() => setView(AppView.LIFE_CONTEXT)}
                  onNavigate={setView}
               />
            )}

            {view === AppView.YEARLY_GOALS && (
               <YearlyGoals 
                 data={yearCompass} 
                 thl={thlStats}
                 onUpdate={setYearCompass}
               />
            )}

            {view === AppView.CHAT && (
              <SpecialistChat thl={thlStats} lifeContext={lifeContext} />
            )}

            {view === AppView.DELEGATION && (
              <DelegationMatrix thl={thlStats} delegations={delegations} setDelegations={handleSetDelegations} />
            )}

            {view === AppView.SUNK_COST && (
              <SunkCostSolver thl={thlStats} />
            )}
            
            {view === AppView.NEGOTIATOR && (
              <EssentialistNegotiator />
            )}

            {view === AppView.PARETO && (
              <ParetoAnalyzer />
            )}

            {view === AppView.RAZORS && (
              <MentalRazors />
            )}

             {view === AppView.ENERGY_AUDIT && (
              <EnergyAudit />
            )}

            {view === AppView.SKILL_ROI && (
              <SkillROICalculator thl={thlStats} />
            )}

            {view === AppView.INACTION_CALC && (
              <InactionCalculator thl={thlStats} />
            )}

            {view === AppView.LIFESTYLE_INFLATOR && (
              <LifestyleInflator thl={thlStats} />
            )}

            {view === AppView.DEEP_WORK && (
              <DeepWorkTimer thl={thlStats} />
            )}

            {view === AppView.DOCS && (
              <Documentation />
            )}

            {view === AppView.BUG_TRACKER && (
              <BugTracker profile={profile} thl={thlStats} />
            )}

            {view === AppView.DASHBOARD && (
              <Dashboard 
                thl={thlStats} 
                delegations={delegations} 
                lifeContext={lifeContext} 
                yearCompass={yearCompass}
                onViewChange={setView} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
