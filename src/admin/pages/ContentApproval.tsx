
import React, { useEffect, useState } from 'react';

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

const LIBRARY_API =
  'http://localhost:5678/webhook/giaothoi-content-library';

const APPROVAL_API =
  'http://localhost:5678/webhook/giaothoi-content-approval';

const ContentApproval: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadContents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(LIBRARY_API);

      if (!response.ok) {
        throw new Error('Không thể tải Content Library');
      }

      const data = await response.json();

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : data.data?.data || [];

      setContents(rows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi tải nội dung'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const updateStatus = async (
    contentId: string,
    status: 'Approved' | 'Rejected'
  ) => {
    try {
      setUpdating(contentId);
      setError('');

      const response = await fetch(APPROVAL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái');
      }

      await loadContents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Có lỗi khi duyệt nội dung'
      );
    } finally {
      setUpdating(null);
    }
  };

  const filteredContents =
    filter === 'All'
      ? contents
      : contents.filter(
          item => item.status === filter
        );

  const pendingCount = contents.filter(
    item => item.status === 'Draft'
  ).length;

  const approvedCount = contents.filter(
    item => item.status === 'Approved'
  ).length;

  const rejectedCount = contents.filter(
    item => item.status === 'Rejected'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#26372E]">
            Content Approval
          </h1>
          <p className="mt-1 text-sm text-[#929A93]">
            Quản lý và phê duyệt nội dung được tạo bởi AI.
          </p>
        </div>

        <button
          onClick={loadContents}
          className="rounded-lg border border-[#DDE4DC] px-4 py-2 text-sm font-medium text-[#26372E] hover:bg-[#F5F7F4]"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5EAE4] bg-white p-5">
          <p className="text-sm text-[#929A93]">Pending review</p>
          <p className="mt-2 text-2xl font-semibold text-[#26372E]">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5EAE4] bg-white p-5">
          <p className="text-sm text-[#929A93]">Approved</p>
          <p className="mt-2 text-2xl font-semibold text-green-700">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5EAE4] bg-white p-5">
          <p className="text-sm text-[#929A93]">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {rejectedCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'Draft', 'Approved', 'Rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === status
                ? 'bg-[#26372E] text-white'
                : 'border border-[#E5EAE4] bg-white text-[#657168]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#E5EAE4] bg-white p-8 text-center text-sm text-[#929A93]">
          Đang tải nội dung...
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="rounded-xl border border-[#E5EAE4] bg-white p-10 text-center">
          <h3 className="font-medium text-[#26372E]">
            Chưa có nội dung
          </h3>
          <p className="mt-2 text-sm text-[#929A93]">
            Nội dung được lưu từ Content Studio sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContents.map(item => (
            <div
              key={item.contentId}
              className="rounded-xl border border-[#E5EAE4] bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#26372E]">
                    {item.product || 'Chưa xác định sản phẩm'}
                  </h3>
                  <p className="mt-1 text-xs text-[#929A93]">
                    {item.contentId} · {item.platform} · {item.contentType}
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  item.status === 'Approved'
                    ? 'bg-green-50 text-green-700'
                    : item.status === 'Rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-[#F7F8F6] p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-[#929A93]">
                  Content
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#46534A]">
                  {item.content}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#929A93]">
                  Objective: {item.objective || 'Not specified'}
                </p>

                {item.status !== 'Approved' &&
                  item.status !== 'Rejected' && (
                    <div className="flex gap-2">
                      <button
                        disabled={updating === item.contentId}
                        onClick={() =>
                          updateStatus(item.contentId, 'Rejected')
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        disabled={updating === item.contentId}
                        onClick={() =>
                          updateStatus(item.contentId, 'Approved')
                        }
                        className="rounded-lg bg-[#26372E] px-4 py-2 text-sm font-medium text-white hover:bg-[#3A5142] disabled:opacity-50"
                      >
                        {updating === item.contentId
                          ? 'Updating...'
                          : 'Approve'}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentApproval;
