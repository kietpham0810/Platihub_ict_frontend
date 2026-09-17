import { useEffect, useRef, useState } from 'react';
import { API_CONFIG, adminAuthHeaders, buildApiUrl } from '../../../constants/config';
import type { CrawlCategoryNode, CrawlCategoryTree, FilteredCrawlProgress, FilteredCrawlResult } from '../types';

interface FilteredCrawlModalProps {
  onDone: () => void; // gọi lại fetchProducts() sau khi cào xong, để tab "Chờ duyệt" cập nhật ngay
  onSessionExpired: () => void;
}

const CHIP_OPTIONS = [
  { label: 'Tất cả chip', value: '' },
  { label: 'Intel Core i5', value: 'i5' },
  { label: 'Intel Core i7', value: 'i7' },
  { label: 'Intel Core i9', value: 'i9' },
  { label: 'AMD Ryzen 5', value: 'ryzen 5' },
  { label: 'AMD Ryzen 7', value: 'ryzen 7' },
  { label: 'AMD Ryzen 9', value: 'ryzen 9' },
];

const RAM_OPTIONS = [
  { label: 'Tất cả RAM', value: '' },
  { label: '8GB', value: '8gb' },
  { label: '16GB', value: '16gb' },
  { label: '32GB', value: '32gb' },
  { label: '64GB', value: '64gb' },
];

