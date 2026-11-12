
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  ChartNoAxesCombined,
  Lightbulb,
  PenTool,
  CalendarDays,
  Library,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  CircleHelp,
  PanelLeftClose,
  RefreshCw,
  Users,
  Eye,
  MousePointerClick,
  Activity,
} from 'lucide-react';

type AdminPage =
  | 'dashboard'
  | 'assistant'
  | 'analytics'
  | 'insights'
  | 'content'
  | 'campaign'
  | 'library'
  | 'settings';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'OVERVIEW' },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare, group: 'WORKSPACE' },
  { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined, group: 'WORKSPACE' },
  { id: 'insights', label: 'Marketing Insights', icon: Lightbulb, group: 'WORKSPACE' },
  { id: 'content', label: 'Content Studio', icon: PenTool, group: 'WORKSPACE' },
  { id: 'campaign', label: 'Campaign Planner', icon: CalendarDays, group: 'WORKSPACE' },
  { id: 'library', label: 'Brand Library', icon: Library, group: 'MANAGEMENT' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'MANAGEMENT' },
] as const;

const pageDescriptions: Record<AdminPage, string> = {
  dashboard: 'Theo dõi tổng quan hoạt động Marketing của GIAO THỜI.',
  assistant: 'Trợ lý AI hỗ trợ các công việc Marketing hằng ngày.',
  analytics: 'Phân tích dữ liệu website và hành vi người dùng từ GA4.',
  insights: 'Khám phá insight và đề xuất hành động dựa trên dữ liệu.',
  content: 'Lên ý tưởng, sáng tạo và quản lý nội dung Marketing.',
  campaign: 'Xây dựng và quản lý kế hoạch chiến dịch Marketing.',
  library: 'Tra cứu kiến thức thương hiệu và dữ liệu sản phẩm.',
  settings: 'Quản lý kết nối dữ liệu và cấu hình hệ thống.',
};

// API tạm thời chạy trên máy tính cá nhân.
const DASHBOARD_API_URL =
  'http://localhost:5678/webhook/giaothoi-dashboard';

type DashboardMetrics = {
  sessions: number;
  activeUsers: number;
  newUsers: number;
  screenPageViews: number;
  engagedSessions: number;
  eventCount: number;
};

type GA4Response = {
  metricHeaders?: { name: string }[];
  rows?: { metricValues: { value: string }[] }[];
};

const emptyMetrics: DashboardMetrics = {
  sessions: 0,
  activeUsers: 0,
  newUsers: 0,
  screenPageViews: 0,
  engagedSessions: 0,
  eventCount: 0,
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value);

