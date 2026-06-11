import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  props?: any;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 md:p-8 space-y-6 text-left">
            <div className="flex items-center gap-3 text-rose-500">
              <svg className="w-8 h-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">অ্যাপ্লিকেশন ত্রুটি (Application Error)</h1>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              সরি, স্বপ্ন কম্পিউটার ইনস্টিটিউট অ্যাপটি লোড করার সময় ব্রাউজারে একটি ক্র্যাশ বা অপ্রত্যাশিত ট্রাবল হয়েছে। অনুগ্রহ করে লাইভ সিকিউরিটি পারমিশন এবং ব্রাউজার সেটিং চেক করুন।
            </p>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-700 max-h-60 overflow-auto space-y-2 font-mono text-xs">
              <p className="text-rose-400 font-bold leading-tight break-all">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="text-slate-400 leading-relaxed whitespace-pre-wrap text-[10px]">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">পরামর্শসমূহ (Troubleshooting):</h4>
              <ul className="text-xs text-slate-350 space-y-1.5 list-disc list-inside">
                <li>ব্রাউজারের ক্যাশ হার্ড রিলোড বা ক্লিয়ার করুন: <kbd className="bg-slate-700 px-1 rounded text-[10px] text-white">Ctrl + F5</kbd>।</li>
                <li>আপনার ক্লাউড ডাটাবেজের আইডি <code className="text-pink-400 bg-slate-900 px-1 rounded break-all">ai-studio-06870833-0f71-4747-bd93-5ecb321388cf</code> তৈরি করা আছে কিনা নিশ্চিত হোন।</li>
                <li>আইফ্রেমের বাইরে সম্পূর্ণ নতুন ট্যাবে সাইটটি চালু করুন।</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all text-center cursor-pointer"
              >
                আবার রিলোড করুন (Reload Page)
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                className="bg-slate-700 hover:bg-slate-600 active:bg-slate-550 text-slate-100 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
              >
                রিসেট টেস্ট (Reset State)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
