
import React, { useState } from 'react';
import { FinancialProfile, CalculatedTHL } from '../types';
import { Bug, Clipboard, Mail, CheckCircle2, AlertOctagon } from 'lucide-react';

interface Props {
  profile: FinancialProfile;
  thl: CalculatedTHL;
}

const BugTracker: React.FC<Props> = ({ profile, thl }) => {
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [copied, setCopied] = useState(false);

  const generateReport = () => {
    // Attempt to grab year compass data from storage safely
    let yearCompassData = {};
    try {
        const stored = localStorage.getItem('oiq_user_data_v1');
        if (stored) {
            const parsed = JSON.parse(stored);
            yearCompassData = parsed.yearCompass || {};
        }
    } catch(e) {}

    const sysInfo = {
      appVersion: "v5.4.0",
      userAgent: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      time: new Date().toISOString(),
      profile_snapshot: {
        netIncome: profile.netIncome,
        hours: profile.contractHoursWeekly,
        commute: profile.commuteMinutesDaily
      },
      thl_snapshot: thl,
      goals_snapshot: yearCompassData
    };

    return `
=== OpportunityIQ Bug Report ===

[DESCRIPTION]
${description}

[STEPS TO REPRODUCE]
${steps}

[SYSTEM INFO]
${JSON.stringify(sysInfo, null, 2)}
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Bug Report: OpportunityIQ v5.4.0");
    const body = encodeURIComponent(generateReport());
    window.open(`mailto:support@opportunityiq.app?subject=${subject}&body=${body}`);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-slate-100 flex items-center justify-center gap-2">
          <Bug className="w-6 h-6 text-red-400" />
          Rastreador de Bugs
        </h2>
        <p className="text-slate-400 text-sm">
          Encontrou um erro na matrix? Ajude-nos a corrigir.
        </p>
      </div>

      <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 space-y-6">
        <div>
          <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">O que aconteceu?</label>
          <textarea 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 h-24 focus:border-red-500 outline-none resize-none"
            placeholder="Descreva o erro..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Passos para reproduzir</label>
          <textarea 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 h-24 focus:border-red-500 outline-none resize-none"
            placeholder="1. Cliquei em... 2. Digitei..."
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />
        </div>

        <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg flex items-start gap-3">
           <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
           <p className="text-xs text-red-200/80">
             Ao enviar, um "snapshot" técnico anônimo (contendo sua THL e dados de sessão) será anexado para ajudar na depuração. Nenhuma informação pessoal identificável (PII) é coletada.
           </p>
        </div>

        <div className="flex gap-4">
           <button 
             onClick={handleCopy}
             disabled={!description}
             className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clipboard className="w-5 h-5" />}
             {copied ? "Copiado!" : "Copiar Relatório"}
           </button>
           <button 
             onClick={handleEmail}
             disabled={!description}
             className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
           >
             <Mail className="w-5 h-5" />
             Enviar por Email
           </button>
        </div>
      </div>
    </div>
  );
};

export default BugTracker;
