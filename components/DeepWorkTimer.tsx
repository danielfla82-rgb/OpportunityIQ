import React, { useState, useEffect } from 'react';
import { CalculatedTHL } from '../types';
import { Play, Pause, Square, Clock, Banknote, History } from 'lucide-react';

interface Props {
  thl: CalculatedTHL;
}

const DeepWorkTimer: React.FC<Props> = ({ thl }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState<{duration: number, value: number}[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggle = () => setIsActive(!isActive);

  const reset = () => {
    if (seconds > 60) {
       // Save session if longer than 1 min
       setSessions(prev => [{
         duration: seconds,
         value: (seconds / 3600) * thl.realTHL
       }, ...prev]);
    }
    setSeconds(0);
    setIsActive(false);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Real-time value calculation
  const valueGenerated = (seconds / 3600) * thl.realTHL;
  const totalValueGenerated = sessions.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
       <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif text-slate-100">Modo Deep Work</h2>
          <p className="text-slate-400">
             Transforme foco em valor. Baseado na sua THL de <span className="text-emerald-400 font-mono">R$ {thl.realTHL.toFixed(2)}/h</span>.
          </p>
       </div>

       {/* Timer Card */}
       <div className={`
          relative rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-500 border
          ${isActive 
            ? 'bg-indigo-950/20 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' 
            : 'bg-slate-900 border-slate-800'}
       `}>
          {isActive && (
             <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-pulse"></div>
             </div>
          )}

          <div className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-semibold">Tempo Focado</div>
          
          <div className={`text-8xl font-mono mb-8 font-light ${isActive ? 'text-white' : 'text-slate-500'}`}>
             {formatTime(seconds)}
          </div>

          <div className="flex flex-col items-center mb-10">
             <div className="text-sm text-slate-400 mb-1">Valor Produtivo Gerado</div>
             <div className={`text-4xl font-serif ${isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                R$ {valueGenerated.toFixed(2)}
             </div>
          </div>

          <div className="flex gap-4">
             <button 
               onClick={toggle}
               className={`
                 w-16 h-16 rounded-full flex items-center justify-center transition-all
                 ${isActive 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 pl-1'}
               `}
             >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
             </button>
             
             {seconds > 0 && !isActive && (
               <button 
                 onClick={reset}
                 className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all border border-slate-700"
               >
                  <Square className="w-5 h-5 fill-slate-300" />
               </button>
             )}
          </div>
       </div>

       {/* Session History */}
       {sessions.length > 0 && (
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <History className="w-4 h-4" /> Histórico da Sessão
               </h3>
               <div className="text-emerald-400 font-mono text-sm">Total: R$ {totalValueGenerated.toFixed(2)}</div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
               {sessions.map((session, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded text-sm border border-slate-800/50">
                    <div className="flex items-center gap-2 text-slate-400">
                       <Clock className="w-3 h-3" />
                       {formatTime(session.duration)}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500/80 font-mono">
                       <Banknote className="w-3 h-3" />
                       R$ {session.value.toFixed(2)}
                    </div>
                 </div>
               ))}
            </div>
         </div>
       )}
    </div>
  );
};

export default DeepWorkTimer;