
import React, { useState, useEffect } from 'react';
import { CalculatedTHL, DelegationItem, AppView, LifeContext, YearlyCompassData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Sector } from 'recharts';
import { Sparkles, Calculator, ArrowRightLeft, ArrowRight, Infinity, Compass, Flag, Activity, Moon, Briefcase, Car, Coffee, Dumbbell, Brain, Clock } from 'lucide-react';
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
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

  // --- TIME DISTRIBUTION LOGIC (24 Hours - Daily Average) ---
  const dailySleep = lifeContext?.sleepHours || 7.5;
  const dailyPhysical = (lifeContext?.physicalActivityMinutes || 0) / 60;
  const dailyStudy = (lifeContext?.studyMinutes || 0) / 60;
  
  const dailyWork = thl.monthlyTotalHours > 0 
      ? (thl.monthlyTotalHours - thl.monthlyCommuteHours) / 30 
      : 5.7; 
      
  const dailyCommute = thl.monthlyTotalHours > 0 
      ? thl.monthlyCommuteHours / 30
      : 0.7; 
  
  const committedTime = dailySleep + dailyWork + dailyCommute + dailyPhysical + dailyStudy;
  const dailyFreeTime = Math.max(0, 24 - committedTime);

  const timeData = [
    { name: 'Sono', value: dailySleep, color: '#6366f1', icon: Moon },     // Indigo
    { name: 'Trabalho', value: dailyWork, color: '#f59e0b', icon: Briefcase }, // Amber
    { name: 'Trânsito', value: dailyCommute, color: '#ef4444', icon: Car },    // Red
    { name: 'Bio/Treino', value: dailyPhysical, color: '#10b981', icon: Dumbbell }, // Emerald
    { name: 'Estudo', value: dailyStudy, color: '#d946ef', icon: Brain }, // Fuschia
    { name: 'Soberania', value: dailyFreeTime, color: '#06b6d4', icon: Coffee }, // Cyan
  ].filter(item => item.value > 0); 
  // -------------------------------------------

  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(0) : 0;
  const price = parseFloat(convertPrice) || 0;
  const hoursCost = thl.realTHL > 0 ? price / thl.realTHL : 0;
  const workDaysCost = hoursCost / 8;

  const eternalScore = lifeContext?.eternalReturnScore ?? 0;
  const eternalText = lifeContext?.eternalReturnText ?? "";

  // Financial Goal Progress
  const financialGoal = yearCompass?.financialGoal?.targetMonthlyIncome || 0;
  const currentIncome = thl.realTHL * thl.monthlyTotalHours; 
  const goalProgress = financialGoal > 0 ? (currentIncome / financialGoal) * 100 : 0;

  // Chart Interactions
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const activeItem = activeIndex !== null && timeData[activeIndex] ? timeData[activeIndex] : null;
  const defaultItem = timeData.find(i => i.name === 'Soberania') || { name: 'Soberania', value: dailyFreeTime, color: '#06b6d4' };
  const displayItem = activeItem || defaultItem;

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 12}
          fill={fill}
          opacity={0.3}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = data.icon;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl shadow-2xl ring-1 ring-white/10">
          <div className="flex items-center gap-3 mb-2 border-b border-white/10 pb-2">
             <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
               {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
             </div>
             <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">{data.name}</span>
          </div>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-mono text-white font-bold">{data.value.toFixed(1)}</span>
             <span className="text-xs text-slate-500 font-sans">horas/dia</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-medium">
             {((data.value / 24) * 100).toFixed(1)}% do seu tempo
          </div>
        </div>
      );
    }
    return null;
  };

  if (thl.realTHL === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <Calculator className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-serif text-white mb-4">Bem-vindo ao Zeus</h2>
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
       
       {/* Hero Section */}
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
                   Visão Geral
                </h1>
                <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed">
                   Painel de controle da sua eficiência e liberdade.
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

       {/* Time Distribution Chart (24h) - UPDATED TO DAILY */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6 flex flex-col h-auto min-h-[320px]">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
                   <Clock className="w-4 h-4" /> Distribuição Diária (24h)
                </h3>
                <span className="text-xs text-slate-500">Autópsia do seu dia</span>
             </div>
             
             <div className="flex-1 w-full min-h-[220px] flex items-center justify-center relative group">
               <ResponsiveContainer width="100%" height={240}>
                 <PieChart onMouseLeave={onPieLeave}>
                    <Pie
                      activeIndex={activeIndex !== null ? activeIndex : undefined}
                      activeShape={renderActiveShape}
                      data={timeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      animationDuration={400}
                    >
                      {timeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                 </PieChart>
               </ResponsiveContainer>
               
               {/* Legend Overlay */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all duration-300">
                  <div className="text-3xl font-bold text-white tracking-tighter animate-fade-in" key={displayItem.name}>
                    {displayItem.value.toFixed(1)}<span className="text-lg text-slate-500 font-normal">h</span>
                  </div>
                  <div 
                    className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1 animate-fade-in" 
                    style={{ color: displayItem.color }}
                  >
                    {displayItem.name}
                  </div>
               </div>
             </div>
             
             {/* Custom Legend */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
               {timeData.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-2 text-[10px] uppercase tracking-wider transition-opacity duration-300 ${activeIndex !== null && activeIndex !== idx ? 'opacity-30' : 'opacity-100'}`}>
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                     <span className={`truncate ${activeIndex === idx ? 'text-white font-bold' : 'text-slate-400'}`}>
                        {item.name} ({item.value.toFixed(1)}h)
                     </span>
                  </div>
               ))}
             </div>
          </div>

          {/* Eternal Return & Key Metrics Combined for Space Efficiency */}
          <div className="space-y-6">
             {/* Eternal Return */}
             {lifeContext && lifeContext.eternalReturnScore !== undefined && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden h-[160px] flex flex-col justify-center">
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2">
                       <Infinity className="w-5 h-5 text-purple-400" />
                       <h3 className="text-sm font-serif font-bold text-slate-200">Eterno Retorno</h3>
                     </div>
                     <div className={`text-2xl font-mono ${eternalScore > 70 ? 'text-emerald-400' : eternalScore < 40 ? 'text-red-400' : 'text-amber-400'}`}>
                       {eternalScore}/100
                     </div>
                   </div>
                   <div className="w-full bg-slate-800 h-1.5 rounded-full mb-3">
                      <div 
                         className={`h-full rounded-full transition-all duration-1000 ${eternalScore > 70 ? 'bg-emerald-500' : eternalScore < 40 ? 'bg-red-500' : 'bg-amber-500'}`} 
                         style={{ width: `${eternalScore}%` }}
                      ></div>
                   </div>
                   <p className="text-xs text-slate-400 italic line-clamp-2">"{eternalText}"</p>
                </div>
             )}

             {/* Mini Metrics Grid */}
             <div className="grid grid-cols-2 gap-4 h-[140px]">
                <div className="glass-card p-4 rounded-xl flex flex-col justify-center">
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Tempo Resgatado</div>
                   <div className="text-2xl font-serif text-white">{totalHoursBought}h</div>
                </div>
                <div className="glass-card p-4 rounded-xl flex flex-col justify-center">
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">ROI de Tempo</div>
                   <div className="text-2xl font-serif text-emerald-400">+{roi}%</div>
                </div>
             </div>
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