const AdminApp: React.FC = () => {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(DASHBOARD_API_URL, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`API trả về lỗi HTTP ${response.status}`);
      }

      const data: GA4Response = await response.json();

      if (!data.metricHeaders) {
        throw new Error('Dữ liệu GA4 không có metricHeaders.');
      }

      const values = data.rows?.[0]?.metricValues ?? [];
      const result = { ...emptyMetrics };

      data.metricHeaders.forEach((header, index) => {
        const key = header.name as keyof DashboardMetrics;
        if (key in result) {
          result[key] = Number(values[index]?.value ?? 0);
        }
      });

      setMetrics(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối đến Dashboard API.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currentPage = navigation.find((item) => item.id === activePage);
  const PageIcon = currentPage?.icon ?? LayoutDashboard;

  const engagementRate =
    metrics && metrics.sessions > 0
      ? (metrics.engagedSessions / metrics.sessions) * 100
      : 0;

  const kpiCards = [
    {
      label: 'Sessions',
      note: 'Tổng số phiên truy cập',
      value: metrics ? formatNumber(metrics.sessions) : '—',
      icon: Activity,
    },
    {
      label: 'Active Users',
      note: 'Người dùng hoạt động',
      value: metrics ? formatNumber(metrics.activeUsers) : '—',
      icon: Users,
    },
    {
      label: 'New Users',
      note: 'Người dùng mới',
      value: metrics ? formatNumber(metrics.newUsers) : '—',
      icon: MousePointerClick,
    },
    {
      label: 'Engagement Rate',
      note: 'Tỷ lệ phiên tương tác',
      value: metrics ? `${engagementRate.toFixed(1)}%` : '—',
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F5] text-[#202923] flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-[250px]' : 'w-[76px]'
        } shrink-0 bg-[#1F3029] text-white flex flex-col transition-all duration-300`}
      >
        <div className="h-[76px] px-5 flex items-center border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-[#D5B98C] text-[#1F3029] flex items-center justify-center font-bold text-lg">
            G
          </div>

          {sidebarOpen && (
            <div className="ml-3">
              <div className="font-semibold tracking-[0.12em] text-sm">GIAO THỜI</div>
              <div className="text-[10px] text-white/50 tracking-[0.16em] mt-1">
                MARKETING AI
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {['OVERVIEW', 'WORKSPACE', 'MANAGEMENT'].map((group) => {
            const items = navigation.filter((item) => item.group === group);

            return (
              <div key={group} className="mb-7">
                {sidebarOpen && (
                  <div className="px-3 mb-3 text-[10px] font-semibold tracking-[0.16em] text-white/40">
                    {group}
                  </div>
                )}

                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActivePage(item.id as AdminPage)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                          isActive
                            ? 'bg-[#D5B98C] text-[#1F3029] font-semibold'
                            : 'text-white/65 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {sidebarOpen && (
                          <span className="text-[13px]">{item.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/60 hover:bg-white/10"
          >
            <PanelLeftClose size={18} />
            {sidebarOpen && <span className="text-xs">Thu gọn thanh bên</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-[76px] bg-white border-b border-[#E8EBE7] px-5 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[#F2F4F1] text-[#647067]"
              aria-label="Toggle sidebar"
            >
              <Menu size={19} />
            </button>

            <div className="min-w-0">
              <h1 className="font-semibold text-[15px] md:text-base truncate">
                {currentPage?.label}
              </h1>
              <p className="text-[11px] text-[#929A93] mt-1 hidden sm:block">
                {pageDescriptions[activePage]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-[#F6F7F5] px-3 py-2 rounded-lg w-[190px]">
              <Search size={15} className="text-[#929A93]" />
              <span className="text-xs text-[#929A93]">Tìm kiếm...</span>
            </div>

            <button
              className="relative p-2 rounded-lg hover:bg-[#F2F4F1] text-[#647067]"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>

            <div className="h-8 w-px bg-[#E8EBE7] hidden sm:block" />

            <button className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E9E1D3] text-[#69563B] flex items-center justify-center text-xs font-semibold">
                GT
              </div>
              <span className="hidden md:block text-xs font-medium">Admin</span>
              <ChevronDown size={14} className="text-[#929A93] hidden md:block" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-[1600px] w-full mx-auto">
          {activePage === 'dashboard' ? (
            <div className="space-y-7">
              {/* Welcome */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-[#89938A] mb-2">
                    OVERVIEW / DASHBOARD
                  </div>
                  <h2 className="text-2xl md:text-[28px] font-semibold tracking-tight">
                    Marketing Overview
                  </h2>
                  <p className="text-sm text-[#818B82] mt-2">
                    Tổng quan hoạt động Marketing của GIAO THỜI.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-[#89938A]">
                    7 ngày gần nhất, đến hết hôm qua
                  </span>
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white border border-[#E8EBE7] rounded-lg px-3 py-2 text-xs text-[#68736A] hover:bg-[#F6F7F5] disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              {error ? (
                <div className="bg-[#FFF1F0] border border-[#F2D0CC] rounded-xl p-4 flex gap-3">
                  <CircleHelp size={19} className="text-[#B64B40] shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#963C33]">
                      Không thể kết nối Dashboard API
                    </div>
                    <p className="text-xs text-[#A65D55] mt-1 break-words">
                      {error}
                    </p>
                    <p className="text-xs text-[#A65D55] mt-2">
                      Kiểm tra n8n đang chạy và workflow đã được Publish.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#EDF6EF] border border-[#D8E9DB] rounded-xl p-4 flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#DDEEE0] flex items-center justify-center shrink-0">
                    <Activity size={18} className="text-[#477653]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#376344]">
                      {loading
                        ? 'Đang kết nối GA4...'
                        : metrics
                          ? 'Đã kết nối GA4 Data API'
                          : 'Đang chờ dữ liệu GA4'}
                    </div>
                    <p className="text-xs text-[#64816A] mt-1 leading-relaxed">
                      {loading
                        ? 'Đang tải các chỉ số từ n8n.'
                        : metrics
                          ? 'Các chỉ số bên dưới được lấy trực tiếp từ Google Analytics 4.'
                          : 'Dashboard sẽ hiển thị số liệu sau khi kết nối thành công.'}
                    </p>
                  </div>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpiCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="bg-white border border-[#E8EBE7] rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#89938A]">{item.label}</div>
                        <Icon size={17} className="text-[#9A8769]" />
                      </div>
                      <div className="text-2xl font-semibold text-[#29372F] mt-4">
                        {loading && !metrics ? '...' : item.value}
                      </div>
                      <div className="text-[11px] text-[#A0A8A1] mt-2">
                        {item.note}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E8EBE7] rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <Eye size={17} className="text-[#9A8769]" />
                    <h3 className="text-sm font-semibold">Page Views</h3>
                  </div>
                  <div className="text-2xl font-semibold mt-4">
                    {metrics ? formatNumber(metrics.screenPageViews) : '—'}
                  </div>
                  <p className="text-xs text-[#929A93] mt-2">
                    Tổng lượt xem trang trong kỳ báo cáo
                  </p>
                </div>

                <div className="bg-white border border-[#E8EBE7] rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <MousePointerClick size={17} className="text-[#9A8769]" />
                    <h3 className="text-sm font-semibold">Event Count</h3>
                  </div>
                  <div className="text-2xl font-semibold mt-4">
                    {metrics ? formatNumber(metrics.eventCount) : '—'}
                  </div>
                  <p className="text-xs text-[#929A93] mt-2">
                    Tổng số sự kiện được ghi nhận
                  </p>
                </div>
              </div>

              {/* Data Scope */}
              <div className="bg-white border border-[#E8EBE7] rounded-xl p-5">
                <h3 className="text-sm font-semibold">Phạm vi dữ liệu hiện tại</h3>
                <p className="text-xs text-[#929A93] mt-2 leading-relaxed">
                  Dashboard đang nhận dữ liệu tổng hợp từ GA4 trong 7 ngày gần nhất,
                  kết thúc vào ngày hôm qua. Phiên bản API hiện tại chưa trả về dữ liệu
                  phân chia theo ngày hoặc kênh truy cập, nên biểu đồ xu hướng và
                  phân bổ kênh sẽ được bổ sung ở bước tiếp theo.
                </p>
              </div>

              {/* AI Insight */}
              <div className="bg-[#1F3029] text-white rounded-xl p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={17} className="text-[#D5B98C]" />
                  <span className="text-sm font-semibold">AI Marketing Insights</span>
                </div>
                <p className="text-xs text-white/55 leading-relaxed">
                  Khu vực này sẽ tổng hợp nhận định và đề xuất từ AI Agent sau khi
                  kết nối chức năng phân tích. Hiện tại Dashboard chỉ hiển thị
                  dữ liệu GA4, chưa tự động tạo insight.
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E9EEE9] flex items-center justify-center mb-5">
                <PageIcon size={25} className="text-[#425B4B]" />
              </div>
              <h2 className="text-xl font-semibold">{currentPage?.label}</h2>
              <p className="text-sm text-[#89938A] mt-2 max-w-md leading-relaxed">
                {pageDescriptions[activePage]}
              </p>
              <span className="mt-5 text-[11px] text-[#A0A8A1] bg-white border border-[#E8EBE7] rounded-full px-4 py-2">
                Chức năng đang trong giai đoạn triển khai
              </span>
            </div>
          )}
        </main>

        <footer className="px-5 md:px-8 py-4 border-t border-[#E8EBE7] bg-white">
          <div className="flex flex-col sm:flex-row justify-between gap-2 text-[11px] text-[#9AA29B]">
            <span>GIAO THỜI Marketing AI</span>
            <span>Internal Marketing Management System</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminApp;
