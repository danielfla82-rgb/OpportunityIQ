import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-serif text-white">Falha Crítica no Sistema</h1>
                <p className="text-red-400 text-sm">O OpportunityIQ encontrou um erro irrecuperável.</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-lg border border-slate-800 p-4 mb-6 font-mono text-xs text-slate-400 overflow-auto max-h-64">
              <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800 pb-2">
                <Terminal className="w-3 h-3" /> Stack Trace
              </div>
              <p className="text-red-300 mb-2">{this.state.error && this.state.error.toString()}</p>
              <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reinicializar Sistema
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;