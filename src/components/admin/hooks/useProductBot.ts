import { useState } from 'react';
import { buildApiUrl } from '../../../constants/config';
import type { BotReport } from '../types';

interface UseProductBotArgs {
  fetchProducts: () => Promise<void>;
  showError: (title: string, message: string) => void;
  closeResult: () => void;
}

export function useProductBot({ fetchProducts, showError, closeResult }: UseProductBotArgs) {
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [botReport, setBotReport] = useState<BotReport | null>(null);
  const [crawlUrl, setCrawlUrl] = useState<string>('');

  const executeBotCrawl = async (url: string, offset: number = 0) => {
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
        fetchProducts();

        const totalFound = payload.total_links_found ?? payload.total_links ?? 0;
        const added = payload.new_inserted ?? 0;
        const updated = payload.updated_specifications ?? 0;
        const successDetails = `Đã cào xong ${added} sản phẩm mới, cập nhật ${updated}. Tổng link trong danh mục: ${totalFound}.`;

        if (payload.has_more) {
          const wantMore = window.confirm(
            `${successDetails}\nĐã xong batch hiện tại. Bạn có muốn tiếp tục cào thêm 5 sản phẩm nữa không?`
          );
          if (wantMore) {
            await executeBotCrawl(url, payload.next_offset ?? offset + 5);
          } else {
            alert('Đã dừng quá trình cào dữ liệu.');
            setIsBotRunning(false);
            setCrawlUrl('');
          }
        } else {
          alert(`${successDetails}\nTuyệt vời! Đã quét sạch danh mục này.`);
          setIsBotRunning(false);
          setCrawlUrl('');
        }
      } else {
        showError('Lỗi Bot', `Cảnh báo từ Động cơ Bot: ${data.message}`);
        setIsBotRunning(false);
      }
    } catch {
      showError('Lỗi kết nối', 'Không thể kết nối đến máy chủ Backend.');
      setIsBotRunning(false);
    }
  };

  const handleRunBot = async () => {
    if (!crawlUrl.trim()) {
      showError('Thiếu URL', 'Vui lòng dán link cần lấy dữ liệu sản phẩm vào ô trước khi chạy Bot!');
      return;
    }
    closeResult();
    setBotReport(null);
    executeBotCrawl(crawlUrl, 0);
  };

  return {
    isBotRunning,
    botReport,
    crawlUrl,
    setCrawlUrl,
    handleRunBot,
    executeBotCrawl,
  };
}
