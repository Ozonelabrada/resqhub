import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error } as ErrorBoundaryState;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (and future telemetry)
    // eslint-disable-next-line no-console
    console.error('Captured error in ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // reload the page to get a clean state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h2 className="text-lg font-black text-rose-600">Something went wrong</h2>
            <p className="text-sm text-slate-500 mt-2">An unexpected error occurred while rendering the app. The details are logged to the console.</p>

            {this.state.error && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 overflow-auto max-h-40">
                <pre className="whitespace-pre-wrap">{String(this.state.error?.message)}</pre>
              </div>
            )}

            {this.state.errorInfo?.componentStack && (
              <details className="mt-3 text-xs text-slate-400">
                <summary className="cursor-pointer font-bold">Component stack</summary>
                <pre className="whitespace-pre-wrap mt-2">{this.state.errorInfo.componentStack}</pre>
              </details>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={this.reset} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold">Reload</button>
              <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-slate-50 border rounded-lg">Go Home</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
