import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, RefreshCw, Copy, Check, AlertCircle } from 'lucide-react';

type ContentItem = {
  id?: number;
  contentId: string;
  product: string;
  platform: string;
  contentType: string;
  objective: string;
  content: string;
  status: string;
  approvedAt?: string;
};

const LIBRARY_API = '/api/n8n/giaothoi-content-library';

const getRows = (payload: any): ContentItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const statusStyles: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  'Pending Approval': 'bg-amber-50 text-amber-700',
  Approved: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700',
};

export default function ContentLibrary() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(LIBRARY_API, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error(`Không thể tải Content Library (HTTP ${response.status}).`);
      const payload = await response.json();
      setItems(getRows(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi tải thư viện nội dung.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const counts = useMemo(() => ({
    total: items.length,
    draft: items.filter(item => item.status === 'Draft').length,
    pending: items.filter(item => item.status === 'Pending Approval').length,
    approved: items.filter(item => item.status === 'Approved').length,
    rejected: items.filter(item => item.status === 'Rejected').length,
  }), [items]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(item => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesQuery = !normalized || [
        item.contentId, item.product, item.platform, item.contentType,
        item.objective, item.content,
      ].some(value => String(value || '').toLowerCase().includes(normalized));
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const selectedItem = items.find(item => item.contentId === selectedId) || null;

  const copyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Trình duyệt không cho phép sao chép nội dung.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#8B7656]" />
            <h1 className="text-2xl font-semibold text-[#26372E]">Content Library</h1>
          </div>
          <p className="mt-1 text-sm text-[#929A93]">
            Nơi lưu trữ tập trung các nội dung được tạo trong Content Studio.
          </p>
        </div>
        <button
          onClick={loadItems}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[#DDE4DC] bg-white px-4 py-2 text-sm font-medium text-[#26372E] hover:bg-[#F5F7F4] disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: 'Tổng nội dung', value: counts.total },
          { label: 'Bản nháp', value: counts.draft },
          { label: 'Chờ duyệt', value: counts.pending },
          { label: 'Đã duyệt', value: counts.approved },
          { label: 'Bị từ chối', value: counts.rejected },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-[#E5EAE4] bg-white p-4">
            <p className="text-xs text-[#929A93]">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#26372E]">{card.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-[#E5EAE4] bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA29B]" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Tìm theo mã bài, sản phẩm, nền tảng hoặc nội dung..."
            className="w-full rounded-lg border border-[#E5EAE4] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9A8769]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value)}
          className="rounded-lg border border-[#E5EAE4] bg-white px-3 py-2.5 text-sm text-[#46534A]"
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Draft">Draft</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#E5EAE4] bg-white py-16 text-center text-sm text-[#929A93]">
          Đang tải dữ liệu thư viện...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DDE4DC] bg-white py-16 text-center">
          <BookOpen size={30} className="mx-auto text-[#B8C0B8]" />
          <p className="mt-3 text-sm font-medium text-[#46534A]">
            {items.length === 0 ? 'Thư viện chưa có nội dung' : 'Không tìm thấy nội dung phù hợp'}
          </p>
          <p className="mt-1 text-xs text-[#929A93]">
            {items.length === 0
              ? 'Sau khi lưu bài viết từ Content Studio, nội dung sẽ xuất hiện tại đây.'
              : 'Thử thay đổi từ khóa hoặc bộ lọc trạng thái.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredItems.map(item => (
            <article key={item.contentId} className="rounded-xl border border-[#E5EAE4] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all text-[11px] font-medium text-[#929A93]">{item.contentId}</p>
                  <h2 className="mt-1 text-base font-semibold text-[#26372E]">
                    {item.product || 'Chưa phân loại sản phẩm'}
                  </h2>
                  <p className="mt-1 text-xs text-[#929A93]">{item.contentType} · {item.platform}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[item.status] || 'bg-gray-100 text-gray-700'}`}>
                  {item.status || 'Unknown'}
                </span>
              </div>
              <p className="mt-3 text-xs text-[#737E75]">Mục tiêu: {item.objective || 'Chưa xác định'}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#46534A]">
                {item.content.length > 260 ? `${item.content.slice(0, 260)}…` : item.content}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0F2EF] pt-3">
                <button
                  onClick={() => setSelectedId(item.contentId)}
                  className="text-sm font-medium text-[#647D68] hover:text-[#26372E]"
                >
                  Xem toàn bộ nội dung
                </button>
                <button
                  onClick={() => copyContent(item.content)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAE4] px-3 py-1.5 text-xs text-[#647067] hover:bg-[#F6F7F5]"
                >
                  <Copy size={13} /> Sao chép
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedId(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#929A93]">{selectedItem.contentId}</p>
                <h2 className="mt-1 text-lg font-semibold text-[#26372E]">{selectedItem.product}</h2>
                <p className="mt-1 text-xs text-[#929A93]">{selectedItem.contentType} · {selectedItem.platform}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="rounded-lg px-3 py-1.5 text-sm text-[#647067] hover:bg-gray-100">Đóng</button>
            </div>
            <div className="mt-4 whitespace-pre-wrap rounded-xl bg-[#F7F8F6] p-4 text-sm leading-7 text-[#46534A]">
              {selectedItem.content}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => copyContent(selectedItem.content)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#26372E] px-4 py-2 text-sm font-medium text-white"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Đã sao chép' : 'Sao chép nội dung'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
