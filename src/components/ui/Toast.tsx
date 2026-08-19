"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 250);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
  };

  const bgStyles = {
    success: "bg-white border-emerald-300 text-slate-800 shadow-emerald-500/10",
    error: "bg-white border-rose-300 text-slate-800 shadow-rose-500/10",
    warning: "bg-white border-amber-300 text-slate-800 shadow-amber-500/10",
    info: "bg-white border-sky-300 text-slate-800 shadow-sky-500/10",
  };

  const borderAccent = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
  };

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ${
        bgStyles[toast.type]
      } ${
        isExiting
          ? "opacity-0 translate-x-8 scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-in slide-in-from-top-4"
      }`}
    >
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${borderAccent[toast.type]}`} />
      
      <div className="flex items-start gap-3 pl-1.5">
        <div className="mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0 pr-2">
          {toast.title && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
