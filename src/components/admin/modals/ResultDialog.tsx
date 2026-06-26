import type { ResultDialogState } from '../types';

interface ResultDialogProps {
  dialog: ResultDialogState;
  onClose: () => void;
}

export default function ResultDialog({ dialog, onClose }: ResultDialogProps) {
  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
      <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl bg-white ${dialog.type === 'success' ? 'border-emerald-200' : 'border-red-200'}`} style={{ animation: 'popIn 280ms ease-out' }}>
        <style>{`@keyframes popIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${dialog.type === 'success' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-red-100 text-red-700 animate-pulse'}`}>
            {dialog.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            )}
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{dialog.title}</p>
            <p className="mt-2 text-sm text-slate-600">{dialog.message}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition">Đóng</button>
        </div>
      </div>
    </div>
  );
}
