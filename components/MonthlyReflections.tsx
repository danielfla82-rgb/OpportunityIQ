
import React, { useState, useEffect } from 'react';
import { MonthlyNote } from '../types';
import { Calendar, Save, CheckCircle2, PenLine, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';

interface Props {
  notes: MonthlyNote[];
  onSave: (note: MonthlyNote) => void;
}

const MONTHS = [
  { num: 1, name: 'Janeiro' },
  { num: 2, name: 'Fevereiro' },
  { num: 3, name: 'Março' },
  { num: 4, name: 'Abril' },
  { num: 5, name: 'Maio' },
  { num: 6, name: 'Junho' },
  { num: 7, name: 'Julho' },
  { num: 8, name: 'Agosto' },
  { num: 9, name: 'Setembro' },
  { num: 10, name: 'Outubro' },
  { num: 11, name: 'Novembro' },
  { num: 12, name: 'Dezembro' },
];

const MonthlyReflections: React.FC<Props> = ({ notes, onSave }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [currentContent, setCurrentContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // When a month is selected, find the existing note
  useEffect(() => {
    if (selectedMonth !== null) {
      const note = notes.find(n => n.month === selectedMonth && n.year === selectedYear);
      setCurrentContent(note?.content || "");
    }
  }, [selectedMonth, selectedYear, notes]);

  const handleSave = () => {
    if (selectedMonth === null) return;
    
    setIsSaving(true);
    const note: MonthlyNote = {
      month: selectedMonth,
      year: selectedYear,
      content: currentContent,
      updatedAt: new Date().toISOString()
    };
    
    // Simulate slight delay for UX
    setTimeout(() => {
        onSave(note);
        setIsSaving(false);
        setSelectedMonth(null); // Close editor after save
    }, 600);
  };

  const getNotePreview = (monthNum: number) => {
    const note = notes.find(n => n.month === monthNum && n.year === selectedYear);
    return note ? note.content : null;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12 space-y-8">
      
      {/* Header with Year Selector */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 gap-4">
        <div className="text-center md:text-left">
           <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
             <div className="bg-emerald-900/30 p-2 rounded-lg border border-emerald-500/30">
                <Calendar className="w-6 h-6 text-emerald-400" />
             </div>
             <h2 className="text-2xl font-serif text-slate-100">Reflexões Mensais</h2>
           </div>
           <p className="text-slate-400 text-sm">
             Acompanhe seu progresso, dores e vitórias. O que não é medido não é gerenciado.
           </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-xl border border-slate-800">
           <button 
             onClick={() => setSelectedYear(prev => prev - 1)}
             className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
           >
              <ChevronLeft className="w-5 h-5" />
           </button>
           <span className="text-xl font-mono text-white font-bold px-2">{selectedYear}</span>
           <button 
             onClick={() => setSelectedYear(prev => prev + 1)}
             className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
           >
              <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Grid of Months */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {MONTHS.map((m) => {
            const preview = getNotePreview(m.num);
            const isCurrentMonth = new Date().getMonth() + 1 === m.num && new Date().getFullYear() === selectedYear;

            return (
              <div 
                 key={m.num}
                 onClick={() => setSelectedMonth(m.num)}
                 className={`
                    group relative p-6 rounded-xl border transition-all duration-300 cursor-pointer min-h-[200px] flex flex-col
                    ${preview 
                        ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800' 
                        : 'bg-slate-950/50 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900'}
                    ${isCurrentMonth ? 'ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}
                 `}
              >
                 <div className="flex justify-between items-start mb-4">
                    <span className={`text-lg font-serif font-bold ${isCurrentMonth ? 'text-emerald-400' : 'text-slate-200'}`}>
                       {m.name}
                    </span>
                    {preview ? (
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                       <PenLine className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                    )}
                 </div>

                 <div className="flex-1">
                    {preview ? (
                       <p className="text-sm text-slate-400 line-clamp-4 leading-relaxed font-sans">
                          {preview}
                       </p>
                    ) : (
                       <div className="h-full flex items-center justify-center">
                          <span className="text-xs text-slate-600 italic group-hover:text-slate-500">
                             Adicionar nota...
                          </span>
                       </div>
                    )}
                 </div>

                 {/* Hover Action */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px] rounded-xl">
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 font-medium text-sm flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                       <Edit3 className="w-4 h-4" /> {preview ? "Editar Reflexão" : "Escrever"}
                    </div>
                 </div>
              </div>
            );
         })}
      </div>

      {/* Editor Modal Overlay */}
      {selectedMonth !== null && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
               {/* Modal Header */}
               <div className="flex items-center justify-between p-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                     <h3 className="text-2xl font-serif text-white">
                        {MONTHS.find(m => m.num === selectedMonth)?.name} {selectedYear}
                     </h3>
                     <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-1 rounded border border-emerald-900">
                        {currentContent.length} caracteres
                     </span>
                  </div>
                  <button 
                     onClick={() => setSelectedMonth(null)}
                     className="text-slate-400 hover:text-white transition-colors"
                  >
                     Esc (Fechar)
                  </button>
               </div>

               {/* Editor Area */}
               <textarea 
                  className="flex-1 w-full bg-slate-950 p-6 text-slate-200 text-lg leading-relaxed outline-none resize-none font-sans placeholder-slate-700"
                  placeholder="Quais foram as vitórias? Onde você falhou? O que aprendeu? Escreva sem filtros..."
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  autoFocus
               />

               {/* Modal Footer */}
               <div className="p-6 border-t border-slate-800 flex justify-end gap-4 bg-slate-900 rounded-b-2xl">
                  <button 
                     onClick={() => setSelectedMonth(null)}
                     className="px-6 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                  >
                     Cancelar
                  </button>
                  <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                     {isSaving ? (
                        <>Salvando...</>
                     ) : (
                        <>
                           <Save className="w-5 h-5" /> Salvar Reflexão
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default MonthlyReflections;
