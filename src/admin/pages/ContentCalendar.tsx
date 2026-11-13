
import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Facebook,
  Video,
  X,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  Filter,
} from 'lucide-react';

type PostStatus = 'Draft' | 'Approved' | 'Scheduled' | 'Published';

type CalendarPost = {
  id: string;
  title: string;
  product: string;
  platform: 'Facebook' | 'TikTok';
  date: string;
  time: string;
  status: PostStatus;
};

const initialPosts: CalendarPost[] = [];
const CALENDAR_API_URL = '/api/calendar';

const statusStyles: Record<PostStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Approved: 'bg-blue-100 text-blue-700',
  Scheduled: 'bg-amber-100 text-amber-700',
  Published: 'bg-green-100 text-green-700',
};

const ContentCalendar: React.FC = () => {
  const [posts, setPosts] = useState<CalendarPost[]>(initialPosts);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [apiError, setApiError] = useState('');

  const [form, setForm] = useState({
    title: '',
    product: '',
    platform: 'Facebook' as 'Facebook' | 'TikTok',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    status: 'Draft' as PostStatus,
  });
useEffect(() => {
  const loadCalendar = async () => {
    try {
      setIsLoading(true);
      setApiError('');

     const response = await fetch(CALENDAR_API_URL, {
  method: 'GET',
});

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : result
            ? [result]
            : [];

      const loadedPosts: CalendarPost[] = rows.map((row: any) => ({
        id: String(row.postId || row.id),
        title: row.title || '',
        product: row.product || '',
        platform: row.platform === 'TikTok' ? 'TikTok' : 'Facebook',
        date: row.date || '',
        time: row.time || '09:00',
        status: ['Draft', 'Approved', 'Scheduled', 'Published'].includes(row.status)
          ? row.status
          : 'Draft',
      }));

      setPosts(loadedPosts);
    } catch (error) {
      console.error('Calendar loading error:', error);
      setApiError('Không thể tải lịch đăng. Kiểm tra kết nối n8n.');
    } finally {
      setIsLoading(false);
    }
  };

  loadCalendar();
}, []);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = currentDate.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const platformMatch =
        filterPlatform === 'All' || post.platform === filterPlatform;
      const statusMatch =
        filterStatus === 'All' || post.status === filterStatus;
      return platformMatch && statusMatch;
    });
  }, [posts, filterPlatform, filterStatus]);

  const getPostsForDay = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredPosts.filter((post) => post.date === dateKey);
  };

  const changeMonth = (amount: number) => {
    setCurrentDate(new Date(year, month + amount, 1));
  };

  
const handleSavePost = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.title.trim() || !form.date || !form.time || isSaving) return;

  const postId = editingPostId || `POST-${Date.now()}`;

  const postToSave: CalendarPost = {
    ...form,
    id: postId,
  };

  const isEditing = Boolean(editingPostId);

  try {
    setIsSaving(true);
    setApiError('');

    const response = await fetch(CALENDAR_API_URL, {
  method: isEditing ? 'PUT' : 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    postId: postToSave.id,
    title: postToSave.title,
    product: postToSave.product,
    platform: postToSave.platform,
    date: postToSave.date,
    time: postToSave.time,
    status: postToSave.status,
  }),
});

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error('Không lưu được lịch đăng.');
    }

    if (isEditing) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? postToSave : post
        )
      );
    } else {
      setPosts((prev) => [...prev, postToSave]);
    }

    setShowModal(false);
    setEditingPostId(null);

    setForm({
      title: '',
      product: '',
      platform: 'Facebook',
      date: new Date().toISOString().slice(0, 10),
      time: '09:00',
      status: 'Draft',
    });

  } catch (error) {
    console.error('Calendar save error:', error);
    setApiError(
      isEditing
        ? 'Cập nhật lịch thất bại. Kiểm tra kết nối n8n và thử lại.'
        : 'Lưu lịch thất bại. Kiểm tra kết nối n8n và thử lại.'
    );
  } finally {
    setIsSaving(false);
  }
};

