
import React, { useState, useEffect } from 'react';
import { CalculatedTHL, DelegationItem, AppView, LifeContext, YearlyCompassData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Clock, Shield, Sparkles, Calculator, ArrowRightLeft, ArrowRight, Infinity, Compass, Flag, Activity } from 'lucide-react';
import { getTimeWisdom } from '../services/geminiService';

interface Props {
  thl: CalculatedTHL;
  delegations: DelegationItem[];
  lifeContext: LifeContext | null;
  yearCompass?: YearlyCompassData;
  onViewChange?: (view: AppView) => void;
}

const Dashboard: React.FC<Props> = ({ thl, delegations, lifeContext, yearCompass, onViewChange }) => {
  const totalHoursBought = delegations.reduce((acc, curr) => acc + curr.hoursSaved, 0);
  const totalCost = delegations.reduce((acc, curr) => acc + curr.cost, 0);
  const potentialValueGenerated = totalHoursBought * thl.realTHL;
  const netProfit = potentialValueGenerated - totalCost;
  
  const [quote, setQuote] = useState<string>("");
  const [convertPrice, setConvertPrice] = useState<string>("");
  
  // Dynamic Greeting
  const date = new Date();
  const hour = date.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  
  useEffect(() => {
    getTimeWisdom()
      .then(setQuote)
      .catch(err => {
         console.warn("AI Wisdom unavailable", err);
         setQuote("Amor Fati.");
      });
  }, []);

  const chartData = [
    { name: 'Custo da Delegação', value: totalCost, color: '#ef4444' },
    { name: 'Valor Gerado (THL)', value: potentialValueGenerated, color: '#10b981' },
  ];

  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(0) : 0;
  const price = parseFloat(convertPrice) || 0;
  const hoursCost = thl.realTHL > 0 ? price / thl.realTHL : 0;
  const workDaysCost = hoursCost / 8;

  const eternalScore = lifeContext?.eternalReturnScore ?? 0;
  const eternalText = lifeContext?.eternalReturnText ?? "";

  // Financial Goal Progress
  const financialGoal = yearCompass?.financialGoal?.targetMonthlyIncome || 0;
  const currentIncome = thl.realTHL * thl.monthlyTotalHours; // Estimation based on THL
  const goalProgress = financialGoal > 0 ? (currentIncome / financialGoal) * 100 : 0;

  if (thl.realTHL === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <Calculator className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-serif text-white mb-4">Bem-vindo ao OpportunityIQ</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
           Para começar a tomar decisões melhores, precisamos descobrir quanto vale o seu tempo real. 
           Calcularemos sua Taxa Horária Líquida (THL) descontando impostos e tempo de deslocamento.
        </p>
        <button 
           onClick={() => onViewChange && onViewChange(AppView.THL_CALCULATOR)}
           className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto"
        >
           Calcular Minha THL <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
       
       {/* Hero Section - Replaces loose header text */}
       <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 overflow-hidden shadow-2xl">
          {/* Ambient Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                   Sistema Operacional Ativo
                </div>
                <h1 className="text-3xl md:text-4xl font-serif text-white leading-tight">
                   {greeting}, Operador.
                </h1>
                <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed">
                   Seu foco hoje determina sua liberdade amanhã. Visão geral da sua eficiência e progresso.
                </p>
             </div>
             
             <div className="bg-slate-950/60 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl flex items-center gap-4 min-w-[240px] shadow-lg hover:border-emerald-500/30 transition-colors">
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                   <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Sua THL Real</div>
                   <div className="text-2xl font-mono text-white font-medium flex items-baseline gap-1">
                      R$ {thl.realTHL.toFixed(2)}
                      <span className="text-sm text-slate-500 font-sans">/h</span>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Top Widgets Row: Wisdom & Financial Goal */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Wisdom Banner */}
          <div className="bg-gradient-to-r from-indigo-950/30 to-slate-900/50 border border-indigo-500/20 rounded-xl p-6 flex items-start md:items-center gap-4 shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
              <div className="bg-indigo-500/10 p-2.5 rounded-lg shrink-0 border border-indigo-500/20">
                <Sparkles className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-2">
                   Aforismo do Dia
                </h4>
                <p className="text-base font-serif italic text-slate-200 leading-snug">
                  "{quote || 'O amor fati é a sua armadura...'}"
                </p>
              </div>
          </div>

          {/* North Star Progress */}
          {financialGoal > 0 ? (
             <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-6 flex flex-col justify-center relative cursor-pointer group hover:bg-slate-900/80 transition-colors" onClick={() => onViewChange && onViewChange(AppView.YEARLY_GOALS)}>
                <div className="absolute top-3 right-3 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
                   <Compass className="w-10 h-10" />
                </div>
                <div className="flex justify-between items-end mb-3 relative z-10">
                   <div>
                      <h4 className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
                         <Flag className="w-3 h-3" /> Meta Financeira (Norte)
                      </h4>
                      <div className="text-xl font-mono text-slate-200">
                         R$ {financialGoal.toLocaleString()} <span className="text-xs text-slate-500 font-sans">/mês</span>
                      </div>
                   </div>
                   <div className="text-3xl font-bold text-white tracking-tight">
                      {Math.min(goalProgress, 100).toFixed(0)}%
                   </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full relative z-10 overflow-hidden">
                   <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000 group-hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      style={{ width: `${Math.min(goalProgress, 100)}%` }}
                   ></div>
                </div>
             </div>
          ) : (
            <button 
               onClick={() => onViewChange && onViewChange(AppView.YEARLY_GOALS)}
               className="bg-slate-900/40 border border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-emerald-400 transition-all group"
            >
               <Compass className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
               <span className="font-medium text-sm">Definir Norte Verdadeiro</span>
            </button>
          )}
       </div>

       {/* Eternal Return Widget */}
       {lifeContext && lifeContext.eternalReturnScore !== undefined && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <Infinity className="w-5 h-5 text-purple-400" />
                 <h3 className="text-sm font-serif font-bold text-slate-200">Índice do Eterno Retorno</h3>
               </div>
               <div className={`text-2xl font-mono ${eternalScore > 70 ? 'text-emerald-400' : eternalScore < 40 ? 'text-red-400' : 'text-amber-400'}`}>
                 {eternalScore}/100
               </div>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-full mb-4">
                <div 
                   className={`h-full rounded-full transition-all duration-1000 ${eternalScore > 70 ? 'bg-emerald-500' : eternalScore < 40 ? 'bg-red-500' : 'bg-amber-500'}`} 
                   style={{ width: `${eternalScore}%` }}
                ></div>
             </div>
             <p className="text-sm text-slate-400 italic">"{eternalText}"</p>
             <div className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest">
               Você repetiria sua rotina atual pela eternidade?
             </div>
          </div>
       )}

       {/* Key Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs uppercase tracking-widest font-bold">Tempo Comprado</h3>
            </div>
            <div className="text-3xl font-serif text-white">{totalHoursBought}h</div>
            <div className="text-xs text-slate-500 mt-1">horas resgatadas/mês</div>
          </div>

          <div className="glass-card p-6 rounded-xl hover:bg-slate-800/50 transition-colors">
             <div className="flex items-center gap-3 mb-2 text-slate-400">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest font-bold">ROI de Tempo</h3>
            </div>
             <div className="text-3xl font-serif text-emerald-400">+{roi}%</div>
             <div className="text-xs text-slate-500 mt-1">retorno sobre capital</div>
          </div>

          <div className="glass-card p-6 rounded-xl hover:bg-slate-800/50 transition-colors">
             <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="text-xs uppercase tracking-widest font-bold">Lucro Líquido</h3>
            </div>
             <div className="text-3xl font-serif text-white">R$ {netProfit.toLocaleString()}</div>
             <div className="text-xs text-slate-500 mt-1">eficiência mensal</div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6 flex flex-col h-80">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">Comparativo: Custo vs. Valor Gerado</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={140} tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reality Converter Widget */}
          <div className="glass-card rounded-xl p-6 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
             
             <div className="flex items-center gap-2 mb-4">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-200">Conversor de Realidade</h3>
             </div>
             
             <div className="flex-1 flex flex-col justify-center space-y-4">
                <div>
                   <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block">Quanto custa o item? (R$)</label>
                   <input 
                      type="number" 
                      value={convertPrice}
                      onChange={(e) => setConvertPrice(e.target.value)}
                      placeholder="Ex: 5000"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-indigo-500 outline-none text-lg transition-all focus:bg-slate-900"
                   />
                </div>

                <div className="bg-indigo-500/5 rounded-lg p-4 border border-indigo-500/10">
                   <div className="text-[10px] text-indigo-300/70 uppercase tracking-widest mb-1">Custo em Vida</div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif text-white">
                         {hoursCost.toFixed(1)} <span className="text-sm font-sans text-slate-500">horas</span>
                      </span>
                   </div>
                   <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ≈ {workDaysCost.toFixed(1)} dias de trabalho
                   </div>
                </div>
                
                <p className="text-[10px] text-slate-600 italic text-center mt-2">
                   "A vida não é curta, é que perdemos muito dela." — Sêneca
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;
