import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';

export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  life?: number;
}

export interface ToastRef {
  show: (message: ToastMessage) => void;
}

const Toast = forwardRef<ToastRef>((props, ref) => {
  const [messages, setMessages] = useState<(ToastMessage & { id: string | number })[]>([]);

  const removeMessage = (id: string | number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  useImperativeHandle(ref, () => ({
    show: (message: ToastMessage) => {
      const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setMessages(prev => [...prev, { ...message, id }]);

      if (message.life) {
        setTimeout(() => removeMessage(id), message.life);
      }
    }
  }));

  const getSeverityStyles = (severity: ToastMessage['severity']) => {
    switch (severity) {
      case 'success':
        return 'bg-emerald-600 text-white shadow-emerald-200/50';
      case 'info':
        return 'bg-blue-600 text-white shadow-blue-200/50';
      case 'warn':
        return 'bg-amber-500 text-white shadow-amber-200/50';
      case 'error':
        return 'bg-red-600 text-white shadow-red-200/50';
      default:
        return 'bg-slate-800 text-white shadow-slate-200/50';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-2xl max-w-sm ${getSeverityStyles(msg.severity)} transition-all duration-300 ease-in-out border border-white/10 backdrop-blur-md animate-in slide-in-from-right-full`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="font-bold text-sm uppercase tracking-wider mb-0.5">{msg.summary}</div>
              <div className="text-sm font-medium opacity-90 leading-relaxed">{msg.detail}</div>
            </div>
            <button
              onClick={() => removeMessage(msg.id)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});;

Toast.displayName = 'Toast';

export default Toast;