const handleEditPost = (post: CalendarPost) => {
  setEditingPostId(post.id);

  setForm({
    title: post.title,
    product: post.product,
    platform: post.platform,
    date: post.date,
    time: post.time,
    status: post.status,
  });

  setShowModal(true);
};

  const deletePost = async (id: string) => {
  if (!window.confirm('M muốn xóa lịch đăng này?')) return;

  try {
    setApiError('');

   const response = await fetch(CALENDAR_API_URL, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ postId: id }),
});
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error('Không thể xóa lịch đăng.');
    }

    setPosts((prev) => prev.filter((post) => post.id !== id));

  } catch (error) {
    console.error('Calendar delete error:', error);
    setApiError('Xóa lịch thất bại. Kiểm tra kết nối n8n và thử lại.');
  }
};

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const upcomingPosts = [...filteredPosts]
    .filter((post) => post.date >= todayKey)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 6);

  const stats = {
    total: posts.length,
    scheduled: posts.filter((p) => p.status === 'Scheduled').length,
    approved: posts.filter((p) => p.status === 'Approved').length,
    published: posts.filter((p) => p.status === 'Published').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays size={16} />
            WORKSPACE / CONTENT CALENDAR
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Content Calendar
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý lịch đăng và theo dõi trạng thái nội dung Marketing GIAO THỜI.
          </p>
          {isLoading && (
  <p className="mt-2 text-xs text-gray-500">
    Đang tải dữ liệu lịch đăng...
  </p>
)}

{apiError && (
  <p className="mt-2 text-xs text-red-600">
    {apiError}
  </p>
)}

{!isLoading && !apiError && (
  <p className="mt-2 text-xs text-green-600">
    Đã đồng bộ dữ liệu lịch đăng.
  </p>
)}
        </div>

        <button
          onClick={() => {
  setEditingPostId(null);
  setForm({
    title: '',
    product: '',
    platform: 'Facebook',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    status: 'Draft',
  });
  setShowModal(true);
}}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
        >
          <Plus size={17} />
          Tạo lịch đăng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Tổng nội dung', value: stats.total, icon: CalendarDays },
          { label: 'Đã lên lịch', value: stats.scheduled, icon: Clock },
          { label: 'Đã duyệt', value: stats.approved, icon: CheckCircle2 },
          { label: 'Đã đăng', value: stats.published, icon: Circle },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{item.label}</p>
              <item.icon size={18} className="text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold capitalize text-gray-900">
              {monthLabel}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Hôm nay
            </button>
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
              aria-label="Tháng trước"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
              aria-label="Tháng sau"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter size={15} />
              <span className="text-xs">Bộ lọc</span>
            </div>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="All">Tất cả nền tảng</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100 pb-2">
          {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarCells.map((day, index) => {
            const dayPosts = day ? getPostsForDay(day) : [];
            const dateKey = day
              ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : '';
            const isToday = dateKey === todayKey;

            return (
              <div
                key={index}
                className="min-h-[105px] border-b border-r border-gray-100 p-1.5 md:min-h-[125px] md:p-2"
              >
                {day && (
                  <>
                    <div className="mb-1 flex justify-center">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                        isToday ? 'bg-gray-900 text-white' : 'text-gray-700'
                      }`}>
                        {day}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {dayPosts.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          title={`${post.title} – ${post.time}`}
                          className={`truncate rounded-md px-1.5 py-1 text-[10px] font-medium md:text-xs ${
                            statusStyles[post.status]
                          }`}
                        >
                          {post.time} · {post.title}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <p className="text-center text-[10px] text-gray-400">
                          +{dayPosts.length - 3} nội dung khác
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          {Object.entries(statusStyles).map(([status, style]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${style.split(' ')[0]}`} />
              {status}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming posts */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Lịch đăng sắp tới</h2>
            <p className="mt-1 text-xs text-gray-500">
              Các nội dung từ hôm nay trở đi
            </p>
          </div>
          <CalendarDays size={20} className="text-gray-400" />
        </div>

        {upcomingPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
            <CalendarDays size={30} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-600">
              Chưa có lịch đăng nào
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Tạo lịch đăng mới để quản lý nội dung tại đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-gray-100 p-2.5">
                    {post.platform === 'Facebook' ? (
                      <Facebook size={19} className="text-blue-600" />
                    ) : (
                      <Video size={19} className="text-gray-800" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{post.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {post.product || 'Chưa phân loại'} · {post.platform} · {post.date} · {post.time}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[post.status]}`}>
                    {post.status}
                  </span>
                                    <button
                    onClick={() => handleEditPost(post)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                    title="Chỉnh sửa lịch đăng"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Xóa lịch đăng"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create schedule modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
  {editingPostId ? 'Chỉnh sửa lịch đăng' : 'Tạo lịch đăng mới'}
</h2>
                <p className="mt-1 text-xs text-gray-500">Thêm nội dung vào Content Calendar</p>
              </div>
              <button
                disabled={isSaving}
                onClick={() => {
  setShowModal(false);
  setEditingPostId(null);
}}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

         <form onSubmit={handleSavePost} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tên nội dung *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: Bài viết giới thiệu nón lá lụa gấm"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Sản phẩm
                </label>
                <input
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  placeholder="Tên sản phẩm"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nền tảng
                  </label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as 'Facebook' | 'TikTok' })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Ngày đăng *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Giờ đăng *
                  </label>
                  <input
                    required
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

                         <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setShowModal(false);
                    setEditingPostId(null);
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? 'Đang lưu...'
                    : editingPostId
                      ? 'Lưu thay đổi'
                      : 'Tạo lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;
