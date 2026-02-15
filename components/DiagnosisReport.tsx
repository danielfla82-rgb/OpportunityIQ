
import React, { useState } from 'react';
import { ContextAnalysisResult, CalculatedTHL, AppView, FinancialProfile } from '../types';
import { Activity, AlertTriangle, CheckCircle2, Clock, DollarSign, TrendingUp, ShieldAlert, FileText, Download, BrainCircuit, ShoppingBag, Target, BarChart2, Info, X, Zap, Crown, Package, Sword, Ghost, MapPin, Calendar, Globe, RefreshCcw } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, ResponsiveContainer, ReferenceLine, Cell, Area, ComposedChart } from 'recharts';

interface Props {
  result: ContextAnalysisResult;
  thl: CalculatedTHL;
  profile?: FinancialProfile; 
  onApply: () => void;
  onBack: () => void;
  onNavigate: (view: AppView) => void;
}

const DiagnosisReport: React.FC<Props> = ({ result, thl, profile, onApply, onBack, onNavigate }) => {
  const [showMatrixInfo, setShowMatrixInfo] = useState(false);

  // SAFE ARRAY ACCESS: Defensively handle potential undefined props from corrupted data
  const suggestions = Array.isArray(result?.delegationSuggestions) ? result.delegationSuggestions : [];
  const sunkCostSuspects = Array.isArray(result?.sunkCostSuspects) ? result.sunkCostSuspects : [];
  const lifestyleRisks = Array.isArray(result?.lifestyleRisks) ? result.lifestyleRisks : [];

  // Calculations for the report with explicit filtering
  const potentialHoursReclaimed = suggestions
    .filter(i => i && typeof i.hoursSaved === 'number')
    .reduce((acc, curr) => acc + (curr.hoursSaved || 0), 0);
    
  const estimatedCost = suggestions
    .filter(i => i && typeof i.cost === 'number')
    .reduce((acc, curr) => acc + (curr.cost || 0), 0);
    
  const valueGenerated = potentialHoursReclaimed * thl.realTHL;
  const netPotentialGain = valueGenerated - estimatedCost;

  // Chart Data Preparation
  const coords = result?.matrixCoordinates || { x: 50, y: 50, quadrantLabel: 'Em Análise' };
  const matrixData = [{ x: coords.x, y: coords.y, z: 100, label: 'Você' }];

  // Calculate "Sovereignty Score" (Distance from 100,100)
  // Max distance (from 0,0 to 100,100) is ~141.42
  const distFromOptimal = Math.sqrt(Math.pow(100 - (coords.x || 0), 2) + Math.pow(100 - (coords.y || 0), 2));
  const sovereigntyScore = Math.max(0, Math.min(100, 100 - (distFromOptimal / 1.41))).toFixed(0);

  // Tactical Insight Logic
  const getTacticalInsight = (x: number, y: number) => {
    if (x >= 50 && y >= 50) return {
       icon: Crown,
       color: "text-emerald-400",
       bg: "bg-emerald-950/30",
       border: "border-emerald-500/30",
       title: "Manutenção de Soberania",
       diagnosis: "Você atingiu o estado de Criança (Übermensch). Alta autonomia e eficiência.",
       action: "O perigo agora é a complacência. Use seu tempo livre para criar ativos que independam da sua presença. Jogue o Jogo Infinito."
    };
    if (x < 50 && y >= 50) return {
       icon: Package,
       color: "text-amber-400",
       bg: "bg-amber-950/30",
       border: "border-amber-500/30",
       title: "Quebrar as Correntes",
       diagnosis: "Arquétipo do Camelo. Você carrega muito peso (alta eficiência) mas não escolhe o destino (baixa autonomia).",
       action: "Sua prioridade absoluta é DELEGAR. Você está vendendo sua vida barato. Use a Matriz de Delegação para comprar sua liberdade de volta."
    };
    if (x >= 50 && y < 50) return {
       icon: Sword,
       color: "text-red-400",
       bg: "bg-red-950/30",
       border: "border-red-500/30",
       title: "Domar o Caos",
       diagnosis: "Arquétipo do Leão. Você tem liberdade e diz 'Eu Quero', mas gasta energia demais lutando batalhas operacionais.",
       action: "Você precisa de SISTEMAS. Sua ineficiência está drenando sua vontade de potência. Use o Analisador 80/20 para eliminar o ruído."
    };
    return {
       icon: Ghost,
       color: "text-slate-400",
       bg: "bg-slate-800/50",
       border: "border-slate-700",
       title: "Sair da Inércia",
       diagnosis: "O Último Homem. Baixa autonomia e baixa eficiência. O conforto é sua armadilha.",
       action: "Defina um Norte Verdadeiro urgente. Você precisa de um 'Porquê' antes de otimizar o 'Como'. Use a Bússola Anual."
    };
  };

  const tactic = getTacticalInsight(coords.x || 50, coords.y || 50);
  const TacticIcon = tactic.icon;

  // Conversions
  const calculatedMonthlyIncome = thl.realTHL * thl.monthlyTotalHours;
  const displayedMonthlyIncome = calculatedMonthlyIncome > 0 ? calculatedMonthlyIncome : (profile?.netIncome || 0);
  const weeklyIncome = displayedMonthlyIncome / 4.33;

  // --- IBGE/FGV LOGIC (Updated to Monthly Income Standards) ---
  const getSocialClass = (income: number) => {
    if (income >= 22000) return { 
        label: "Classe A", 
        percentile: 95, 
        range: "> R$ 22k", 
        color: "#10b981", // emerald-500
        desc: "Elite Econômica (Topo 5%). Capacidade plena de investimento e blindagem patrimonial." 
    };
    if (income >= 7100) return { 
        label: "Classe B", 
        percentile: 85, 
        range: "R$ 7.1k - 22k", 
        color: "#6366f1", // indigo-500
        desc: "Classe Média Alta. Conforto e acesso a bens de qualidade, mas risco de 'Lifestyle Creep'." 
    };
    if (income >= 2900) return { 
        label: "Classe C", 
        percentile: 50, 
        range: "R$ 2.9k - 7.1k", 
        color: "#f59e0b", // amber-500
        desc: "Classe Média. A maior força de trabalho do país. Vulnerável a instabilidades econômicas." 
    };
    if (income >= 1500) return { 
        label: "Classe D", 
        percentile: 25, 
        range: "R$ 1.5k - 2.9k", 
        color: "#f97316", // orange-500
        desc: "Vulnerabilidade. Renda comprometida quase totalmente com subsistência e contas básicas." 
    };
    return { 
        label: "Classe E", 
        percentile: 10, 
        range: "< R$ 1.5k", 
        color: "#ef4444", // red-500
        desc: "Extrema Vulnerabilidade. Foco total em sobrevivência imediata." 
    };
  };

  const socialClass = getSocialClass(displayedMonthlyIncome);
  
  // Generate Bell Curve Data
  const generateBellCurveData = () => {
     const data = [];
     const mean = 50;
     const stdDev = 15;
     
     for (let i = 0; i <= 100; i += 2) {
        // Gaussian function
        const density = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - mean) / stdDev, 2));
        data.push({
           percentile: i,
           density: density * 1000 // scale up for chart
        });
     }
     return data;
  };

  const bellCurveData = generateBellCurveData();

  const isDefaultSummary = result.summary?.includes("Análise carregada do histórico") || (result.summary?.length || 0) < 20;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/50">
          <Activity className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-serif text-white">Diagnóstico Operacional de Vida</h2>
          <p className="text-slate-400 text-sm">Análise baseada na sua rotina e ativos declarados.</p>
        </div>
      </div>

      {/* Top Row: Matrix & IBGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
         {/* Chart Section - Matrix */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col relative h-full">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4" /> Matriz de Potência
               </h3>
               <button 
                  onClick={() => setShowMatrixInfo(true)}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-950/30 px-2 py-1 rounded border border-indigo-900/50"
               >
                  <Info className="w-3 h-3" /> Filosofia
               </button>
            </div>
            
            <div className="h-48 w-full relative mb-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
               {/* Fixed Overlay Labels */}
               <div className="absolute top-2 left-2 text-[10px] text-amber-500/70 font-bold uppercase tracking-wider z-10 pointer-events-none">O Camelo</div>
               <div className="absolute top-2 right-2 text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider z-10 text-right pointer-events-none">Übermensch</div>
               <div className="absolute bottom-2 left-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider z-10 pointer-events-none">Último Homem</div>
               <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider z-10 text-right pointer-events-none">Viajante</div>

               <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <XAxis type="number" dataKey="x" name="Autonomia" domain={[-10, 110]} tick={false} axisLine={{ stroke: '#475569' }} />
                     <YAxis type="number" dataKey="y" name="Eficiência" domain={[-10, 110]} tick={false} axisLine={{ stroke: '#475569' }} />
                     <ZAxis type="number" dataKey="z" range={[100, 100]} />
                     <ReferenceLine x={50} stroke="#334155" strokeDasharray="3 3" />
                     <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
                     
                     <Scatter data={matrixData} fill="#8884d8">
                        {matrixData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill="#10b981" />
                        ))}
                     </Scatter>
                  </ScatterChart>
               </ResponsiveContainer>
            </div>

            <div className={`mt-auto rounded-lg p-4 border ${tactic.bg} ${tactic.border}`}>
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                     <TacticIcon className={`w-5 h-5 ${tactic.color}`} />
                     <div>
                        <div className={`text-sm font-bold uppercase tracking-wide ${tactic.color}`}>{tactic.title}</div>
                        <div className="text-[10px] text-slate-400">Score de Soberania: <span className="text-white font-mono">{sovereigntyScore}/100</span></div>
                     </div>
                  </div>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                     <div 
                        className={`h-full ${tactic.color.replace('text', 'bg')}`} 
                        style={{ width: `${sovereigntyScore}%` }}
                     ></div>
                  </div>
               </div>
               <p className="text-xs text-slate-300 leading-relaxed mb-3">{tactic.diagnosis}</p>
               <div className="flex items-start gap-2 pt-3 border-t border-white/5">
                  <Zap className={`w-3 h-3 ${tactic.color} mt-0.5 shrink-0`} />
                  <p className="text-xs font-medium text-white italic">"{tactic.action}"</p>
               </div>
            </div>

            {/* Matrix Info Overlay */}
            {showMatrixInfo && (
               <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-10 p-6 rounded-xl overflow-y-auto animate-fade-in flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <h4 className="text-lg font-serif text-white">As Três Metamorfoses</h4>
                     <button onClick={() => setShowMatrixInfo(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-4 text-sm text-slate-300">
                     <div><strong className="text-amber-400 block">O Camelo</strong>Carrega o peso dos "Tu Deves".</div>
                     <div><strong className="text-red-400 block">O Leão</strong>Diz "Eu Quero". Conquista liberdade.</div>
                     <div><strong className="text-emerald-400 block">A Criança</strong>Diz "Sim" à vida. Criação pura.</div>
                  </div>
               </div>
            )}
         </div>

         {/* IBGE & Income Distribution - ENHANCED */}
         <div className="flex flex-col h-full space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-4">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" /> Distribuição de Renda (FGV)
                 </h3>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${socialClass.color === '#10b981' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : socialClass.color === '#6366f1' ? 'bg-indigo-950 text-indigo-400 border-indigo-900' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {socialClass.range}
                 </span>
               </div>
               
               <div className="h-40 w-full relative mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={bellCurveData} margin={{top: 30, right: 0, bottom: 0, left: 0}}>
                        <defs>
                          <linearGradient id="gradientCurve" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="density" stroke="#6366f1" fill="url(#gradientCurve)" strokeWidth={2} />
                        
                        <ReferenceLine x={25} stroke="#334155" strokeDasharray="3 3" label={{ position: 'insideBottom', value: 'D', fill: '#64748b', fontSize: 10 }} />
                        <ReferenceLine x={50} stroke="#334155" strokeDasharray="3 3" label={{ position: 'insideBottom', value: 'C', fill: '#64748b', fontSize: 10 }} />
                        <ReferenceLine x={85} stroke="#334155" strokeDasharray="3 3" label={{ position: 'insideBottom', value: 'B', fill: '#64748b', fontSize: 10 }} />
                        <ReferenceLine x={95} stroke="#334155" strokeDasharray="3 3" label={{ position: 'insideBottom', value: 'A', fill: '#64748b', fontSize: 10 }} />

                        <ReferenceLine 
                           x={socialClass.percentile} 
                           stroke={socialClass.color} 
                           strokeWidth={2}
                           label={{ position: 'top', value: 'VOCÊ', fill: socialClass.color, fontSize: 10, fontWeight: 'bold' }} 
                        />
                        <XAxis dataKey="percentile" type="number" hide domain={[0, 100]} />
                        <YAxis hide />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>

               <div className="flex items-end justify-between border-t border-slate-800 pt-3 mt-auto">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: socialClass.color }}></div>
                        <div className="text-lg font-serif text-white leading-none">{socialClass.label}</div>
                     </div>
                     <div className="text-xs text-slate-500">Faixa: {socialClass.range} (Mensal)</div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] text-slate-500 uppercase tracking-widest">Renda Mensal Est.</div>
                     <div className="font-mono text-xl text-white">R$ {displayedMonthlyIncome.toLocaleString('pt-BR')}</div>
                  </div>
               </div>
            </div>

            {/* Context Details Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
               
               {/* Interpretation */}
               <div className="flex gap-3 items-start">
                  <Globe className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                     "{socialClass.desc}"
                  </p>
               </div>

               {/* Conversions */}
               <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
                  <div className="bg-black/20 p-2 rounded border border-slate-800/50">
                     <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" /> Semanal
                     </div>
                     <div className="font-mono text-slate-200 text-sm">R$ {weeklyIncome.toFixed(0)}</div>
                  </div>
                  <div className="bg-black/20 p-2 rounded border border-slate-800/50">
                     <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                        <Zap className="w-3 h-3" /> THL Real
                     </div>
                     <div className="font-mono text-slate-200 text-sm">R$ {thl.realTHL.toFixed(2)}/h</div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl mb-8 relative overflow-hidden flex items-start gap-4">
         <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText className="w-32 h-32 text-slate-100" />
         </div>
         <div className="flex-1 relative z-10">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">Resumo Executivo</h3>
            <p className="text-lg text-slate-200 font-serif leading-relaxed italic">
               "{result.summary || "Sem resumo disponível."}"
            </p>
         </div>
         
         {isDefaultSummary && (
            <button 
               onClick={onBack}
               className="relative z-10 p-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg transition-colors border border-indigo-500/30 flex flex-col items-center gap-1"
               title="Atualizar Análise"
            >
               <RefreshCcw className="w-5 h-5" />
               <span className="text-[10px] font-bold">Atualizar</span>
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Opportunity Column */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-emerald-400 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5" />
                 Oportunidades Detectadas
              </h3>
              <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-1 rounded border border-emerald-900">
                 {suggestions.length} Sugestões
              </span>
           </div>

           <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <div className="text-xs text-slate-500 uppercase">Tempo Resgatável</div>
                    <div className="text-2xl font-mono text-white">{potentialHoursReclaimed}h <span className="text-sm text-slate-500">/mês</span></div>
                 </div>
                 <div>
                    <div className="text-xs text-slate-500 uppercase">Lucro Potencial</div>
                    <div className="text-2xl font-mono text-emerald-400">+R$ {netPotentialGain.toFixed(0)}</div>
                 </div>
              </div>
              <div className="text-xs text-slate-400 border-t border-emerald-500/10 pt-3">
                 Ao delegar essas tarefas, você "compra" horas pagando menos que sua THL.
              </div>
           </div>

           <div className="space-y-3">
              {suggestions.map((item, idx) => (
                 <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between items-center group hover:border-emerald-500/30 transition-colors">
                    <div>
                       <div className="font-medium text-slate-200">{item.name}</div>
                       <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" /> Salva {item.hoursSaved}h
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <DollarSign className="w-3 h-3" /> Custa R${item.cost}
                       </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors">
                       <CheckCircle2 className="w-4 h-4 text-slate-900 opacity-0 group-hover:opacity-100" />
                    </div>
                 </div>
              ))}
              {suggestions.length === 0 && (
                 <div className="text-center p-4 text-slate-500 text-sm italic border border-dashed border-slate-800 rounded-lg">
                    Nenhuma oportunidade óbvia de delegação encontrada.
                 </div>
              )}
           </div>
        </div>

        {/* Risk Column */}
        <div className="space-y-6">
           <h3 className="text-lg font-serif text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Pontos de Atenção
           </h3>

           {/* Sunk Cost Warnings */}
           <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Suspeitas de Custo Irrecuperável</h4>
              {sunkCostSuspects.map((item, idx) => (
                 <div key={idx} className="bg-amber-950/10 border border-amber-500/20 p-4 rounded-lg flex flex-col gap-3">
                    <div>
                        <div className="text-amber-200 font-medium mb-1">{item.title}</div>
                        <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                 </div>
              ))}
              {sunkCostSuspects.length === 0 && (
                 <p className="text-slate-500 text-sm">Nenhum projeto crítico detectado.</p>
              )}
           </div>

           {/* Lifestyle Risks */}
           <div className="space-y-4 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Riscos de Estilo de Vida</h4>
              {lifestyleRisks.map((risk, idx) => (
                 <div key={idx} className="bg-red-950/10 border border-red-500/20 p-4 rounded-lg flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300">{risk}</p>
                    </div>
                    <button 
                      onClick={() => onNavigate(AppView.LIFESTYLE_INFLATOR)}
                      className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-200 py-2 px-3 rounded border border-red-700/50 flex items-center justify-center gap-2 transition-colors w-full"
                    >
                        <ShoppingBag className="w-3 h-3" />
                        Auditar Compra no Corretor
                    </button>
                 </div>
              ))}
               {lifestyleRisks.length === 0 && (
                 <p className="text-slate-500 text-sm">Estilo de vida parece compatível.</p>
              )}
           </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 md:static md:bg-transparent md:border-0 md:p-0 flex flex-col md:flex-row gap-4 justify-end mt-12 z-50">
         <button 
           onClick={onBack}
           className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
         >
           Voltar e Refinar
         </button>
         <button 
           onClick={onApply}
           className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1"
         >
           <Download className="w-5 h-5" />
           Implementar Plano Operacional
         </button>
      </div>
    </div>
  );
};

export default DiagnosisReport;
