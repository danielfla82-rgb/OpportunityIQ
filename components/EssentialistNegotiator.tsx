import React, { useState } from 'react';
import { MessageSquareX, Copy, Check, Hand, ShieldAlert } from 'lucide-react';
import { getRefusalScripts } from '../services/geminiService';

const EssentialistNegotiator: React.FC = () => {
  const [request, setRequest] = useState('');
  const [scripts, setScripts] = useState<{diplomatic: string, direct: string, alternative: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!request.trim()) return;
    setLoading(true);
    const result = await getRefusalScripts(request);
    setScripts(result);
    setLoading(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in h-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            O Negociador Essencialista
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            "Se você não protege suas prioridades, os outros decidirão por você." 
            Cole aqui o pedido inconveniente que você recebeu e a IA vai te ajudar a dizer NÃO.
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
           <label className="block text-xs text-slate-500 uppercase tracking-widest mb-3">O Pedido / Convite Recebido</label>
           <textarea 
             className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 h-40 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
             placeholder='Ex: "Poderia participar de uma reunião rápida para alinharmos as ideias do happy hour da empresa?" ou "Você consegue fazer esse favorzinho rapidinho?"'
             value={request}
             onChange={(e) => setRequest(e.target.value)}
           />
           <button 
             onClick={handleGenerate}
             disabled={loading || !request.trim()}
             className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
           >
             {loading ? "Consultando Greg McKeown..." : "Gerar Scripts de Recusa"}
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {!scripts && !loading && (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 p-8 text-center">
            <MessageSquareX className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500 max-w-xs">
              Não diga "talvez" se você quer dizer "não". A indecisão custa caro na sua THL.
            </p>
          </div>
        )}

        {scripts && (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-emerald-500/30 transition-colors group relative">
               <div className="absolute top-4 right-4">
                  <button onClick={() => copyToClipboard(scripts.diplomatic, 'diplomatic')} className="text-slate-600 hover:text-white">
                    {copied === 'diplomatic' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
               </div>
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">A Via Diplomática</h3>
               </div>
               <p className="text-slate-300 italic leading-relaxed">"{scripts.diplomatic}"</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-amber-500/30 transition-colors group relative">
               <div className="absolute top-4 right-4">
                  <button onClick={() => copyToClipboard(scripts.alternative, 'alternative')} className="text-slate-600 hover:text-white">
                    {copied === 'alternative' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
               </div>
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                 <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">A Negociação Suave</h3>
               </div>
               <p className="text-slate-300 italic leading-relaxed">"{scripts.alternative}"</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-red-500/30 transition-colors group relative">
               <div className="absolute top-4 right-4">
                  <button onClick={() => copyToClipboard(scripts.direct, 'direct')} className="text-slate-600 hover:text-white">
                    {copied === 'direct' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
               </div>
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                 <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Essencialista Puro</h3>
               </div>
               <p className="text-slate-300 italic leading-relaxed">"{scripts.direct}"</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EssentialistNegotiator;