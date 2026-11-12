import { useState } from 'react';

const API_URL = 'http://localhost:5678/webhook/giaothoi-marketing-insights';

type InsightsResponse = {
  success: boolean;
  dataPeriod?: string;
  generatedAt?: string;
  analysis?: string;
  source?: string;
  message?: string;
};

export default function MarketingInsights() {
  const [period, setPeriod] = useState('28');
  const [result, setResult] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInsights = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period }),
      });

      if (!response.ok) {
        throw new Error(`API trả về lỗi HTTP ${response.status}`);
      }

      const data: InsightsResponse = await response.json();

      if (!data.success || !data.analysis) {
        throw new Error(data.message || 'Không nhận được báo cáo phân tích.');
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối Marketing Insights API.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Marketing Insights
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          AI phân tích dữ liệu Google Analytics 4 và đề xuất hành động
          marketing cho GIAO THỜI.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Khoảng thời gian phân tích
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 sm:w-56"
            >
              <option value="7">7 ngày gần nhất</option>
              <option value="28">28 ngày gần nhất</option>
              <option value="90">90 ngày gần nhất</option>
            </select>
          </div>

          <button
            onClick={generateInsights}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'AI đang phân tích...' : 'Tạo phân tích AI'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="font-medium text-blue-900">
            Gemini đang phân tích dữ liệu marketing
          </p>
          <p className="mt-1 text-sm text-blue-700">
            Quá trình có thể mất một chút thời gian.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-800">
            Không thể tạo báo cáo
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <p className="mt-2 text-xs text-red-600">
            Kiểm tra n8n đang chạy, workflow đã Publish và API URL chính xác.
          </p>
        </div>
      )}

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Kỳ phân tích</p>
              <p className="mt-1 font-semibold text-gray-900">
                {result.dataPeriod || `${period} ngày gần nhất`}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Nguồn phân tích</p>
              <p className="mt-1 font-semibold text-gray-900">
                {result.source || 'Google Analytics 4 + Gemini'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Báo cáo Marketing Insights
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Phân tích và đề xuất được tạo bởi AI dựa trên dữ liệu GA4.
                </p>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(result.analysis || '')
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Sao chép báo cáo
              </button>
            </div>

            <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
              {result.analysis}
            </div>
          </div>

          {result.generatedAt && (
            <p className="text-right text-xs text-gray-400">
              Tạo lúc: {new Date(result.generatedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </>
      )}

      {!loading && !error && !result && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <h2 className="font-semibold text-gray-800">
            Chưa có báo cáo phân tích
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
            Chọn khoảng thời gian và nhấn “Tạo phân tích AI” để hệ thống
            đọc dữ liệu GA4, xác định insight và đề xuất hành động marketing.
          </p>
        </div>
      )}
    </div>
  );
}
