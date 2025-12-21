
import React from 'react';
import { YearlyCompassData, CalculatedTHL } from '../types';
import { Compass, Target, DollarSign, CheckCircle2, Circle, Mountain, Flag, Calendar, Rocket, Crown } from 'lucide-react';

interface Props {
  data: YearlyCompassData;
  thl: CalculatedTHL;
  onUpdate: (data: YearlyCompassData) => void;
}

const YearlyGoals: React.FC<Props> = ({ data, thl, onUpdate }) => {

  const handleChange = (field: keyof YearlyCompassData, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleGoalTextChange = (goalKey: 'goal1' | 'goal2' | 'goal3', text: string) => {
    onUpdate({
      ...data,
      [goalKey]: { ...data[goalKey], text }
    });
  };

  const toggleGoalCompletion = (goalKey: 'goal1' | 'goal2' | 'goal3') => {
    onUpdate({
      ...data,
      [goalKey]: { ...data[goalKey], completed: !data[goalKey].completed }
    });
  };

  const handleFinancialChange = (field: 'targetMonthlyIncome' | 'deadlineMonth', value: any) => {
     // Auto calculate Target THL based on current work hours structure
     // If user changes target income, we estimate the THL needed
     let newFinancial = { ...data.financialGoal, [field]: value };
     
     if (field === 'targetMonthlyIncome') {
        const income = parseFloat(value) || 0;
        // Avoid division by zero from stats
        const hours = thl.monthlyTotalHours > 0 ? thl.monthlyTotalHours : 160; 
        newFinancial.targetTHL = income / hours;
     }

     onUpdate({ ...data, financialGoal: newFinancial });
  };

  // Calculate Progress for Financial Goal
  const incomeProgress = data.financialGoal.targetMonthlyIncome > 0 
    ? (thl.realTHL * thl.monthlyTotalHours / data.financialGoal.targetMonthlyIncome) * 100 
    : 0;

  // Icons and Labels Configuration
  const goalIcons = [Mountain, Rocket, Crown];
  const goalLabels = ["A Montanha", "A Alavanca", "A Coroa"];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12 space-y-8">
      
      {/* Header */}
      <div className="text-center border-b border-slate-800 pb-8">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
           <Compass className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-serif text-slate-100">Bússola Anual</h2>
        <p className="text-slate-400 mt-2 max-w-lg mx-auto">
           "Quem tem um 'porquê' enfrenta qualquer 'como'." Defina suas 3 Grandes Pedras e seu Norte Financeiro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Financial North Star */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-slate-900/80 border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="flex items-center gap-2 mb-6">
                 <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Flag className="w-5 h-5 text-emerald-400" />
                 </div>
                 <h3 className="font-serif font-bold text-slate-200 uppercase tracking-widest text-sm">Meta Financeira</h3>
              </div>

              <div className="space-y-6 flex-1">
                 <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Renda Mensal Alvo</label>
                    <div className="relative group">
                       <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400" />
                       <input 
                          type="number"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-9 text-slate-200 focus:border-emerald-500 outline-none font-mono text-lg"
                          placeholder="0.00"
                          value={data.financialGoal.targetMonthlyIncome || ''}
                          onChange={(e) => handleFinancialChange('targetMonthlyIncome', e.target.value)}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Prazo (Mês/Ano)</label>
                    <div className="relative group">
                       <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400" />
                       <input 
                          type="text"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-9 text-slate-200 focus:border-emerald-500 outline-none text-sm"
                          placeholder="Ex: Dezembro 2024"
                          value={data.financialGoal.deadlineMonth || ''}
                          onChange={(e) => handleFinancialChange('deadlineMonth', e.target.value)}
                       />
                    </div>
                 </div>

                 {/* Results Display */}
                 <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 mt-auto">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs text-emerald-400/70 uppercase">THL Necessária</span>
                       <span className="text-xl font-mono text-emerald-400">R$ {data.financialGoal.targetTHL.toFixed(2)}/h</span>
                    </div>
                    
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                       <div 
                         className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                         style={{ width: `${Math.min(incomeProgress, 100)}%` }}
                       ></div>
                    </div>
                    <div className="text-[10px] text-center text-slate-500">
                       Você está a {Math.min(incomeProgress, 100).toFixed(1)}% do objetivo
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* The 3 Big Rocks */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           {[1, 2, 3].map((num) => {
              const key = `goal${num}` as 'goal1' | 'goal2' | 'goal3';
              const goal = data[key];
              const GoalIcon = goalIcons[num - 1];
              const goalLabel = goalLabels[num - 1];
              
              return (
                 <div 
                    key={key} 
                    className={`
                       group relative bg-slate-900/60 border rounded-2xl p-6 transition-all duration-300
                       ${goal.completed ? 'border-indigo-500/30 bg-indigo-950/10' : 'border-slate-800 hover:border-slate-700'}
                    `}
                 >
                    <div className="flex items-start gap-4">
                       <div className="mt-1">
                          <button 
                             onClick={() => toggleGoalCompletion(key)}
                             className={`
                                w-8 h-8 rounded-full flex items-center justify-center border transition-all
                                ${goal.completed 
                                   ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                                   : 'bg-slate-950 border-slate-700 text-slate-600 hover:border-indigo-500/50'}
                             `}
                          >
                             {goal.completed ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-4 h-4" />}
                          </button>
                       </div>
                       
                       <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <GoalIcon className="w-3 h-3" /> Grande Pedra #{num} ({goalLabel})
                             </span>
                             {goal.completed && <span className="text-[10px] bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded-full">Concluído</span>}
                          </div>
                          
                          <textarea
                             className={`
                                w-full bg-transparent border-0 p-0 text-xl font-serif outline-none resize-none overflow-hidden
                                placeholder:text-slate-700 focus:placeholder:text-slate-800 transition-colors
                                ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-200'}
                             `}
                             placeholder={`Qual é a sua meta "${goalLabel}"?`}
                             value={goal.text}
                             onChange={(e) => handleGoalTextChange(key, e.target.value)}
                             rows={2}
                             disabled={goal.completed}
                          />
                       </div>
                    </div>
                    
                    {/* Decorative element for incomplete goals */}
                    {!goal.completed && (
                       <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                          <GoalIcon className="w-24 h-24 text-white opacity-5" />
                       </div>
                    )}
                 </div>
              );
           })}
           
           <div className="text-center pt-4">
              <p className="text-xs text-slate-600 italic">
                 "Não superestime o que você pode fazer em um mês, nem subestime o que pode fazer em um ano."
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default YearlyGoals;
