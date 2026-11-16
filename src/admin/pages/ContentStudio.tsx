
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
  Upload,
  X,
  Image as ImageIcon,
  Film,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CONTENT_API_URL = '/api/n8n/giaothoi-content-studio';
const SAVE_API_URL = '/api/n8n/giaothoi-content-library-save';

type SelectedMedia = { file: File; previewUrl: string };
type StoredMedia = { name: string; type: 'image' | 'video'; mimeType: string; size: number; path: string; order: number };

const MAX_MEDIA_FILES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedContentId, setSavedContentId] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);

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
    setSaved(false);

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

  const addMedia = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const accepted: SelectedMedia[] = [];
    for (const file of incoming) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        setError(`Không hỗ trợ định dạng: ${file.name}`);
        continue;
      }
      const limit = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
      if (file.size > limit) {
        setError(`${file.name} vượt quá giới hạn ${isImage ? '10 MB' : '100 MB'}.`);
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    setSelectedMedia(previous => {
      const remaining = MAX_MEDIA_FILES - previous.length;
      if (accepted.length > remaining) {
        accepted.slice(remaining).forEach(item => URL.revokeObjectURL(item.previewUrl));
        setError(`Mỗi bài tối đa ${MAX_MEDIA_FILES} file.`);
      }
      return [...previous, ...accepted.slice(0, remaining)];
    });
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(previous => {
      const target = previous[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });
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

const saveToLibrary = async (status: 'Draft' | 'Pending Approval') => {
  if (!draft.trim()) return;

  setSaving(true);
  setError('');
  setSaved(false);
  setSavedContentId('');

  try {
    if (!supabase) throw new Error('Chưa cấu hình kết nối Supabase.');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.');
    }

    const contentId = `GT-${Date.now()}`;
    const mediaMetadata: StoredMedia[] = [];

    for (let index = 0; index < selectedMedia.length; index += 1) {
      const item = selectedMedia[index];
      const safeName = item.file.name.normalize('NFKD').replace(/[^\\w.-]+/g, '-').replace(/-+/g, '-');
      const path = `${contentId}/${Date.now()}-${index}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('content-media')
        .upload(path, item.file, { contentType: item.file.type, upsert: false });
      if (uploadError) {
        throw new Error(`Không tải được ${item.file.name}: ${uploadError.message}`);
      }
      mediaMetadata.push({
        name: item.file.name,
        type: item.file.type.startsWith('video/') ? 'video' : 'image',
        mimeType: item.file.type,
        size: item.file.size,
        path,
        order: index,
      });
    }

    const response = await fetch(SAVE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId,
        product: form.product,
        platform: form.platform,
        contentType: form.contentType,
        objective: form.objective,
        content: draft,
        status,
        media: JSON.stringify(mediaMetadata),
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || 'Không thể lưu bài viết vào thư viện.'
      );
    }

    setSavedContentId(result.contentId || contentId);
    setSaved(true);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Có lỗi khi lưu bài viết.'
    );
  } finally {
    setSaving(false);
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
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Hình ảnh & video đính kèm</h3>
                  <p className="mt-1 text-xs text-gray-500">Tối đa {MAX_MEDIA_FILES} file · Ảnh 10 MB/file · Video 100 MB/file</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="h-4 w-4" /> Thêm ảnh/video
                  <input type="file" accept="image/*,video/*" multiple className="hidden" disabled={saving || selectedMedia.length >= MAX_MEDIA_FILES} onChange={event => { addMedia(event.target.files); event.currentTarget.value = ''; }} />
                </label>
              </div>
              {selectedMedia.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selectedMedia.map((item, index) => (
                    <div key={`${item.file.name}-${index}`} className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {item.file.type.startsWith('image/') ? (
                        <img src={item.previewUrl} alt={item.file.name} className="h-36 w-full object-cover" />
                      ) : (
                        <video src={item.previewUrl} controls className="h-36 w-full bg-black object-contain" />
                      )}
                      <div className="flex items-center gap-1.5 p-2 text-xs text-gray-600">
                        {item.file.type.startsWith('image/') ? <ImageIcon className="h-3.5 w-3.5 shrink-0" /> : <Film className="h-3.5 w-3.5 shrink-0" />}
                        <span className="min-w-0 flex-1 truncate" title={item.file.name}>{item.file.name}</span>
                        <button type="button" onClick={() => removeMedia(index)} disabled={saving} aria-label={`Xóa ${item.file.name}`} className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center text-xs text-gray-500">Chưa có file đính kèm. Mày có thể thêm nhiều ảnh hoặc video vào bài viết.</div>
              )}
            </div>
          )}

          {draft && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-400">
                Bản nháp có thể chỉnh sửa
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {saved && (
                  <span className="text-sm font-medium text-green-700">
                    Đã lưu ({savedContentId})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => saveToLibrary('Draft')}
                  disabled={saving || saved}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : 'Lưu bản nháp'}
                </button>
                <button
                  type="button"
                  onClick={() => saveToLibrary('Pending Approval')}
                  disabled={saving || saved}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Đang gửi...' : 'Gửi duyệt'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft('');
                    setError('');
                    setSaved(false);
                    selectedMedia.forEach(item => URL.revokeObjectURL(item.previewUrl));
                    setSelectedMedia([]);
                  }}
                  className="text-sm font-medium text-gray-500 hover:text-red-600"
                >
                  Xóa bản nháp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
