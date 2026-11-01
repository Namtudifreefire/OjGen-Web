import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Trash2, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('OjGen Uncaught Runtime Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleCopy = () => {
    const text = `OjGen Web Error:\n${this.state.error?.message || ''}\n\nStack:\n${this.state.error?.stack || ''}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard?.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">Đã xảy ra sự cố không mong muốn (Crash Protected)</h1>
                <p className="text-xs text-slate-400">
                  Hệ thống bảo vệ lỗi đã bắt và cô lập sự cố để ngăn ứng dụng bị treo hoàn toàn.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs overflow-auto max-h-60 text-red-300">
              <div className="font-semibold text-red-400 mb-1">
                {this.state.error?.name || 'Error'}: {this.state.error?.message}
              </div>
              {this.state.error?.stack && (
                <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {this.state.error.stack}
                </pre>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={this.handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{this.state.copied ? 'Đã sao chép' : 'Sao chép chi tiết lỗi'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={this.handleResetStorage}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition"
                  title="Xóa bộ nhớ cục bộ nếu dữ liệu bị lỗi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa cache &amp; khôi phục</span>
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tải lại trang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
