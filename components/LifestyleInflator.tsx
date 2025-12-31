
import React, { useState } from 'react';
import { CalculatedTHL, LifestyleAudit } from '../types';
import { getLifestyleAudit } from '../services/geminiService';
import { ShoppingBag, Hourglass, TrendingUp, ShieldCheck, Loader2, ArrowDownRight, AlertOctagon, Calculator } from 'lucide-react';

interface Props {
  thl: CalculatedTHL;
}

const LifestyleInflator: React.FC<Props> = ({ thl }) => {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  
  const [audit, setAudit] = useState<LifestyleAudit | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    if (!item.trim() || !price) return;
    setLoading(true);
    const result = await getLifestyleAudit(item, parseFloat(price));
    
    // Safety check for zero division
    const hourlyRate = thl.realTHL > 0 ? thl.realTHL : 1; 
    
    result.hoursOfLifeLost = parseFloat(price) / hourlyRate;
    setAudit(result);
    setLoading(false);
  };

  const getVerdictColor = (v: string) => {
    switch(v) {
      case 'BUY': return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/20';
      case 'DOWNGRADE': return 'text-amber-400 border-amber-500/50 bg-amber-950/20';
      default: return 'text-slate-400 border-slate-500/50 bg-slate-950/20';
    }
  };

  // If user hasn't calculated THL yet, show warning
  if (thl.realTHL <= 0) {
     return (
        <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in bg-slate-900/50 border border-slate-800 rounded-xl p-8">
           <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Calculator className="w-8 h-8 text-amber-500" />
           </div>
           <h2 className="text-xl font-serif text-white mb-2">Dados Insuficientes</h2>
           <p className="text-slate-400 text-sm mb-6">
              Para calcular o "Custo em Liberdade" de uma compra, precisamos saber quanto vale a sua hora.
              Por favor, complete a Calculadora THL primeiro.
           </p>
        </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
       <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-slate-100 flex items-center justify-center gap-2">
            <ShoppingBag className="w-6 h-6 text-pink-400" />
            Corretor Hedônico
          </h2>
          <p className="text-slate-400 text-sm">
             A "Adaptação Hedônica" faz você desejar coisas que logo perderão a graça. 
             Converta preços em <span className="text-pink-400 font-mono">Tempo de Liberdade</span> antes de comprar.
          </p>
       </div>

       <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Item Desejado</label>
            <input 
               className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none"
               placeholder="Ex: iPhone 16 Pro, Carro Novo, Bolsa de Grife..."
               value={item}
               onChange={(e) => setItem(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Preço (R$)</label>
            <input 
               type="number"
               className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none"
               placeholder="0.00"
               value={price}
               onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <button 
             onClick={handleAudit}
             disabled={loading || !item || !price}
             className="w-full md:w-auto px-8 bg-pink-900/40 hover:bg-pink-900/60 border border-pink-700/50 text-pink-100 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
             {loading ? "Auditando..." : "Auditar Compra"}
           </button>
       </div>

       {audit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
             {/* Cost in Life */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-pink-500 transition-colors"></div>
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                   <Hourglass className="w-5 h-5" />
                   <h3 className="text-sm font-bold uppercase tracking-widest">Custo em Liberdade</h3>
                </div>
                <div className="text-4xl font-serif text-white mb-1">
                   {audit.hoursOfLifeLost.toFixed(1)} <span className="text-lg text-slate-500 font-sans">horas</span>
                </div>
                <p className="text-xs text-slate-500">
                   Baseado na sua THL, é isso que você precisa trabalhar para pagar.
                   Isso equivale a <strong className="text-slate-300">{(audit.hoursOfLifeLost / 8).toFixed(1)} dias</strong> de trabalho escravo.
                </p>
             </div>

             {/* Opportunity Cost */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-emerald-500 transition-colors"></div>
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                   <TrendingUp className="w-5 h-5" />
                   <h3 className="text-sm font-bold uppercase tracking-widest">Custo Futuro (10 Anos)</h3>
                </div>
                <div className="text-4xl font-serif text-white mb-1">
                   R$ {audit.futureValueLost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-slate-500">
                   Se você investisse esse dinheiro a 7% a.a. (rendimento real) em vez de gastar.
                </p>
             </div>

             {/* Pareto Alternative */}
             <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                   <h3 className="text-lg font-serif text-white flex items-center gap-2">
                      <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                      Alternativa Pareto (80/20)
                   </h3>
                   <span className={`px-4 py-1 rounded-full text-xs font-bold border ${getVerdictColor(audit.verdict)}`}>
                      VEREDITO: {audit.verdict}
                   </span>
                </div>

                {audit.paretoAlternative.name === "Erro na Análise" ? (
                    <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-3">
                        <AlertOctagon className="w-8 h-8 text-red-500" />
                        <div className="text-sm text-red-200">
                           <strong className="block mb-1">Falha na Inteligência</strong>
                           A IA não conseguiu analisar este item. Tente simplificar o nome (ex: "Celular" em vez de "iPhone 15 Pro Max 1TB Azul").
                        </div>
                    </div>
                ) : (
                    <div className="bg-black/20 rounded-lg p-5 border border-white/5 flex flex-col md:flex-row gap-6">
                       <div className="flex-1">
                          <h4 className="text-emerald-400 font-bold mb-1">{audit.paretoAlternative.name}</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">"{audit.paretoAlternative.reasoning}"</p>
                       </div>
                       <div className="text-right border-l border-white/10 pl-6 min-w-[150px]">
                          <div className="text-xs text-slate-500 uppercase">Preço Estimado</div>
                          <div className="text-xl font-mono text-white">R$ {audit.paretoAlternative.priceEstimate.toLocaleString()}</div>
                          <div className="text-xs text-emerald-500 mt-1">
                             Economia de {((1 - (audit.paretoAlternative.priceEstimate / parseFloat(price))) * 100).toFixed(0)}%
                          </div>
                       </div>
                    </div>
                )}
             </div>
          </div>
       )}
    </div>
  );
};

export default LifestyleInflator;
