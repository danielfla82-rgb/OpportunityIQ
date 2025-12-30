
import React, { useState } from 'react';
import { CalculatedTHL, InactionAnalysis } from '../types';
import { getInactionAnalysis } from '../services/geminiService';
import { Snowflake, Flame, ArrowRight, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface Props {
  thl: CalculatedTHL;
}

const InactionCalculator: React.FC<Props> = ({ thl }) => {
  const [decision, setDecision] = useState("");
  const [financialCost, setFinancialCost] = useState(""); // Monthly
  const [emotionalCost, setEmotionalCost] = useState("5"); // 1-10 Scale
  
  const [analysis, setAnalysis] = useState<InactionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!decision.trim()) return;
    setLoading(true);

    // Convert emotional score to monetary value using THL
    // Assumption: High stress (10) consumes 10 hours of mental bandwidth per month
    const emotionalMonetary = (parseInt(emotionalCost) * thl.realTHL); 
    const totalMonthly = (parseFloat(financialCost) || 0) + emotionalMonetary;

    const result = await getInactionAnalysis(decision, totalMonthly);
    setAnalysis(result);
    setLoading(false);
  };

  const chartData = analysis ? [
    { name: '6 Meses', cost: analysis.cumulativeCost6Months },
    { name: '1 Ano', cost: analysis.cumulativeCost1year },
    { name: '3 Anos', cost: analysis.cumulativeCost3years },
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in h-full">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-slate-100 flex items-center gap-2">
            <Snowflake className="w-6 h-6 text-cyan-400" />
            Calculadora de Inação
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            O Viés do Status Quo faz você acreditar que não fazer nada é grátis. Não é.
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Qual decisão você está adiando?</label>
            <input 
              className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 outline-none focus:border-cyan-500"
              placeholder="Ex: Terminar relacionamento, mudar de emprego, demitir cliente..."
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            />
          </div>

          <div>
             <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Custo Financeiro Mensal (R$)</label>
             <input 
                type="number"
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 outline-none focus:border-cyan-500"
                placeholder="Perda de renda, custo de manutenção..."
                value={financialCost}
                onChange={(e) => setFinancialCost(e.target.value)}
             />
          </div>

          <div>
             <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Estresse Emocional (1-10)</label>
             <input 
                type="range"
                min="0" max="10"
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                value={emotionalCost}
                onChange={(e) => setEmotionalCost(e.target.value)}
             />
             <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Paz Total</span>
                <span className="text-cyan-400 font-mono">Nível {emotionalCost}</span>
                <span>Burnout</span>
             </div>
          </div>

          {/* Info Box */}
          <div className="bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-lg flex gap-3 mt-2">
             <HelpCircle className="w-5 h-5 text-cyan-500 shrink-0" />
             <div className="text-xs text-slate-400">
                <strong className="text-cyan-400 block mb-1">Como calculamos o custo emocional?</strong>
                Multiplicamos seu nível de estresse pela sua THL. Se você tem estresse nível 5, assumimos que você perde 5 horas de produtividade mental por mês apenas ruminando o problema.
             </div>
          </div>

          <button 
             onClick={handleAnalyze}
             disabled={loading || !decision.trim()}
             className="w-full mt-2 bg-cyan-900/50 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-100 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Flame className="w-5 h-5" />}
             {loading ? "Quantificando a Covardia..." : "Calcular Preço da Inércia"}
           </button>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
         {!analysis && !loading && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 p-8 text-center min-h-[400px]">
              <Snowflake className="w-16 h-16 text-slate-700 mb-4 opacity-50" />
              <p className="text-slate-500 max-w-xs">
                A inércia é uma força poderosa. Quebre-a visualizando o custo acumulado no gráfico.
              </p>
            </div>
         )}

         {analysis && (
            <div className="animate-fade-in space-y-6">
               {/* Big Number */}
               <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                  <h3 className="text-red-400 text-sm uppercase tracking-widest mb-2 font-bold">Custo Acumulado em 3 Anos</h3>
                  <div className="text-4xl md:text-5xl font-serif text-white mb-2">
                     R$ {analysis.cumulativeCost3years.toLocaleString()}
                  </div>
                  <p className="text-red-200/60 text-sm">Se você não fizer nada hoje.</p>
               </div>

               {/* Chart */}
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-72">
                  <h4 className="text-xs text-slate-500 uppercase mb-4">Projeção de Sangria de Recursos</h4>
                  <ResponsiveContainer width="100%" height="90%">
                     <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                           dataKey="name" 
                           stroke="#94a3b8" 
                           fontSize={12} 
                           tickLine={false} 
                           axisLine={false} 
                        />
                        <YAxis 
                           stroke="#94a3b8" 
                           fontSize={11} 
                           tickLine={false} 
                           axisLine={false} 
                           tickFormatter={(val) => `R$${val/1000}k`} 
                        />
                        <Tooltip 
                           cursor={{fill: 'rgba(255,255,255,0.05)'}}
                           contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                           formatter={(val: number) => [`R$ ${val.toLocaleString()}`, 'Custo Acumulado']}
                        />
                        <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={50}>
                           {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 2 ? '#ef4444' : '#64748b'} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>

               {/* Analysis Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                     <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Custos Invisíveis
                     </h4>
                     <ul className="space-y-2">
                        {analysis.intangibleCosts.map((cost, idx) => (
                           <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                              {cost}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-950/30 to-slate-900 border border-cyan-900/50 p-5 rounded-lg flex flex-col justify-center text-center">
                     <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-2">Veredito da IA</h4>
                     <p className="text-lg text-white font-serif italic">"{analysis.callToAction}"</p>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default InactionCalculator;
