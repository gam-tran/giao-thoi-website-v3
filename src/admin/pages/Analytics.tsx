
import React, { useEffect, useState } from 'react';
import {
  Activity,
  Users,
  Eye,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  FileText,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';

const ANALYTICS_API_URL =
  'http://localhost:5678/webhook/giaothoi-analytics';

type AnalyticsData = {
  overview: {
    sessions: number;
    activeUsers: number;
    newUsers: number;
    screenPageViews: number;
    engagedSessions: number;
    eventCount: number;
  };
  trafficTrend: {
    date: string;
    sessions: number;
    activeUsers: number;
    screenPageViews: number;
  }[];
  acquisition: {
    channel: string;
    sessions: number;
    activeUsers: number;
    engagedSessions: number;
  }[];
  devices: {
    device: string;
    sessions: number;
    activeUsers: number;
  }[];
  pages: {
    page: string;
    views: number;
    activeUsers: number;
  }[];
  events: {
    event: string;
    count: number;
    users: number;
  }[];
  dataPeriod: string;
  source: string;
};

const emptyData: AnalyticsData = {
  overview: {
    sessions: 0,
    activeUsers: 0,
    newUsers: 0,
    screenPageViews: 0,
    engagedSessions: 0,
    eventCount: 0,
  },
  trafficTrend: [],
  acquisition: [],
  devices: [],
  pages: [],
  events: [],
  dataPeriod: '',
  source: 'Google Analytics 4',
};

const formatNumber = (value: number) =>
  Number(value || 0).toLocaleString('vi-VN');

const formatDate = (value: string) => {
  if (!value || value.length !== 8) return value;
  return `${value.slice(6, 8)}/${value.slice(4, 6)}`;
};

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>(emptyData);
  const [period, setPeriod] = useState('7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(ANALYTICS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Không lấy được dữ liệu GA4.');
      }

      setData({
        ...emptyData,
        ...result,
        overview: {
          ...emptyData.overview,
          ...result.overview,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối Analytics API.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const metrics = [
    {
      label: 'Sessions',
      value: data.overview.sessions,
      icon: Activity,
      color: '#547D67',
    },
    {
      label: 'Active Users',
      value: data.overview.activeUsers,
      icon: Users,
      color: '#A78B61',
    },
    {
      label: 'New Users',
      value: data.overview.newUsers,
      icon: MousePointerClick,
      color: '#7186A0',
    },
    {
      label: 'Page Views',
      value: data.overview.screenPageViews,
      icon: Eye,
      color: '#987C9D',
    },
  ];

  const maxTraffic = Math.max(
    1,
    ...data.trafficTrend.map(item => item.sessions)
  );

  const maxChannel = Math.max(
    1,
    ...data.acquisition.map(item => item.sessions)
  );

  const maxDevice = Math.max(
    1,
    ...data.devices.map(item => item.sessions)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-[#929A93] mb-2">
            WORKSPACE / ANALYTICS
          </p>
          <h2 className="text-2xl font-semibold text-[#26372E]">
            Marketing Analytics
          </h2>
          <p className="text-sm text-[#929A93] mt-2">
            Theo dõi và phân tích hiệu quả hoạt động website GIAO THỜI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={event => setPeriod(event.target.value)}
            className="bg-white border border-[#E5E9E5] rounded-lg px-3 py-2.5 text-xs outline-none"
          >
            <option value="7">7 ngày gần nhất</option>
            <option value="28">28 ngày gần nhất</option>
            <option value="90">90 ngày gần nhất</option>
          </select>

          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-2 bg-[#20352B] text-white rounded-lg px-4 py-2.5 text-xs disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin' : ''}
            />
            Làm mới
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-[#FFF4F0] border border-[#F0D6CB] text-[#9B5140] rounded-xl p-4">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Chưa tải được dữ liệu</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Period */}
      <div className="flex items-center gap-2 text-xs text-[#929A93]">
        <CalendarDays size={14} />
        <span>
          Kỳ dữ liệu: {data.dataPeriod || `${period} ngày gần nhất`}
        </span>
        <span>·</span>
        <span>{data.source}</span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(item => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white border border-[#E9ECE8] rounded-xl p-5"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#929A93]">
                  {item.label}
                </span>
                <Icon size={18} color={item.color} />
              </div>

              <div className="text-2xl font-semibold text-[#26372E] mt-4">
                {formatNumber(item.value)}
              </div>

              <p className="text-[10px] text-[#A0A8A1] mt-2">
                Google Analytics 4
              </p>
            </div>
          );
        })}
      </div>

      {/* Engagement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E9ECE8] rounded-xl p-5">
          <p className="text-xs text-[#929A93]">Engaged Sessions</p>
          <p className="text-2xl font-semibold text-[#26372E] mt-3">
            {formatNumber(data.overview.engagedSessions)}
          </p>
          <p className="text-[11px] text-[#929A93] mt-2">
            Phiên truy cập có tương tác theo định nghĩa GA4.
          </p>
        </div>

        <div className="bg-white border border-[#E9ECE8] rounded-xl p-5">
          <p className="text-xs text-[#929A93]">Total Events</p>
          <p className="text-2xl font-semibold text-[#26372E] mt-3">
            {formatNumber(data.overview.eventCount)}
          </p>
          <p className="text-[11px] text-[#929A93] mt-2">
            Tổng số sự kiện được ghi nhận.
          </p>
        </div>
      </div>

      {/* Traffic trend */}
      <div className="bg-white border border-[#E9ECE8] rounded-xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-sm text-[#26372E]">
              Traffic Trend
            </h3>
            <p className="text-xs text-[#929A93] mt-1">
              Sessions theo từng ngày
            </p>
          </div>
          <Activity size={18} className="text-[#547D67]" />
        </div>

        {data.trafficTrend.length > 0 ? (
          <div className="flex items-end gap-2 h-48 overflow-x-auto">
            {data.trafficTrend.map(item => (
              <div
                key={item.date}
                className="flex-1 min-w-[30px] h-full flex flex-col justify-end items-center gap-2"
              >
                <span className="text-[10px] text-[#718078]">
                  {item.sessions}
                </span>
                <div
                  className="w-full max-w-12 bg-[#6E927D] rounded-t-md min-h-[3px]"
                  style={{
                    height: `${(item.sessions / maxTraffic) * 75}%`,
                  }}
                />
                <span className="text-[9px] text-[#929A93] whitespace-nowrap">
                  {formatDate(item.date)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#A0A8A1] py-12 text-center">
            {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu traffic.'}
          </p>
        )}
      </div>

      {/* Acquisition and devices */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E9ECE8] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={17} className="text-[#547D67]" />
            <h3 className="font-semibold text-sm text-[#26372E]">
              Traffic Acquisition
            </h3>
          </div>

          <div className="space-y-5">
            {data.acquisition.map(item => (
              <div key={item.channel}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#526056]">
                    {item.channel}
                  </span>
                  <span className="font-semibold text-[#26372E]">
                    {formatNumber(item.sessions)}
                  </span>
                </div>
                <div className="h-2 bg-[#F0F2EF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6E927D] rounded-full"
                    style={{
                      width: `${(item.sessions / maxChannel) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {data.acquisition.length === 0 && (
              <p className="text-xs text-[#A0A8A1]">
                Chưa có dữ liệu acquisition.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E9ECE8] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Monitor size={17} className="text-[#547D67]" />
            <h3 className="font-semibold text-sm text-[#26372E]">
              Device Analysis
            </h3>
          </div>

          <div className="space-y-5">
            {data.devices.map(item => {
              const Icon =
                item.device.toLowerCase() === 'mobile'
                  ? Smartphone
                  : item.device.toLowerCase() === 'tablet'
                    ? Tablet
                    : Monitor;

              return (
                <div key={item.device}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="flex items-center gap-2 text-[#526056]">
                      <Icon size={14} />
                      {item.device}
                    </span>
                    <span className="font-semibold text-[#26372E]">
                      {formatNumber(item.sessions)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F0F2EF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B49A70] rounded-full"
                      style={{
                        width: `${(item.sessions / maxDevice) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {data.devices.length === 0 && (
              <p className="text-xs text-[#A0A8A1]">
                Chưa có dữ liệu thiết bị.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pages */}
      <div className="bg-white border border-[#E9ECE8] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={17} className="text-[#547D67]" />
          <h3 className="font-semibold text-sm text-[#26372E]">
            Top Performing Pages
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[#929A93] border-b border-[#EEF0ED]">
                <th className="py-3 font-medium">Page</th>
                <th className="py-3 font-medium text-right">Views</th>
                <th className="py-3 font-medium text-right">Active Users</th>
              </tr>
            </thead>
            <tbody>
              {data.pages.map((item, index) => (
                <tr
                  key={`${item.page}-${index}`}
                  className="border-b border-[#F2F3F1] last:border-0"
                >
                  <td className="py-3 text-[#526056] max-w-[260px] truncate">
                    {item.page}
                  </td>
                  <td className="py-3 text-right font-medium text-[#26372E]">
                    {formatNumber(item.views)}
                  </td>
                  <td className="py-3 text-right text-[#526056]">
                    {formatNumber(item.activeUsers)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.pages.length === 0 && (
            <p className="text-xs text-[#A0A8A1] py-6 text-center">
              Chưa có dữ liệu trang.
            </p>
          )}
        </div>
      </div>

      {/* Events */}
      <div className="bg-white border border-[#E9ECE8] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <MousePointerClick size={17} className="text-[#547D67]" />
          <h3 className="font-semibold text-sm text-[#26372E]">
            Event Performance
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[#929A93] border-b border-[#EEF0ED]">
                <th className="py-3 font-medium">Event Name</th>
                <th className="py-3 font-medium text-right">Event Count</th>
                <th className="py-3 font-medium text-right">Users</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((item, index) => (
                <tr
                  key={`${item.event}-${index}`}
                  className="border-b border-[#F2F3F1] last:border-0"
                >
                  <td className="py-3 text-[#526056]">{item.event}</td>
                  <td className="py-3 text-right font-medium text-[#26372E]">
                    {formatNumber(item.count)}
                  </td>
                  <td className="py-3 text-right text-[#526056]">
                    {formatNumber(item.users)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.events.length === 0 && (
            <p className="text-xs text-[#A0A8A1] py-6 text-center">
              Chưa có dữ liệu sự kiện.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
