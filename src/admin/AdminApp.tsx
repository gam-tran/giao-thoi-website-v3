import ContentStudio from './pages/ContentStudio';
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
  Sparkles,
  CircleHelp,
  PanelLeftClose,
  RefreshCw,
  Users,
  Eye,
  MousePointerClick,
  Activity,
  TrendingUp,
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

type TrafficDay = {
  date: string;
  sessions: number;
  activeUsers: number;
  screenPageViews: number;
};

type AcquisitionChannel = {
  channel: string;
  sessions: number;
  activeUsers: number;
  engagedSessions: number;
};

type DashboardResponse = {
  overview: DashboardMetrics;
  trafficTrend: TrafficDay[];
  acquisition: AcquisitionChannel[];
  dataPeriod?: string;
  source?: string;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value);

const formatDate = (date: string) => {
  if (!/^\d{8}$/.test(date)) return date;
  return `${date.slice(6, 8)}/${date.slice(4, 6)}`;
};

const AdminApp: React.FC = () => {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [data, setData] = useState<DashboardResponse | null>(null);
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

      const result: DashboardResponse = await response.json();

      if (!result.overview || !Array.isArray(result.trafficTrend) ||
          !Array.isArray(result.acquisition)) {
        throw new Error('Cấu trúc dữ liệu Dashboard API không hợp lệ.');
      }

      setData(result);
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

  const metrics = data?.overview;

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

  // Chuẩn bị dữ liệu biểu đồ xu hướng
  const traffic = data?.trafficTrend ?? [];
  const maxSessions = Math.max(
    ...traffic.map((item) => item.sessions),
    1
  );

  const chartWidth = 700;
  const chartHeight = 220;
  const chartPadding = 30;

  const chartPoints = traffic.map((item, index) => {
    const x =
      traffic.length <= 1
        ? chartWidth / 2
        : chartPadding +
          (index / (traffic.length - 1)) *
            (chartWidth - chartPadding * 2);

    const y =
      chartHeight -
      chartPadding -
      (item.sessions / maxSessions) *
        (chartHeight - chartPadding * 2);

    return { x, y, ...item };
  });

  const linePoints = chartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  // Chuẩn bị dữ liệu biểu đồ kênh
  const channels = data?.acquisition ?? [];
  const maxChannelSessions = Math.max(
    ...channels.map((item) => item.sessions),
    1
  );

  const channelTotal = channels.reduce(
    (sum, item) => sum + item.sessions,
    0
  );

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
              <div className="font-semibold tracking-[0.12em] text-sm">
                GIAO THỜI
              </div>
              <div className="text-[10px] text-white/50 tracking-[0.16em] mt-1">
                MARKETING AI
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {['OVERVIEW', 'WORKSPACE', 'MANAGEMENT'].map((group) => {
            const items = navigation.filter(
              (item) => item.group === group
            );

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
                        onClick={() =>
                          setActivePage(item.id as AdminPage)
                        }
                        title={!sidebarOpen ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                          isActive
                            ? 'bg-[#D5B98C] text-[#1F3029] font-semibold'
                            : 'text-white/65 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {sidebarOpen && (
                          <span className="text-[13px]">
                            {item.label}
                          </span>
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
            {sidebarOpen && (
              <span className="text-xs">Thu gọn thanh bên</span>
            )}
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
              <span className="text-xs text-[#929A93]">
                Tìm kiếm...
              </span>
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
              <span className="hidden md:block text-xs font-medium">
                Admin
              </span>
              <ChevronDown
                size={14}
                className="text-[#929A93] hidden md:block"
              />
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
                    <RefreshCw
                      size={14}
                      className={loading ? 'animate-spin' : ''}
                    />
                    {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              {error ? (
                <div className="bg-[#FFF1F0] border border-[#F2D0CC] rounded-xl p-4 flex gap-3">
                  <CircleHelp
                    size={19}
                    className="text-[#B64B40] shrink-0"
                  />
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
                        : data
                          ? 'Đã kết nối GA4 Data API'
                          : 'Đang chờ dữ liệu GA4'}
                    </div>
                    <p className="text-xs text-[#64816A] mt-1 leading-relaxed">
                      {loading
                        ? 'Đang tải các chỉ số từ n8n.'
                        : data
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
                        <div className="text-xs text-[#89938A]">
                          {item.label}
                        </div>
                        <Icon size={17} className="text-[#9A8769]" />
                      </div>
                      <div className="text-2xl font-semibold text-[#29372F] mt-4">
                        {loading && !data ? '...' : item.value}
                      </div>
                      <div className="text-[11px] text-[#A0A8A1] mt-2">
                        {item.note}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Traffic Trend */}
              <div className="bg-white border border-[#E8EBE7] rounded-xl p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={17} className="text-[#9A8769]" />
                      <h3 className="text-sm font-semibold">
                        Traffic Trend
                      </h3>
                    </div>
                    <p className="text-xs text-[#929A93] mt-1">
                      Xu hướng lượt truy cập theo ngày
                    </p>
                  </div>
                  <span className="text-[11px] text-[#929A93]">
                    Sessions / ngày
                  </span>
                </div>

                {traffic.length > 0 ? (
                  <div className="w-full overflow-hidden">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
                      className="w-full h-auto"
                      role="img"
                      aria-label="Biểu đồ lượt truy cập theo ngày"
                    >
                      {[0, 1, 2, 3].map((step) => {
                        const y =
                          chartPadding +
                          (step / 3) *
                            (chartHeight - chartPadding * 2);

                        return (
                          <line
                            key={step}
                            x1={chartPadding}
                            y1={y}
                            x2={chartWidth - chartPadding}
                            y2={y}
                            stroke="#E8EBE7"
                            strokeDasharray="4 5"
                          />
                        );
                      })}

                      <polyline
                        points={linePoints}
                        fill="none"
                        stroke="#718D78"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {chartPoints.map((point) => (
                        <g key={point.date}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            fill="#D5B98C"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                          <text
                            x={point.x}
                            y={chartHeight + 18}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#929A93"
                          >
                            {formatDate(point.date)}
                          </text>
                        </g>
                      ))}
                    </svg>

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className="w-2 h-2 rounded-full bg-[#718D78]" />
                      <span className="text-[11px] text-[#929A93]">
                        Sessions
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-[#929A93]">
                    {loading
                      ? 'Đang tải dữ liệu...'
                      : 'Chưa có dữ liệu xu hướng truy cập.'}
                  </div>
                )}
              </div>

              {/* Acquisition */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                <div className="bg-white border border-[#E8EBE7] rounded-xl p-5 md:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold">
                        Traffic Acquisition
                      </h3>
                      <p className="text-xs text-[#929A93] mt-1">
                        Phân bổ phiên truy cập theo kênh
                      </p>
                    </div>
                    <ChartNoAxesCombined
                      size={18}
                      className="text-[#9A8769]"
                    />
                  </div>

                  {channels.length > 0 ? (
                    <div className="space-y-5">
                      {channels.map((channel) => {
                        const percentage =
                          channelTotal > 0
                            ? (channel.sessions / channelTotal) * 100
                            : 0;

                        return (
                          <div key={channel.channel}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-[#46534A]">
                                {channel.channel}
                              </span>
                              <span className="text-xs text-[#818B82]">
                                {formatNumber(channel.sessions)} sessions
                                {' · '}
                                {percentage.toFixed(1)}%
                              </span>
                            </div>

                            <div className="w-full h-2.5 bg-[#F0F2EF] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#829B84] rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs text-[#929A93]">
                      {loading
                        ? 'Đang tải dữ liệu...'
                        : 'Chưa có dữ liệu kênh truy cập.'}
                    </div>
                  )}
                </div>

                {/* Acquisition details */}
                <div className="bg-white border border-[#E8EBE7] rounded-xl p-5 md:p-6">
                  <h3 className="text-sm font-semibold mb-1">
                    Channel Performance
                  </h3>
                  <p className="text-xs text-[#929A93] mb-5">
                    Hiệu quả của từng nhóm kênh
                  </p>

                  {channels.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#E8EBE7] text-[10px] text-[#929A93]">
                            <th className="pb-3 font-medium">Kênh</th>
                            <th className="pb-3 font-medium text-right">
                              Sessions
                            </th>
                            <th className="pb-3 font-medium text-right">
                              Active Users
                            </th>
                            <th className="pb-3 font-medium text-right">
                              Engaged
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {channels.map((channel) => (
                            <tr
                              key={channel.channel}
                              className="border-b border-[#F0F2EF] last:border-0"
                            >
                              <td className="py-3 text-xs font-medium text-[#46534A]">
                                {channel.channel}
                              </td>
                              <td className="py-3 text-xs text-right">
                                {formatNumber(channel.sessions)}
                              </td>
                              <td className="py-3 text-xs text-right">
                                {formatNumber(channel.activeUsers)}
                              </td>
                              <td className="py-3 text-xs text-right">
                                {formatNumber(channel.engagedSessions)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs text-[#929A93]">
                      Chưa có dữ liệu để hiển thị.
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-[#E8EBE7] flex justify-between">
                    <span className="text-xs text-[#929A93]">
                      Tổng Sessions
                    </span>
                    <span className="text-sm font-semibold text-[#29372F]">
                      {formatNumber(channelTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E8EBE7] rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <Eye size={17} className="text-[#9A8769]" />
                    <h3 className="text-sm font-semibold">Page Views</h3>
                  </div>
                  <div className="text-2xl font-semibold mt-4">
                    {metrics
                      ? formatNumber(metrics.screenPageViews)
                      : '—'}
                  </div>
                  <p className="text-xs text-[#929A93] mt-2">
                    Tổng lượt xem trang trong kỳ báo cáo
                  </p>
                </div>

                <div className="bg-white border border-[#E8EBE7] rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <MousePointerClick
                      size={17}
                      className="text-[#9A8769]"
                    />
                    <h3 className="text-sm font-semibold">Event Count</h3>
                  </div>
                  <div className="text-2xl font-semibold mt-4">
                    {metrics
                      ? formatNumber(metrics.eventCount)
                      : '—'}
                  </div>
                  <p className="text-xs text-[#929A93] mt-2">
                    Tổng số sự kiện được ghi nhận
                  </p>
                </div>
              </div>

              {/* Data Scope */}
              <div className="bg-white border border-[#E8EBE7] rounded-xl p-5">
                <h3 className="text-sm font-semibold">
                  Phạm vi dữ liệu hiện tại
                </h3>
                <p className="text-xs text-[#929A93] mt-2 leading-relaxed">
                  Dữ liệu được lấy từ Google Analytics 4 trong 7 ngày gần nhất,
                  kết thúc vào ngày hôm qua. Traffic Trend thể hiện số phiên
                  theo ngày; Traffic Acquisition thể hiện số phiên theo nhóm
                  kênh truy cập mặc định của GA4.
                </p>
                <p className="text-[11px] text-[#A0A8A1] mt-2">
                  Nguồn: {data?.source ?? 'Google Analytics 4'}
                </p>
              </div>

              {/* AI Insight */}
              <div className="bg-[#1F3029] text-white rounded-xl p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={17} className="text-[#D5B98C]" />
                  <span className="text-sm font-semibold">
                    AI Marketing Insights
                  </span>
                </div>
                <p className="text-xs text-white/55 leading-relaxed">
                  Khu vực này sẽ tổng hợp nhận định và đề xuất từ AI Agent
                  dựa trên dữ liệu GA4, hiệu quả kênh truy cập và kiến thức
                  thương hiệu GIAO THỜI. Hiện tại Dashboard mới hiển thị dữ
                  liệu phân tích, chưa tự động tạo insight.
                </p>
              </div>

            </div>
                   ) : activePage === 'content' ? (
            <ContentStudio />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E9EEE9] flex items-center justify-center mb-5">
                <PageIcon size={25} className="text-[#425B4B]" />
              </div>
              <h2 className="text-xl font-semibold">
                {currentPage?.label}
              </h2>
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
