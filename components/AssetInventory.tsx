
import React, { useState } from 'react';
import { AssetItem } from '../types';
import { analyzeAsset } from '../services/geminiService';
import { Plus, Trash2, Building2, Car, Laptop, TrendingUp, TrendingDown, DollarSign, Wallet, Brain, Loader2, ArrowLeft, Star, History } from 'lucide-react';

interface Props {
  assets: AssetItem[];
  setAssets: React.Dispatch<React.SetStateAction<AssetItem[]>>;
  onBack?: () => void;
}

// Generate UUID locally
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (parseInt(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c) / 4).toString(16)
  );
};

const AssetInventory: React.FC<Props> = ({ assets, setAssets, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState<Partial<AssetItem>>({
    name: '',
    description: '',
    purchaseValue: 0,
    purchaseYear: new Date().getFullYear(),
    category: 'OTHER'
  });

  const handleAdd = async () => {
    if (!newItem.name || !newItem.purchaseValue) return;
    setLoading(true);

    const analysis = await analyzeAsset(
      newItem.name, 
      newItem.description || '', 
      newItem.purchaseValue, 
      newItem.purchaseYear || 2024
    );

    const asset: AssetItem = {
      id: generateUUID(),
      name: newItem.name,
      description: newItem.description || '',
      purchaseValue: Number(newItem.purchaseValue),
      purchaseYear: Number(newItem.purchaseYear),
      category: newItem.category as any,
      aiAnalysis: analysis
    };

    setAssets(prev => [...prev, asset]);
    setNewItem({ name: '', description: '', purchaseValue: 0, purchaseYear: new Date().getFullYear(), category: 'OTHER' });
    setLoading(false);
  };

  const remove = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // Summary Metrics
  const totalInvested = assets.reduce((acc, curr) => acc + curr.purchaseValue, 0);
  const currentNetWorth = assets.reduce((acc, curr) => acc + (curr.aiAnalysis?.currentValueEstimated || curr.purchaseValue), 0);
  const monthlyLiability = assets.reduce((acc, curr) => acc + (curr.aiAnalysis?.maintenanceCostMonthlyEstimate || 0), 0);

  // Sorting: Highest Value First
  const sortedAssets = [...assets].sort((a, b) => {
    const valA = a.aiAnalysis?.currentValueEstimated ?? a.purchaseValue;
    const valB = b.aiAnalysis?.currentValueEstimated ?? b.purchaseValue;
    return valB - valA;
  });

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'VEHICLE': return <Car className="w-4 h-4" />;
      case 'REAL_ESTATE': return <Building2 className="w-4 h-4" />;
      case 'ELECTRONICS': return <Laptop className="w-4 h-4" />;
      case 'INVESTMENT': return <TrendingUp className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-serif text-slate-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Inventário Patrimonial
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Liste seus ativos e passivos. A IA estimará o valor atual e o custo oculto de posse.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
           <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Patrimônio Atual Est.</div>
           <div className="text-2xl font-mono text-emerald-400">R$ {currentNetWorth.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
           <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Custo Mensal (Passivos)</div>
           <div className="text-2xl font-mono text-red-400">R$ {monthlyLiability.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
           <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Variação Total</div>
           <div className={`text-2xl font-mono ${currentNetWorth >= totalInvested ? 'text-emerald-400' : 'text-amber-400'}`}>
              {((currentNetWorth / (totalInvested || 1) - 1) * 100).toFixed(1)}%
           </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
         <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Adicionar Bem</h3>
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
               <label className="text-[10px] text-slate-500 uppercase block mb-1">Nome</label>
               <input 
                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                 placeholder="Ex: Honda Civic, MacBook M1"
                 value={newItem.name}
                 onChange={e => setNewItem({...newItem, name: e.target.value})}
               />
            </div>
            <div className="md:col-span-2">
               <label className="text-[10px] text-slate-500 uppercase block mb-1">Valor Compra</label>
               <input 
                 type="number"
                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                 placeholder="0.00"
                 value={newItem.purchaseValue || ''}
                 onChange={e => setNewItem({...newItem, purchaseValue: parseFloat(e.target.value)})}
               />
            </div>
            <div className="md:col-span-2">
               <label className="text-[10px] text-slate-500 uppercase block mb-1">Ano Compra</label>
               <input 
                 type="number"
                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                 value={newItem.purchaseYear}
                 onChange={e => setNewItem({...newItem, purchaseYear: parseFloat(e.target.value)})}
               />
            </div>
            <div className="md:col-span-2">
               <label className="text-[10px] text-slate-500 uppercase block mb-1">Categoria</label>
               <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value as any})}
               >
                  <option value="VEHICLE">Veículo</option>
                  <option value="REAL_ESTATE">Imóvel</option>
                  <option value="ELECTRONICS">Eletrônico</option>
                  <option value="INVESTMENT">Investimento</option>
                  <option value="OTHER">Outro</option>
               </select>
            </div>
            <div className="md:col-span-3">
               <button 
                 onClick={handleAdd}
                 disabled={loading || !newItem.name}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 rounded transition-all flex items-center justify-center gap-2 text-sm h-[38px]"
               >
                 {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Brain className="w-4 h-4" />}
                 {loading ? "Avaliando..." : "Cadastrar & Analisar"}
               </button>
            </div>
            <div className="md:col-span-12">
               <input 
                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-400 text-xs italic"
                 placeholder="Descrição opcional (estado de conservação, localização, etc) para refinar a análise da IA..."
                 value={newItem.description}
                 onChange={e => setNewItem({...newItem, description: e.target.value})}
               />
            </div>
         </div>
      </div>

      {/* Asset List */}
      <div className="space-y-4">
         {sortedAssets.map((asset) => {
            // Determine if asset is a "Keeper" (Appreciating or Stable)
            const isKeeper = asset.aiAnalysis?.depreciationTrend === 'APPRECIATING' || asset.aiAnalysis?.depreciationTrend === 'STABLE';
            
            return (
              <div key={asset.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                 {/* Keeper Highlight Background */}
                 {isKeeper && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none"></div>
                 )}

                 <div className="flex flex-col md:flex-row justify-between gap-4 relative z-10">
                    <div className="flex-1">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="p-1.5 bg-slate-800 rounded text-slate-400 border border-slate-700">{getIcon(asset.category)}</div>
                          <h3 className="text-lg font-medium text-white flex items-center gap-2">
                             {asset.name}
                             {isKeeper && (
                                <div className="bg-amber-950/30 border border-amber-500/30 text-amber-400 p-1 rounded-full" title="Ativo de Valor (Keeper)">
                                   <Star className="w-3 h-3 fill-amber-400" />
                                </div>
                             )}
                          </h3>
                       </div>
                       <p className="text-sm text-slate-400 mb-2 pl-10">{asset.description}</p>
                       
                       {asset.aiAnalysis && (
                          <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-lg mt-3 text-sm ml-0 md:ml-10">
                             <div className="flex items-center gap-2 mb-1 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                                <Brain className="w-3 h-3" /> Análise do Oráculo
                             </div>
                             <p className="text-slate-300 italic leading-relaxed text-xs">"{asset.aiAnalysis.commentary}"</p>
                             {asset.aiAnalysis.maintenanceCostMonthlyEstimate > 0 && (
                                <div className="mt-2 text-red-400 text-xs flex items-center gap-1 font-medium bg-red-950/20 px-2 py-1 rounded w-fit border border-red-900/30">
                                   <AlertCircle className="w-3 h-3" /> Custo Oculto Est.: R$ {asset.aiAnalysis.maintenanceCostMonthlyEstimate}/mês
                                </div>
                             )}
                          </div>
                       )}
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-end gap-4 min-w-[180px] text-right border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                       <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Valor Atual Est.</div>
                          <div className="text-2xl font-mono text-white font-bold">
                             R$ {asset.aiAnalysis?.currentValueEstimated?.toLocaleString() || asset.purchaseValue.toLocaleString()}
                          </div>
                          
                          <div className="mt-3 text-xs text-slate-500 flex flex-col items-end gap-0.5">
                             <span className="uppercase tracking-wide text-[10px]">Pago em {asset.purchaseYear}</span>
                             <span className="font-mono text-slate-400 flex items-center gap-1">
                                <History className="w-3 h-3" />
                                R$ {asset.purchaseValue.toLocaleString()}
                             </span>
                          </div>

                          <div className={`text-xs mt-3 flex items-center justify-end gap-1 font-medium px-2 py-1 rounded border w-fit ml-auto ${
                             (asset.aiAnalysis?.depreciationTrend === 'APPRECIATING') ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900' : 
                             (asset.aiAnalysis?.depreciationTrend === 'DEPRECIATING') ? 'text-red-400 bg-red-950/30 border-red-900' : 'text-slate-400 bg-slate-800 border-slate-700'
                          }`}>
                             {asset.aiAnalysis?.depreciationTrend === 'APPRECIATING' ? <TrendingUp className="w-3 h-3"/> : 
                              asset.aiAnalysis?.depreciationTrend === 'DEPRECIATING' ? <TrendingDown className="w-3 h-3"/> : null}
                             {asset.aiAnalysis?.depreciationTrend === 'APPRECIATING' ? 'Valorizando' : 
                              asset.aiAnalysis?.depreciationTrend === 'DEPRECIATING' ? 'Depreciando' : 'Estável'}
                          </div>
                       </div>
                       
                       <button 
                          onClick={() => remove(asset.id)}
                          className="text-slate-600 hover:text-red-400 p-2 transition-colors hover:bg-red-950/20 rounded"
                          title="Remover Item"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
            );
         })}
         
         {assets.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
               <Wallet className="w-12 h-12 text-slate-700 mx-auto mb-3" />
               <p className="text-slate-500">Seu inventário está vazio.</p>
            </div>
         )}
      </div>
    </div>
  );
};

// Helper component for alert circle
const AlertCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

export default AssetInventory;
