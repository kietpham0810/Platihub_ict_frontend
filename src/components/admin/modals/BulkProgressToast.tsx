import type { ConfirmType } from '../types';

interface BulkProgressToastProps {
  active: boolean;
  type: ConfirmType | null;
  current: number;
  total: number;
  lastNames: string[];
}

const LABELS: Record<string, { verb: string; done: string }> = {
  approve: { verb: 'Đang duyệt sản phẩm', done: 'Đã duyệt xong' },
  hide: { verb: 'Đang ẩn sản phẩm', done: 'Đã ẩn xong' },
  delete: { verb: 'Đang xóa sản phẩm', done: 'Đã xóa xong' },
};

export default function BulkProgressToast({ active, type, current, total, lastNames }: BulkProgressToastProps) {
  if (!active || !type || total === 0) return null;

  const pct = Math.round((current / total) * 100);
  const label = LABELS[type] ?? LABELS.approve;

  return (
    <div
      className="fixed right-6 bottom-6 z-[90] w-[320px] rounded-xl p-4"
      style={{ background: '#111114', border: '1px solid #2c2c31' }}
    >
      <style>{`
        @keyframes bpt-spin { to { transform: rotate(360deg); } }
        .bpt-spin { animation: bpt-spin .8s linear infinite; }
        @keyframes bpt-row-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
        .bpt-row-in { animation: bpt-row-in .25s ease both; }
      `}</style>

      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: '#f2652233', border: '1px solid #f2652255' }}
        >
          <svg className="bpt-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f26522" strokeWidth={3}>
            <circle cx="12" cy="12" r="9" strokeOpacity=".25" />
            <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-[12.5px] font-bold text-[#e8e8ea]">{label.verb}</div>
          <div className="text-[10.5px] text-[#5b5b63]" style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace' }}>
            tuần tự · đừng đóng trang
          </div>
        </div>
      </div>

      <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: '#1a1a1d', border: '1px solid #232327' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: '#f26522', transition: 'width .15s ease' }}
        />
      </div>
      <div
        className="flex justify-between text-[10.5px] font-medium mb-3"
        style={{ color: '#8b8b93', fontFamily: 'ui-monospace, Menlo, Consolas, monospace' }}
      >
        <span>
          {current}
          <span style={{ color: '#5b5b63' }}>/{total}</span>
        </span>
        <span>{pct}%</span>
      </div>

      {lastNames.length > 0 && (
        <div className="flex flex-col gap-1 pt-2" style={{ borderTop: '1px solid #232327' }}>
          {lastNames.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="bpt-row-in flex items-center gap-1.5 text-[10.5px] text-[#8b8b93] overflow-hidden"
              style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace' }}
            >
              <span style={{ color: '#3ddc84', flexShrink: 0 }}>&#10003;</span>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
