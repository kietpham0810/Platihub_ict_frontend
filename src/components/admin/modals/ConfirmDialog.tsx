import type { ConfirmDialogState } from '../types';

interface ConfirmDialogProps {
  dialog: ConfirmDialogState;
  selectedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({ dialog, selectedCount, onCancel, onConfirm }: ConfirmDialogProps) {
  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 
            ${dialog.type === 'approve' ? 'bg-blue-50 text-blue-600' :
              dialog.type === 'hide' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
            {dialog.type === 'approve' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            {dialog.type === 'hide' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
            {dialog.type === 'delete' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {dialog.type === 'approve' ? 'Xác nhận Duyệt bài' :
             dialog.type === 'hide' ? 'Xác nhận Ẩn sản phẩm' : 'Xác nhận Xóa dữ liệu'}
          </h3>
          <p className="text-gray-500 mb-8 text-sm">
            Bạn có chắc chắn muốn {dialog.type === 'approve' ? 'hiển thị' : dialog.type === 'hide' ? 'đưa về kho chờ duyệt' : 'xóa vĩnh viễn'} <strong className="text-gray-900 text-lg">{selectedCount}</strong> sản phẩm?
          </p>

          <div className="flex w-full gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
            <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-colors shadow-md 
              ${dialog.type === 'approve' ? 'bg-blue-600 hover:bg-blue-700' :
                dialog.type === 'hide' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {dialog.type === 'approve' ? 'Duyệt bài' : dialog.type === 'hide' ? 'Ẩn ngay' : 'Xóa ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