export default function FilteredCrawlModal({ onDone, onSessionExpired }: FilteredCrawlModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tree, setTree] = useState<CrawlCategoryTree>({});
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState('');

  const [categoryKey, setCategoryKey] = useState('');
  const [path, setPath] = useState<CrawlCategoryNode[]>([]);
  const [chip, setChip] = useState('');
  const [ram, setRam] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [quantity, setQuantity] = useState('20');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<FilteredCrawlResult | null>(null);
  const [progress, setProgress] = useState<FilteredCrawlProgress | null>(null);
  const [error, setError] = useState('');
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!isOpen || Object.keys(tree).length > 0) return;

    const loadTree = async () => {
      setIsLoadingTree(true);
      setTreeError('');
      try {
        const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GET_CONFIGS));
        const data = await res.json();
        if (data.status === 'success' && data.data?.crawl_category_tree) {
          const parsed: CrawlCategoryTree = JSON.parse(data.data.crawl_category_tree);
          setTree(parsed);
          const firstKey = Object.keys(parsed)[0];
          if (firstKey) setCategoryKey(firstKey);
        } else {
          setTreeError('Chưa có danh mục nào được cấu hình để cào theo bộ lọc.');
        }
      } catch {
        setTreeError('Không tải được danh mục. Kiểm tra kết nối tới máy chủ.');
      } finally {
        setIsLoadingTree(false);
      }
    };
    loadTree();
  }, [isOpen, tree]);

  const rootNode = categoryKey ? tree[categoryKey] : undefined;

  // Xây danh sách các cấp dropdown con (Nhóm -> Hãng -> Dòng con), dựa trên
  // các lựa chọn đã chọn ở path. Dừng khi node hiện tại không còn children,
  // hoặc cấp đó chưa được chọn.
  const levels: CrawlCategoryNode[][] = [];
  {
    let current: CrawlCategoryNode | undefined = rootNode;
    while (current?.children && current.children.length > 0) {
      levels.push(current.children);
      current = path[levels.length - 1];
      if (!current) break;
    }
  }

  const deepestSelected = path.length > 0 ? path[path.length - 1] : rootNode;
  const targetUrl = deepestSelected?.url || '';
  const targetLabel = deepestSelected?.label || '';

  const handleSelectAtLevel = (level: number, label: string) => {
    if (!label) {
      setPath(path.slice(0, level));
      return;
    }
    const options = levels[level];
    const node = options.find(n => n.label === label);
    if (!node) return;
    const newPath = path.slice(0, level);
    newPath[level] = node;
    setPath(newPath);
  };

  const resetForm = () => {
    setPath([]);
    setChip('');
    setRam('');
    setPriceMin('');
    setPriceMax('');
    setQuantity('20');
    setResult(null);
    setProgress(null);
    setError('');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    resetForm();
  };

  // Ước tính thời gian còn lại: dựa trên tốc độ quét trung bình (giây/sản
  // phẩm đã quét) x số sản phẩm ước tính còn phải quét nữa mới đủ số lượng
  // yêu cầu (suy ra từ tỉ lệ "khớp bộ lọc" quan sát được tính tới thời điểm
  // hiện tại).
  const estimateEtaSeconds = (p: FilteredCrawlProgress): number | null => {
    if (p.scanned === 0) return null;
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    const avgPerItem = elapsedSec / p.scanned;
    const remainingWanted = Math.max(0, p.want_count - p.new_inserted);
    if (remainingWanted === 0) return 0;

    const hitRate = p.new_inserted / p.scanned;
    const remainingScansEstimate =
      hitRate > 0 ? remainingWanted / hitRate : Math.max(0, p.scan_limit - p.scanned);

    return Math.round(avgPerItem * remainingScansEstimate);
  };

  const formatEta = (seconds: number) => {
    if (seconds <= 0) return 'sắp xong';
    if (seconds < 60) return `~${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `~${m}p${s > 0 ? ` ${s}s` : ''}`;
  };

  const handleSubmit = async () => {
    if (!targetUrl) {
      setError('Vui lòng chọn đầy đủ danh mục cần cào.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setResult(null);
    setProgress(null);
    startTimeRef.current = Date.now();

    try {
      const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CRAWL_FILTERED), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
        body: JSON.stringify({
          url: targetUrl,
          quantity: Number(quantity) || 20,
          price_min: priceMin,
          price_max: priceMax,
          chip,
          ram,
        }),
      });

      if (res.status === 401) {
        onSessionExpired();
        return;
      }

      if (!res.body) {
        throw new Error('no-stream');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: FilteredCrawlResult | null = null;
      let finalError = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          let obj: Record<string, unknown>;
          try {
            obj = JSON.parse(line);
          } catch {
            continue;
          }

          if (obj.type === 'progress') {
            setProgress(obj as unknown as FilteredCrawlProgress);
          } else if (obj.type === 'result') {
            if (obj.status === 'success') {
              finalResult = obj.data as FilteredCrawlResult;
            } else {
              finalError = (obj.message as string) || 'Không cào được sản phẩm nào khớp bộ lọc.';
            }
          }
        }
      }

      if (finalResult) {
        setResult(finalResult);
        onDone();
      } else {
        setError(finalError || 'Không nhận được kết quả từ máy chủ.');
      }
    } catch {
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLaptopCategory = categoryKey === 'Laptop';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 px-4 py-2 rounded-lg font-bold text-xs md:text-sm shadow flex items-center gap-2 transition-all bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-800"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        Cào theo bộ lọc
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Cào sản phẩm theo bộ lọc</h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isLoadingTree && <div className="text-center text-gray-500 text-sm py-4">Đang tải danh mục...</div>}
              {treeError && <div className="bg-amber-50 text-amber-700 text-sm px-3 py-2.5 rounded-lg border border-amber-100">{treeError}</div>}

              {!isLoadingTree && rootNode && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Danh mục lớn</label>
                    <select
                      value={categoryKey}
                      onChange={(e) => { setCategoryKey(e.target.value); setPath([]); }}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {Object.entries(tree).map(([key, node]) => (
                        <option key={key} value={key}>{node.label}</option>
                      ))}
                    </select>
                  </div>

                  {levels.map((options, level) => (
                    <div key={level}>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                        {level === 0 ? 'Nhóm' : level === 1 ? 'Hãng' : 'Dòng con'} <span className="normal-case font-medium text-gray-400">(tuỳ chọn, không chọn = cào cả {level === 0 ? rootNode.label : path[level - 1]?.label})</span>
                      </label>
                      <select
                        value={path[level]?.label || ''}
                        onChange={(e) => handleSelectAtLevel(level, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Tất cả --</option>
                        {options.map(opt => (
                          <option key={opt.label} value={opt.label}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 font-semibold">
                    Sẽ cào từ: {targetLabel}
                  </div>

                  {isLaptopCategory && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Chip</label>
                        <select value={chip} onChange={(e) => setChip(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          {CHIP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">RAM</label>
                        <select value={ram} onChange={(e) => setRam(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          {RAM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Giá từ</label>
                      <input type="number" min={0} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Giá đến</label>
                      <input type="number" min={0} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="∞" className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Số lượng</label>
                      <input type="number" min={1} max={50} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>

                  {isSubmitting && progress && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold text-blue-800">
                          {progress.new_inserted}/{progress.want_count} sản phẩm mới
                        </span>
                        <span className="text-xs font-semibold text-blue-500">
                          {(() => {
                            const eta = estimateEtaSeconds(progress);
                            return eta === null ? 'đang tính...' : `Còn ${formatEta(eta)}`;
                          })()}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-200"
                          style={{ width: `${Math.min(100, Math.round((progress.new_inserted / Math.max(1, progress.want_count)) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-blue-500">
                        Đã quét {progress.scanned}/{progress.scan_limit} sản phẩm ứng viên
                        {progress.excluded > 0 && ` · bỏ qua ${progress.excluded} quảng cáo/KM`}
                        {progress.filtered_out > 0 && ` · ${progress.filtered_out} không khớp bộ lọc`}
                      </p>
                    </div>
                  )}

                  {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-lg border border-red-100">{error}</div>}

                  {result && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm text-emerald-800 space-y-1">
                      <p className="font-bold">✓ Đã thêm {result.new_inserted} sản phẩm mới, cập nhật {result.updated_specifications}.</p>
                      <p className="text-xs text-emerald-600">Đã quét {result.scanned}/{result.total_links_in_category} sản phẩm trong danh mục, bỏ qua {result.excluded} quảng cáo/KM, {result.filtered_out} không khớp bộ lọc.</p>
                      {!result.reached_target && <p className="text-xs font-semibold text-amber-600">Chưa đủ số lượng yêu cầu — danh mục không còn đủ sản phẩm khớp bộ lọc.</p>}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !targetUrl}
                    className={`w-full py-3 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 ${
                      isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting && (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity=".3" />
                        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    )}
                    {isSubmitting ? 'Đang cào...' : 'Bắt đầu cào'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
