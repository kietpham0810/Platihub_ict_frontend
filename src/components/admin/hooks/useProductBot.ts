import { useState, useCallback } from 'react';
import { buildApiUrl } from '../../../constants/config';
import type { BotReport } from '../types';
import type { useDialogs } from './useDialogs';

interface UseProductBotArgs {
  fetchProducts: () => Promise<void>;
  dialogs: ReturnType<typeof useDialogs>;
}

interface AccumulatedReport {
  added: number;
  updated: number;
  totalFound: number;
}

export function useProductBot({ fetchProducts, dialogs }: UseProductBotArgs) {
  const { showSuccess, showError, setBotContinueDialog } = dialogs;
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [botReport, setBotReport] = useState<BotReport | null>(null);
  const [crawlUrl, setCrawlUrl] = useState<string>('');
  const [accumulatedReport, setAccumulatedReport] = useState<AccumulatedReport>({
    added: 0,
    updated: 0,
    totalFound: 0,
  });

  const executeBotCrawl = useCallback(async (url: string, offset: number = 0) => {
    setIsBotRunning(true);
    try {
      const response = await fetch(
        `${buildApiUrl('/bot_sync_hoanghapc.php')}?url=${encodeURIComponent(url)}&offset=${offset}`,
        { method: 'GET', headers: { Accept: 'application/json' } }
      );

      const data = await response.json();

      if (data.status === 'success') {
        const payload = data.data || data;
        setBotReport(payload);
        await fetchProducts();

        const added = payload.new_inserted ?? 0;
        const updated = payload.updated_specifications ?? 0;
        const totalFound = payload.total_links_found ?? payload.total_links ?? 0;
        
        const newAccumulated = {
          added: accumulatedReport.added + added,
          updated: accumulatedReport.updated + updated,
          totalFound: totalFound, // Total found is usually the same across batches
        };
        setAccumulatedReport(newAccumulated);

        const summary = `Batch này: Thêm ${added}, cập nhật ${updated}. Tổng cộng: Thêm ${newAccumulated.added}, cập nhật ${newAccumulated.updated}. Tổng link: ${totalFound}.`;

        if (payload.has_more) {
          setBotContinueDialog({
            isOpen: true,
            nextOffset: payload.next_offset ?? offset + 5,
            url: url,
            summary: summary,
          });
        } else {
          showSuccess('Hoàn tất!', `${summary}\nĐã quét sạch danh mục này.`);
          setIsBotRunning(false);
          setCrawlUrl('');
        }
      } else {
        showError('Lỗi Bot', `Cảnh báo từ Động cơ Bot: ${data.message}`);
        setIsBotRunning(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ Backend.';
      showError('Lỗi kết nối', errorMessage);
      setIsBotRunning(false);
    }
  }, [fetchProducts, showSuccess, showError, setBotContinueDialog, accumulatedReport]);

  const handleRunBot = async () => {
    if (!crawlUrl.trim()) {
      showError('Thiếu URL', 'Vui lòng dán link cần lấy dữ liệu sản phẩm vào ô trước khi chạy Bot!');
      return;
    }
    dialogs.closeResult();
    setBotReport(null);
    setAccumulatedReport({ added: 0, updated: 0, totalFound: 0 }); // Reset accumulated report
    executeBotCrawl(crawlUrl, 0);
  };

  const stopBot = () => {
    setIsBotRunning(false);
    showSuccess('Đã dừng', 'Quá trình cào dữ liệu đã được dừng lại.');
    setCrawlUrl('');
  };

  return {
    isBotRunning,
    botReport,
    crawlUrl,
    setCrawlUrl,
    handleRunBot,
    executeBotCrawl,
    accumulatedReport,
    stopBot,
  };
}
