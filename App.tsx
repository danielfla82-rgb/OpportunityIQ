
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { dataService } from './services/dataService';
import { FinancialProfile, CalculatedTHL, DelegationItem, AppView, LifeContext, ContextAnalysisResult, YearlyCompassData, AssetItem, MonthlyNote } from './types';
import AuthScreen from './components/AuthScreen';
import THLCalculator from './components/THLCalculator';
import DelegationMatrix from './components/DelegationMatrix';
import Dashboard from './components/Dashboard';
import ParetoAnalyzer from './components/ParetoAnalyzer';
import MentalRazors from './components/MentalRazors';
import EnergyAudit from './components/EnergyAudit';
import LifestyleInflator from './components/LifestyleInflator';
import LifeContextBuilder from './components/LifeContextBuilder';
import AssetInventory from './components/AssetInventory';
import DiagnosisReport from './components/DiagnosisReport';
import Documentation from './components/Documentation';
import SpecialistChat from './components/SpecialistChat';
import YearlyGoals from './components/YearlyGoals';
import MonthlyReflections from './components/MonthlyReflections';
import { LayoutDashboard, Calculator, ListTodo, Target, Scale, Battery, ShoppingBag, Menu, X, BookUser, FileText, BookOpen, MessageSquare, Compass, LogOut, Wallet, ChevronDown, Sparkles, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sidebar Accordion State
  const [openGroups, setOpenGroups] = useState<string[]>(['Principal', 'Ferramentas']);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

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
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [lifeContext, setLifeContext] = useState<LifeContext | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ContextAnalysisResult | null>(null);
  const [yearCompass, setYearCompass] = useState<YearlyCompassData>({
    goal1: { text: "", indicator: "", completed: false },
    goal2: { text: "", indicator: "", completed: false },
    goal3: { text: "", indicator: "", completed: false },
    financialGoal: { targetMonthlyIncome: 0, targetTHL: 0, deadlineMonth: "" }
  });
  const [monthlyNotes, setMonthlyNotes] = useState<MonthlyNote[]>([]);

  // Auth Initialization
  useEffect(() => {
    if (!dataService.isConfigured) {
        setLoading(false);
        return;
    }

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (session) {
           await loadData(session.user.id);
        } else {
           setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setLoading(false);
      }
    };

    initAuth();

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
      
      // Calculate THL immediately upon loading data
      const p = data.profile;
      const weeksPerMonth = 4.33;
      const workHoursMonthly = p.contractHoursWeekly * weeksPerMonth;
      const commuteHoursMonthly = (p.commuteMinutesDaily / 60) * 5 * weeksPerMonth;
      const totalInvestedHours = workHoursMonthly + commuteHoursMonthly;
      const realTHL = totalInvestedHours > 0 ? p.netIncome / totalInvestedHours : 0;
      const aspirationalTHL = totalInvestedHours > 0 ? p.aspirationalIncome / totalInvestedHours : 0;
      
      setThlStats({
        realTHL,
        aspirationalTHL,
        monthlyTotalHours: totalInvestedHours,
        monthlyCommuteHours: commuteHoursMonthly
      });

      setDelegations(data.delegations);
      setAssets(data.assets);
      setLifeContext(data.lifeContext);
      setAnalysisResult(data.analysisResult);
      setYearCompass(data.yearCompass);
      setMonthlyNotes(data.monthlyNotes);
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

  // Save Context when it changes (debounced)
  useEffect(() => {
    if (session?.user?.id && !loading && lifeContext) {
        const timeout = setTimeout(() => {
            dataService.saveContext(session.user.id, lifeContext, analysisResult || undefined);
        }, 2000);
        return () => clearTimeout(timeout);
    }
  }, [lifeContext, analysisResult, session, loading]);
  
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
     
     setView(AppView.DIAGNOSIS);

     if (session?.user?.id) {
        try {
            await dataService.saveContext(session.user.id, context, result);
        } catch (e) {
            console.error("Supabase Connection Failed:", e);
        }
     }
  };

  const handleContextPartialUpdate = (updates: Partial<LifeContext>) => {
    setLifeContext(prev => {
        const base = prev || {
            routineDescription: '',
            assetsDescription: '',
            sleepHours: 7,
            physicalActivityMinutes: 0,
            studyMinutes: 0,
            lastUpdated: new Date().toISOString()
        };
        return { ...base, ...updates };
    });
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
  
  const handleSetAssets = (action: React.SetStateAction<AssetItem[]>) => {
     setAssets(prev => {
       const newList = typeof action === 'function' ? action(prev) : action;
       
       if (session?.user?.id) {
          const added = newList.filter(n => !prev.find(p => p.id === n.id));
          added.forEach(item => dataService.addAsset(session.user.id, item));
          
          const removed = prev.filter(p => !newList.find(n => n.id === p.id));
          removed.forEach(item => dataService.removeAsset(session.user.id, item.id));
       }
       return newList;
     });
  };

  const handleSaveNote = async (note: MonthlyNote) => {
    // Optimistic Update
    setMonthlyNotes(prev => {
      const filtered = prev.filter(n => !(n.month === note.month && n.year === note.year));
      return [...filtered, note];
    });

    if (session?.user?.id) {
      await dataService.saveNote(session.user.id, note);
    }
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
        { id: AppView.DASHBOARD, label: 'Comando Central', icon: LayoutDashboard },
        { id: AppView.THL_CALCULATOR, label: 'Calculadora THL', icon: Calculator },
        { id: AppView.YEARLY_GOALS, label: 'Bússola Anual', icon: Compass },
        { id: AppView.MONTHLY_REFLECTIONS, label: 'Anotações (Meses)', icon: Calendar },
        { id: AppView.LIFE_CONTEXT, label: 'Mapear Vida', icon: BookUser },
        { id: AppView.DIAGNOSIS, label: 'Diagnóstico', icon: FileText, hidden: !analysisResult },
        { id: AppView.CHAT, label: 'Chat Especialista', icon: MessageSquare },
      ]
    },
    {
      title: 'Ferramentas',
      items: [
        { id: AppView.ASSET_INVENTORY, label: 'Inventário de Bens', icon: Wallet },
        { id: AppView.DELEGATION, label: 'Matriz de Delegação', icon: ListTodo },
        { id: AppView.LIFESTYLE_INFLATOR, label: 'Corretor Hedônico', icon: ShoppingBag },
        { id: AppView.PARETO, label: 'Analisador 80/20', icon: Target },
        { id: AppView.RAZORS, label: 'Oráculo das Navalhas', icon: Scale },
        { id: AppView.ENERGY_AUDIT, label: 'Matriz de Energia', icon: Battery },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { id: AppView.DOCS, label: 'Wiki do Operador', icon: BookOpen },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden font-sans bg-[#020617]">
      
      {/* Mobile Header */}
      <div className="md:hidden p-4 flex justify-between items-center sticky top-0 z-50 border-b border-white/5 bg-slate-950/95 backdrop-blur-md">
         <div className="w-32 h-10 overflow-hidden shrink-0">
            <img 
               src="https://i.postimg.cc/C1NN6wt7/Gemini-Generated-Image-pwcfvpwcfvpwcfvp.png" 
               alt="Zeus Logo" 
               className="w-full h-full object-cover" 
            />
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 p-2 hover:bg-slate-800 rounded-none transition-colors">
           {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* Modern "Suspended" Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 md:w-64 bg-slate-950
        transform transition-transform duration-300 ease-in-out 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
        border-r border-slate-800
        flex flex-col
      `}>
        {/* Logo Header */}
        <div className="h-24 flex items-center justify-center border-b border-slate-800 bg-black/20">
             <div className="w-48 h-12 overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                <img 
                   src="https://i.postimg.cc/C1NN6wt7/Gemini-Generated-Image-pwcfvpwcfvpwcfvp.png" 
                   alt="Zeus Logo" 
                   className="w-full h-full object-cover" 
                />
             </div>
        </div>
        
        <nav className="px-3 py-6 space-y-4 flex-1 overflow-y-auto no-scrollbar">
          {navGroups.map((group, idx) => {
            const isOpen = openGroups.includes(group.title);
            const activeChild = group.items.some(i => i.id === view);
            
            return (
            <div key={idx} className="mb-1">
              <button 
                onClick={() => toggleGroup(group.title)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeChild ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <span>{group.title}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-0.5">
                  {group.items.filter(item => !item.hidden).map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all group relative border-l-2 ${
                        view === item.id 
                          ? 'text-white bg-white/5 border-emerald-500' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 transition-colors ${view === item.id ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )})}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-black/20">
           {/* THL Widget - Minimal */}
           <div 
             className="bg-slate-900 border border-slate-800 p-3 mb-3 cursor-pointer hover:border-emerald-500/30 transition-colors group" 
             onClick={() => handleNavClick(AppView.THL_CALCULATOR)}
           >
             <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5 font-bold group-hover:text-emerald-500 transition-colors">THL Atual</div>
             <div className="flex items-baseline gap-1">
               <span className="text-xs text-emerald-500 font-medium">R$</span>
               <span className="text-lg font-mono text-white font-bold">{thlStats.realTHL.toFixed(2)}</span>
             </div>
           </div>

           {/* Logout */}
           <button 
             onClick={() => {
                if (dataService.isConfigured) supabase.auth.signOut();
                setSession(null);
             }} 
             className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-slate-600 hover:text-red-400 transition-colors py-2"
           >
             <LogOut className="w-3 h-3" /> Desconectar
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto h-[calc(100vh-65px)] md:h-screen w-full bg-[#020617]">
        {!dataService.isConfigured && (
           <div className="bg-emerald-900/10 border-b border-emerald-500/10 py-1.5 px-4 text-center">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <Sparkles className="w-3 h-3" /> Modo Demonstração (Dados de Exemplo)
              </p>
           </div>
        )}
        
        {/* Scrollable Container with padding for floating sidebar */}
        <div className="max-w-7xl mx-auto p-0 md:p-0 md:h-screen md:overflow-y-auto no-scrollbar">
          
          <div className="animate-fade-in">
            {view === AppView.THL_CALCULATOR && (
              <div className="p-6 md:p-12"><THLCalculator profile={profile} onUpdate={handleTHLUpdate} onNavigate={setView} /></div>
            )}
            
            {view === AppView.LIFE_CONTEXT && (
               <div className="p-6 md:p-12"><LifeContextBuilder 
                 thl={thlStats} 
                 profile={profile}
                 initialContext={lifeContext}
                 assets={assets}
                 onAnalysisComplete={handleContextAnalysisComplete}
                 onUpdate={handleContextPartialUpdate} 
                 onNavigate={setView}
               /></div>
            )}
            
            {view === AppView.ASSET_INVENTORY && (
               <div className="p-6 md:p-12"><AssetInventory 
                 assets={assets}
                 setAssets={handleSetAssets}
                 onBack={() => setView(AppView.LIFE_CONTEXT)}
               /></div>
            )}

            {view === AppView.DIAGNOSIS && analysisResult && (
               <div className="p-6 md:p-12"><DiagnosisReport 
                  result={analysisResult} 
                  thl={thlStats} 
                  profile={profile}
                  onApply={handleApplyDiagnosis}
                  onBack={() => setView(AppView.LIFE_CONTEXT)}
                  onNavigate={setView}
               /></div>
            )}

            {view === AppView.YEARLY_GOALS && (
               <div className="p-6 md:p-12"><YearlyGoals 
                 data={yearCompass} 
                 thl={thlStats}
                 onUpdate={setYearCompass}
               /></div>
            )}

            {view === AppView.MONTHLY_REFLECTIONS && (
               <div className="p-6 md:p-12"><MonthlyReflections 
                 notes={monthlyNotes} 
                 onSave={handleSaveNote}
               /></div>
            )}

            {view === AppView.CHAT && (
              <div className="p-6 md:p-12 h-screen"><SpecialistChat thl={thlStats} lifeContext={lifeContext} /></div>
            )}

            {view === AppView.DELEGATION && (
              <div className="p-6 md:p-12"><DelegationMatrix thl={thlStats} delegations={delegations} setDelegations={handleSetDelegations} /></div>
            )}

            {view === AppView.PARETO && (
              <div className="p-6 md:p-12"><ParetoAnalyzer /></div>
            )}

            {view === AppView.RAZORS && (
              <div className="p-6 md:p-12"><MentalRazors /></div>
            )}

             {view === AppView.ENERGY_AUDIT && (
              <div className="p-6 md:p-12"><EnergyAudit /></div>
            )}

            {view === AppView.LIFESTYLE_INFLATOR && (
              <div className="p-6 md:p-12"><LifestyleInflator thl={thlStats} /></div>
            )}

            {view === AppView.DOCS && (
              <div className="p-6 md:p-12"><Documentation /></div>
            )}

            {view === AppView.DASHBOARD && (
              <Dashboard 
                thl={thlStats} 
                delegations={delegations} 
                lifeContext={lifeContext} 
                yearCompass={yearCompass}
                analysisResult={analysisResult}
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
