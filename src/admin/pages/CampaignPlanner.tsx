
import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  CalendarDays,
  Wallet,
  Share2,
  Lightbulb,
  FileText,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  WandSparkles,
  Facebook,
  Instagram,
  Video,
  Globe,
} from 'lucide-react';

const CAMPAIGN_API_URL =
  'http://localhost:5678/webhook/giaothoi-campaign-planner';

type CampaignRequest = {
  campaignName: string;
  product: string;
  objective: string;
  targetAudience: string;
  duration: string;
  budget: string;
  channels: string[];
  brief: string;
};

const channelOptions = [
  { value: 'Facebook', icon: Facebook },
  { value: 'TikTok', icon: Video },
  { value: 'Instagram', icon: Instagram },
  { value: 'Website', icon: Globe },
];

const objectives = [
  'Tăng nhận diện thương hiệu',
  'Giới thiệu sản phẩm mới',
  'Tăng tương tác với khách hàng',
  'Tăng lượt truy cập website',
  'Thu hút khách hàng tiềm năng',
  'Thúc đẩy đơn hàng',
];

export default function CampaignPlanner() {
  const [form, setForm] = useState<CampaignRequest>({
    campaignName: '',
    product: '',
    objective: 'Tăng nhận diện thương hiệu',
    targetAudience: '',
    duration: '30 ngày',
    budget: '',
    channels: ['Facebook', 'TikTok'],
    brief: '',
  });

  const [campaignPlan, setCampaignPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const updateField = (
    field: keyof CampaignRequest,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleChannel = (channel: string) => {
    setForm((previous) => ({
      ...previous,
      channels: previous.channels.includes(channel)
        ? previous.channels.filter((item) => item !== channel)
        : [...previous.channels, channel],
    }));
  };

  const generatePlan = async () => {
    if (!form.campaignName.trim()) {
      setError('Vui lòng nhập tên chiến dịch.');
      return;
    }

    if (!form.product.trim()) {
      setError('Vui lòng nhập sản phẩm muốn quảng bá.');
      return;
    }

    if (!form.targetAudience.trim()) {
      setError('Vui lòng mô tả khách hàng mục tiêu.');
      return;
    }

    if (form.channels.length === 0) {
      setError('Vui lòng chọn ít nhất một kênh Marketing.');
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const response = await fetch(CAMPAIGN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Yêu cầu thất bại: HTTP ${response.status}`);
      }

      const result = await response.json();

      const generatedPlan =
        result.content ||
        result.plan ||
        result.output ||
        result.text;

      if (!generatedPlan) {
        throw new Error('AI chưa trả về kế hoạch hợp lệ.');
      }

      setCampaignPlan(
        typeof generatedPlan === 'string'
          ? generatedPlan
          : JSON.stringify(generatedPlan, null, 2)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối Campaign Planner API.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyPlan = async () => {
    if (!campaignPlan) return;

    try {
      await navigator.clipboard.writeText(campaignPlan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Không thể sao chép kế hoạch.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              Campaign Planner
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Xây dựng chiến lược và kế hoạch chiến dịch Marketing cùng AI.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <Sparkles className="h-4 w-4" />
          AI Campaign Assistant
        </div>
      </div>

      {/* Introduction */}
      <div className="rounded-xl bg-[#1F3029] p-5 text-white md:p-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#D5B98C]" />
          <h2 className="font-semibold">Lập kế hoạch chiến dịch thông minh</h2>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Cung cấp thông tin về sản phẩm, mục tiêu và khách hàng.
          AI sẽ hỗ trợ xây dựng Big Idea, chiến lược kênh,
          phân bổ ngân sách, lịch triển khai và KPI đề xuất.
        </p>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Input */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">
              Thông tin chiến dịch
            </h2>
          </div>

          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tên chiến dịch *
              </label>
              <input
                value={form.campaignName}
                onChange={(e) => updateField('campaignName', e.target.value)}
                placeholder="Ví dụ: Quà Việt cho không gian sống hiện đại"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sản phẩm muốn quảng bá *
              </label>
              <input
                value={form.product}
                onChange={(e) => updateField('product', e.target.value)}
                placeholder="Ví dụ: Nón lá lụa, đèn trúc chỉ..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mục tiêu chiến dịch *
              </label>
              <select
                value={form.objective}
                onChange={(e) => updateField('objective', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                {objectives.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Khách hàng mục tiêu *
              </label>
              <textarea
                value={form.targetAudience}
                onChange={(e) => updateField('targetAudience', e.target.value)}
                rows={3}
                placeholder="Ví dụ: Người trên 25 tuổi, nhân viên văn phòng, quan tâm đến đồ trang trí và sản phẩm mang bản sắc Việt..."
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarDays className="h-4 w-4" />
                  Thời gian
                </label>
                <select
                  value={form.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option>7 ngày</option>
                  <option>14 ngày</option>
                  <option>30 ngày</option>
                  <option>60 ngày</option>
                  <option>90 ngày</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Wallet className="h-4 w-4" />
                  Ngân sách (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                  placeholder="Ví dụ: 5000000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Share2 className="h-4 w-4" />
                Kênh Marketing *
              </label>

              <div className="grid grid-cols-2 gap-2">
                {channelOptions.map((channel) => {
                  const Icon = channel.icon;
                  const selected = form.channels.includes(channel.value);

                  return (
                    <button
                      key={channel.value}
                      type="button"
                      onClick={() => toggleChannel(channel.value)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {channel.value}
                      {selected && <Check className="ml-auto h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Yêu cầu bổ sung
              </label>
              <textarea
                value={form.brief}
                onChange={(e) => updateField('brief', e.target.value)}
                rows={4}
                placeholder="Ví dụ: Ưu tiên nội dung gần gũi, ngân sách tiết kiệm, tập trung vào lợi ích sử dụng sản phẩm làm quà tặng..."
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
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
              onClick={generatePlan}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1F3029] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#30483B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Đang lập kế hoạch...
                </>
              ) : (
                <>
                  <WandSparkles className="h-4 w-4" />
                  Tạo kế hoạch bằng AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="flex min-h-[650px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">
                Kế hoạch chiến dịch
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Kết quả do AI đề xuất, có thể chỉnh sửa trước khi sử dụng.
              </p>
            </div>

            {campaignPlan && (
              <button
                type="button"
                onClick={copyPlan}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
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

          {campaignPlan ? (
            <textarea
              value={campaignPlan}
              onChange={(e) => setCampaignPlan(e.target.value)}
              className="min-h-[540px] w-full flex-1 resize-y rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-800 outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                <Target className="h-7 w-7 text-emerald-700" />
              </div>
              <h3 className="font-semibold text-gray-800">
                Kế hoạch của bạn sẽ xuất hiện tại đây
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                Hoàn thành thông tin chiến dịch và nhấn tạo kế hoạch bằng AI.
              </p>
            </div>
          )}

          {campaignPlan && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-400">
                Có thể chỉnh sửa nội dung kế hoạch
              </span>
              <button
                type="button"
                onClick={() => {
                  setCampaignPlan('');
                  setError('');
                }}
                className="text-sm font-medium text-gray-500 hover:text-red-600"
              >
                Xóa kế hoạch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
