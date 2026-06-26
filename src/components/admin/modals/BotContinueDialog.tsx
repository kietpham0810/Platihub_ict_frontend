import type { BotContinueDialogState } from '../types';

interface BotContinueDialogProps {
  dialog: BotContinueDialogState;
  onStop: () => void;
  onContinue: () => void;
}

export default function BotContinueDialog({ dialog, onStop, onContinue }: BotContinueDialogProps) {
  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-3xl border border-blue-200 bg-white p-6 shadow-2xl" style={{ animation: 'popIn 280ms ease-out' }}>
        <style>{`@keyframes popIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">Tiếp tục cào dữ liệu?</p>
            <p className="mt-2 text-sm text-slate-600">{dialog.summary}</p>
          </div>
          <div className="flex w-full gap-3">
            <button onClick={onStop} className="flex-1 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition">Dừng</button>
            <button onClick={onContinue} className="flex-1 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">Tiếp tục</button>
          </div>
        </div>
      </div>
    </div>
  );
}
