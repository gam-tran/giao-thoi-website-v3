
import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  RefreshCw,
  FileText,
  Facebook,
  Video,
  Globe,
  Instagram,
  Check,
  AlertCircle,
  WandSparkles,
} from 'lucide-react';

const CONTENT_API_URL = '/api/n8n/giaothoi-content-studio';

type ContentRequest = {
  product: string;
  platform: string;
  contentType: string;
  objective: string;
  tone: string;
  brief: string;
};

const platforms = [
  { value: 'Facebook', label: 'Facebook', icon: Facebook },
  { value: 'TikTok', label: 'TikTok', icon: Video },
  { value: 'Instagram', label: 'Instagram', icon: Instagram },
  { value: 'Website', label: 'Website', icon: Globe },
];

const contentTypes = [
  'Bài đăng mạng xã hội',
  'Kịch bản video ngắn',
  'Caption',
  'Nội dung quảng cáo',
  'Bài giới thiệu sản phẩm',
];

const objectives = [
  'Tăng nhận diện thương hiệu',
  'Giới thiệu sản phẩm',
  'Tăng tương tác',
  'Tăng lượt truy cập website',
  'Thu hút khách hàng tiềm năng',
  'Thúc đẩy đơn hàng',
];

const tones = [
  'Tự nhiên, gần gũi',
  'Thuyết phục, hướng chuyển đổi',
  'Trẻ trung, sáng tạo',
  'Tinh tế, giàu bản sắc văn hóa',
];

export default function ContentStudio() {
  const [form, setForm] = useState<ContentRequest>({
    product: '',
    platform: 'Facebook',
    contentType: 'Bài đăng mạng xã hội',
    objective: 'Giới thiệu sản phẩm',
    tone: 'Tự nhiên, gần gũi',
    brief: '',
  });

  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const updateField = (
    field: keyof ContentRequest,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const generateContent = async () => {
    if (!form.product.trim()) {
      setError('Vui lòng nhập tên sản phẩm trước khi tạo nội dung.');
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const response = await fetch(CONTENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Yêu cầu thất bại: ${response.status}`);
      }

      const result = await response.json();

      const generatedText =
        result.content ||
        result.draft ||
        result.output ||
        result.text;

      if (!generatedText) {
        throw new Error('AI chưa trả về nội dung hợp lệ.');
      }

      setDraft(
        typeof generatedText === 'string'
          ? generatedText
          : JSON.stringify(generatedText, null, 2)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối với AI Agent.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyContent = async () => {
    if (!draft) return;

    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Không thể sao chép nội dung trên trình duyệt này.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <WandSparkles className="h-6 w-6 text-violet-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Content Studio
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Sáng tạo nội dung Marketing cùng AI Agent của Giao Thời.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700">
          <Sparkles className="h-4 w-4" />
          AI Content Assistant
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Input panel */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">
              Thiết lập nội dung
            </h2>
          </div>

          <div className="space-y-5">
            {/* Product */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sản phẩm
              </label>
              <input
                value={form.product}
                onChange={(e) =>
                  updateField('product', e.target.value)
                }
                placeholder="Ví dụ: Nón lá lụa gấm, tranh Đông Hồ..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                AI sẽ sử dụng thông tin sản phẩm từ Product Data Tool khi được kết nối.
              </p>
            </div>

            {/* Platform */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nền tảng đăng tải
              </label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const selected =
                    form.platform === platform.value;

                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() =>
                        updateField('platform', platform.value)
                      }
                      className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${
                        selected
                          ? 'border-violet-500 bg-violet-50 font-medium text-violet-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {platform.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Loại nội dung
              </label>
              <select
                value={form.contentType}
                onChange={(e) =>
                  updateField('contentType', e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
              >
                {contentTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Objective */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mục tiêu nội dung
              </label>
              <select
                value={form.objective}
                onChange={(e) =>
                  updateField('objective', e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
              >
                {objectives.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Giọng điệu thương hiệu
              </label>
              <select
                value={form.tone}
                onChange={(e) =>
                  updateField('tone', e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
              >
                {tones.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Brief */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Yêu cầu bổ sung
              </label>
              <textarea
                value={form.brief}
                onChange={(e) =>
                  updateField('brief', e.target.value)
                }
                rows={4}
                placeholder="Ví dụ: Viết bài Facebook khoảng 150 từ, mở đầu bằng một câu hỏi thu hút, tập trung vào lợi ích trang trí nhà cửa..."
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={generateContent}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Đang tạo nội dung...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Tạo nội dung bằng AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="flex min-h-[600px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">
                Bản nháp nội dung
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Có thể chỉnh sửa trực tiếp trước khi sử dụng.
              </p>
            </div>

            {draft && (
              <button
                type="button"
                onClick={copyContent}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Sao chép
                  </>
                )}
              </button>
            )}
          </div>

          {draft ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[480px] w-full flex-1 resize-y rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-800 outline-none focus:border-violet-400"
              placeholder="Nội dung AI tạo sẽ xuất hiện ở đây..."
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                <WandSparkles className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-800">
                Nội dung của bạn sẽ xuất hiện tại đây
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                Điền thông tin sản phẩm, lựa chọn nền tảng và mục tiêu,
                sau đó yêu cầu AI tạo bản nháp.
              </p>
            </div>
          )}

          {draft && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-400">
                Bản nháp có thể chỉnh sửa
              </span>
              <button
                type="button"
                onClick={() => {
                  setDraft('');
                  setError('');
                }}
                className="text-sm font-medium text-gray-500 hover:text-red-600"
              >
                Xóa bản nháp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
