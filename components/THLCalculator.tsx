import React, { useState, useEffect, useRef } from 'react';
import { FinancialProfile, CalculatedTHL, AppView } from '../types';
import { DollarSign, Clock, Briefcase, ArrowRight, Activity, Car, Map, UserCog } from 'lucide-react';

interface Props {
  profile: FinancialProfile;
  onUpdate: (profile: FinancialProfile, calculated: CalculatedTHL) => void;
  onNavigate?: (view: AppView) => void;
}

const THLCalculator: React.FC<Props> = ({ profile, onUpdate, onNavigate }) => {
  const [localProfile, setLocalProfile] = useState<FinancialProfile>(profile);
  const lastEmittedProfile = useRef<string>(JSON.stringify(profile));

  // Sync local state when prop changes (e.g. loaded from storage), avoiding loops
  useEffect(() => {
    // Only update local state if the incoming prop is structurally different 
    // from our current local state to prevent circular updates
    if (JSON.stringify(profile) !== JSON.stringify(localProfile)) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const calculate = (p: FinancialProfile): CalculatedTHL => {
    // Fatores
    const weeksPerMonth = 4.33;
    const workHoursMonthly = p.contractHoursWeekly * weeksPerMonth;
    const commuteHoursMonthly = (p.commuteMinutesDaily / 60) * 5 * weeksPerMonth; // 5 days a week assumption
    
    const totalInvestedHours = workHoursMonthly + commuteHoursMonthly;
    
    // Evitar divisão por zero
    const realTHL = totalInvestedHours > 0 ? p.netIncome / totalInvestedHours : 0;
    const aspirationalTHL = totalInvestedHours > 0 ? p.aspirationalIncome / totalInvestedHours : 0;

    return {
      realTHL,
      aspirationalTHL,
      monthlyTotalHours: totalInvestedHours,
      monthlyCommuteHours: commuteHoursMonthly
    };
  };

  useEffect(() => {
    // Debounce check: Only emit if data actually changed from what we last sent/received
    const currentProfileStr = JSON.stringify(localProfile);
    if (currentProfileStr !== lastEmittedProfile.current) {
        const results = calculate(localProfile);
        lastEmittedProfile.current = currentProfileStr;
        onUpdate(localProfile, results);
    }
  }, [localProfile, onUpdate]);

  const handleChange = (field: keyof FinancialProfile, value: string) => {
    setLocalProfile(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const stats = calculate(localProfile);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Input Section */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-white mb-2">Calculadora THL</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            A maioria das pessoas divide o salário por 160h. Isso está errado. 
            Vamos descobrir o valor real da sua hora descontando o "Imposto de Vida".
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-5">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">Renda Líquida Mensal</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-emerald-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input 
                  type="number" 
                  value={localProfile.netIncome || ''}
                  onChange={(e) => handleChange('netIncome', e.target.value)}
                  className="block w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: 8000"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">O que cai na conta, pós-impostos.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">Horas/Semana</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Briefcase className="h-4 w-4 text-indigo-400" />
                   </div>
                  <input 
                    type="number" 
                    value={localProfile.contractHoursWeekly || ''}
                    onChange={(e) => handleChange('contractHoursWeekly', e.target.value)}
                    className="block w-full pl-9 bg-slate-900/50 border border-slate-700 rounded-lg py-3 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="40"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">Trânsito/Dia (min)</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Car className="h-4 w-4 text-amber-500" />
                   </div>
                  <input 
                    type="number" 
                    value={localProfile.commuteMinutesDaily || ''}
                    onChange={(e) => handleChange('commuteMinutesDaily', e.target.value)}
                    className="block w-full pl-9 bg-slate-900/50 border border-slate-700 rounded-lg py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="60"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">Meta de Renda (Aspiracional)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Activity className="h-5 w-5 text-slate-600 group-focus-within:text-white transition-colors" />
                </div>
                <input 
                  type="number" 
                  value={localProfile.aspirationalIncome || ''}
                  onChange={(e) => handleChange('aspirationalIncome', e.target.value)}
                  className="block w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg py-3 text-white focus:ring-1 focus:ring-white focus:border-white outline-none transition-all"
                  placeholder="Quanto você quer ganhar?"
                />
              </div>
            </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-7 space-y-6">
        {/* Main Card */}
        <div className="relative glass-card p-8 rounded-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-1000 group-hover:bg-emerald-500/20"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[200px]">
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] text-emerald-500 font-bold mb-2">Sua Taxa Horária Real</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl md:text-7xl font-serif text-white tracking-tight">
                  R$ {stats.realTHL.toFixed(2)}
                </span>
                <span className="text-xl text-slate-500 font-light">/ hora</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-lg max-w-lg">
               <p className="text-sm text-emerald-100/80 leading-relaxed">
                 <strong className="text-emerald-400">Regra de Ouro:</strong> Se você pode pagar alguém menos que <span className="underline decoration-emerald-500/50">R$ {stats.realTHL.toFixed(2)}</span> por hora para fazer uma tarefa que você odeia, você <strong>deve</strong> delegar. É matematicamente lucrativo.
               </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">THL Aspiracional</h3>
              <div className="flex items-center gap-3">
                 <div className="text-2xl font-serif text-slate-300">R$ {stats.aspirationalTHL.toFixed(2)}</div>
                 {stats.aspirationalTHL > stats.realTHL && (
                    <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                       Meta
                    </div>
                 )}
              </div>
           </div>

           <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Gap de Valor</h3>
              <div className="flex items-center gap-3">
                 <div className="text-2xl font-serif text-slate-300">
                    {(stats.aspirationalTHL - stats.realTHL) > 0 ? `+${((stats.aspirationalTHL - stats.realTHL) / stats.realTHL * 100).toFixed(0)}%` : '0%'}
                 </div>
                 <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${Math.min(((stats.realTHL / (stats.aspirationalTHL || 1)) * 100), 100)}%` }}
                    ></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Next Step CTA */}
        {stats.realTHL > 0 && onNavigate && (
          <button 
             onClick={() => onNavigate(AppView.LIFE_CONTEXT)}
             className="w-full bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-between group border border-indigo-500/50"
          >
             <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                  <UserCog className="w-5 h-5" />
                </div>
                <div className="text-left">
                   <div className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">Próximo Passo</div>
                   <div className="text-lg">Mapear Contexto de Vida</div>
                </div>
             </div>
             <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default THLCalculator;