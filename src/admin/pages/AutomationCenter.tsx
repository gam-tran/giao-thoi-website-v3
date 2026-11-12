
import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Power,
  RefreshCw,
  Workflow,
  XCircle,
} from 'lucide-react';

const API = {
  workflows: 'http://localhost:5678/webhook/giaothoi-automation-workflows',
  executions: 'http://localhost:5678/webhook/giaothoi-automation-executions',
  schedules: 'http://localhost:5678/webhook/giaothoi-schedules',
  control: 'http://localhost:5678/webhook/giaothoi-automation-control',
  run: 'http://localhost:5678/webhook/giaothoi-automation-run',
};

type WorkflowItem = {
  id: string;
  name: string;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  tags?: string[];
};

type ExecutionItem = {
  id: string;
  workflowId: string;
  status: string;
  mode?: string | null;
  startedAt?: string | null;
  stoppedAt?: string | null;
  durationMs?: number | null;
};

type ScheduleRule = {
  type: string;
  description: string;
};

type ScheduleItem = {
  workflowId: string;
  workflowName: string;
  active: boolean;
  hasSchedule: boolean;
  scheduleCount: number;
  schedules: {
    nodeName: string;
    schedules: ScheduleRule[];
  }[];
};

type Props = {
  success: boolean;
  total: number;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN');
};

const formatDuration = (value?: number | null) => {
  if (value == null) return '—';
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(1)} giây`;
};

const statusLabel = (status: string) => {
  const value = status.toLowerCase();
  if (value === 'success') return 'Thành công';
  if (value === 'error' || value === 'crashed') return 'Thất bại';
  if (value === 'running' || value === 'waiting') return 'Đang chạy';
  return status || 'Không xác định';
};

export default function AutomationCenter() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [runLoading, setRunLoading] = useState(false);
  const [selectedRun, setSelectedRun] = useState<'TEST' | 'CONTENT_STUDIO'>('CONTENT_STUDIO');
const [contentResult, setContentResult] = useState('');

const [contentRequest, setContentRequest] = useState({
  product: 'Tranh Đông Hồ',
  platform: 'Facebook',
  contentType: 'Post',
  objective: 'Tăng tương tác',
  tone: 'Gần gũi, tự nhiên',
  brief: 'Giới thiệu tranh Đông Hồ và cách ứng dụng trong không gian sống hiện đại.'
});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const [workflowResponse, executionResponse, scheduleResponse] =
        await Promise.all([
          fetch(API.workflows),
          fetch(API.executions),
          fetch(API.schedules),
        ]);

      if (!workflowResponse.ok) {
        throw new Error(`Workflow API lỗi HTTP ${workflowResponse.status}`);
      }
      if (!executionResponse.ok) {
        throw new Error(`Execution API lỗi HTTP ${executionResponse.status}`);
      }
      if (!scheduleResponse.ok) {
        throw new Error(`Schedule API lỗi HTTP ${scheduleResponse.status}`);
      }

      const [workflowData, executionData, scheduleData] =
        await Promise.all([
          workflowResponse.json(),
          executionResponse.json(),
          scheduleResponse.json(),
        ]);

      if (!workflowData.success || !executionData.success ||
          !scheduleData.success) {
        throw new Error('Một trong các API Automation trả về dữ liệu lỗi.');
      }

      setWorkflows(workflowData.workflows ?? []);
      setExecutions(executionData.executions ?? []);
      setSchedules(scheduleData.schedules ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải dữ liệu Automation Center.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const controlWorkflow = async (workflow: WorkflowItem) => {
    const action = workflow.active ? 'unpublish' : 'publish';
    const actionText = action === 'publish' ? 'Publish' : 'Unpublish';

    const confirmed = window.confirm(
      `M có chắc muốn ${actionText} workflow "${workflow.name}" không?`
    );

    if (!confirmed) return;

    setActionId(workflow.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(API.control, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: workflow.id,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`Control API lỗi HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Không thể thay đổi trạng thái workflow.');
      }

      setNotice(
        `${actionText} đã được gửi thành công cho "${workflow.name}".`
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể điều khiển workflow.'
      );
    } finally {
      setActionId('');
    }
  };
  
 const runWorkflow = async () => {
  const isContentStudio = selectedRun === 'CONTENT_STUDIO';

  const confirmed = window.confirm(
    isContentStudio
      ? 'Bạn có muốn chạy Content Studio để tạo nội dung AI không?'
      : 'Bạn có muốn chạy workflow kiểm thử không?'
  );

  if (!confirmed) return;

  setRunLoading(true);
  setError('');
  setNotice('');
  setContentResult('');

  try {
    const response = await fetch(API.run, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        isContentStudio
          ? {
              workflowId: 'CONTENT_STUDIO',
              payload: contentRequest,
            }
          : {
              workflowId: 'TEST',
            }
      ),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || `Run API lỗi HTTP ${response.status}`
      );
    }

    if (isContentStudio) {
      setContentResult(result.content || '');
    }

    await loadData();

    setNotice(
      isContentStudio
        ? 'Content Studio đã chạy thành công và tạo nội dung AI.'
        : `Chạy thử thành công: ${result.message}. Dữ liệu nhận được: ${result.testInput}`
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Không thể thực thi workflow.'
    );
  } finally {
    setRunLoading(false);
  }
};


  const activeCount = workflows.filter(item => item.active).length;
  const inactiveCount = workflows.length - activeCount;
  const successCount = executions.filter(
    item => item.status.toLowerCase() === 'success'
  ).length;
  const failedCount = executions.filter(
    item => ['error', 'crashed'].includes(item.status.toLowerCase())
  ).length;
  const scheduledCount = schedules.filter(item => item.hasSchedule).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[11px] text-[#929A93]">
            MANAGEMENT / AUTOMATION
          </p>
          <h2 className="text-2xl font-semibold text-[#26372E]">
            Automation Center
          </h2>
          <p className="mt-2 text-sm text-[#929A93]">
            Theo dõi, quản lý workflow, lịch chạy và lịch sử tự động hóa của GIAO THỜI.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#20352B] px-4 py-2.5 text-xs text-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </button>
      </div>

      {/* Connection errors */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#F0D6CB] bg-[#FFF4F0] p-4 text-[#9B5140]">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Chưa tải được dữ liệu Automation</p>
            <p className="mt-1 break-words text-xs">{error}</p>
            <p className="mt-2 text-xs">
              Kiểm tra n8n đang chạy và cả 4 workflow API đã được Publish.
            </p>
          </div>
        </div>
      )}

    

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: 'Tổng workflows',
            value: workflows.length,
            icon: Workflow,
          },
          {
            label: 'Đang hoạt động',
            value: activeCount,
            icon: CheckCircle2,
          },
          {
            label: 'Đã dừng',
            value: inactiveCount,
            icon: Power,
          },
          {
            label: 'Chạy thành công',
            value: successCount,
            icon: Activity,
          },
          {
            label: 'Chạy thất bại',
            value: failedCount,
            icon: XCircle,
          },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-[#E8EBE7] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#89938A]">{item.label}</span>
                <Icon size={17} className="text-[#9A8769]" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-[#29372F]">
                {loading && workflows.length === 0 ? '...' : item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Workflow management */}
      <section className="overflow-hidden rounded-xl border border-[#E8EBE7] bg-white">
        <div className="flex flex-col gap-2 border-b border-[#E8EBE7] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#26372E]">
              Workflow Management
            </h3>
            <p className="mt-1 text-xs text-[#929A93]">
              Danh sách workflow và trạng thái hoạt động trên n8n.
            </p>
          </div>
          <span className="text-xs text-[#929A93]">
            {workflows.length} workflows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="bg-[#F8F9F7] text-[#929A93]">
              <tr>
                <th className="px-5 py-3 font-medium">Workflow</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                <th className="px-5 py-3 font-medium">Cập nhật</th>
                <th className="px-5 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map(workflow => (
                <tr
                  key={workflow.id}
                  className="border-t border-[#F0F2EF]"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#34443A]">
                      {workflow.name}
                    </p>
                    <p className="mt-1 text-[10px] text-[#A0A8A1]">
                      ID: {workflow.id}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {workflow.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF6EF] px-2.5 py-1 text-[10px] font-medium text-[#477653]">
                        <CheckCircle2 size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F3F1] px-2.5 py-1 text-[10px] font-medium text-[#737D75]">
                        <Power size={12} />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#818B82]">
                    {formatDate(workflow.updatedAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => controlWorkflow(workflow)}
                      disabled={actionId === workflow.id}
                      className={`rounded-lg px-3 py-2 text-[11px] font-medium disabled:opacity-50 ${
                        workflow.active
                          ? 'border border-[#E8D9D4] text-[#A45B4D] hover:bg-[#FFF4F0]'
                          : 'bg-[#20352B] text-white hover:bg-[#30483A]'
                      }`}
                    >
                      {actionId === workflow.id
                        ? 'Đang xử lý...'
                        : workflow.active
                          ? 'Unpublish'
                          : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && workflows.length === 0 && (
            <p className="p-8 text-center text-xs text-[#929A93]">
              Chưa có dữ liệu workflow.
            </p>
          )}
        </div>
      </section>
  {/* Manual Run */}
<section className="rounded-xl border border-[#E8EBE7] bg-white p-5">
  <div className="flex items-center gap-2">
    <Activity size={17} className="text-[#9A8769]" />
    <h3 className="text-sm font-semibold text-[#26372E]">
      Manual Workflow Execution
    </h3>
  </div>

  <p className="mt-2 text-xs text-[#929A93]">
    Chạy workflow trực tiếp thông qua Automation Run API.
  </p>

  {/* Workflow selection */}
  <div className="mt-5 max-w-md">
    <label className="mb-2 block text-xs font-medium text-[#526056]">
      Chọn workflow
    </label>
    <select
      value={selectedRun}
      onChange={e => setSelectedRun(e.target.value as 'TEST' | 'CONTENT_STUDIO')}
      disabled={runLoading}
      className="w-full rounded-lg border border-[#E1E6E0] bg-white px-3 py-2.5 text-xs text-[#34443A]"
    >
      <option value="CONTENT_STUDIO">GIAO THỜI - Content Studio API</option>
      <option value="TEST">GIAO THỜI - Test Manual Run</option>
    </select>
  </div>

  {/* Content Studio inputs */}
  {selectedRun === 'CONTENT_STUDIO' && (
    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-xs font-medium text-[#526056]">
          Sản phẩm
        </label>
        <input
          value={contentRequest.product}
          onChange={e => setContentRequest(prev => ({
            ...prev,
            product: e.target.value
          }))}
          className="w-full rounded-lg border border-[#E1E6E0] px-3 py-2.5 text-xs text-[#34443A]"
          placeholder="Tên sản phẩm"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-[#526056]">
          Nền tảng
        </label>
        <select
          value={contentRequest.platform}
          onChange={e => setContentRequest(prev => ({
            ...prev,
            platform: e.target.value
          }))}
          className="w-full rounded-lg border border-[#E1E6E0] bg-white px-3 py-2.5 text-xs text-[#34443A]"
        >
          <option>Facebook</option>
          <option>TikTok</option>
          <option>Instagram</option>
          <option>Website</option>
          <option>Zalo</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-[#526056]">
          Loại nội dung
        </label>
        <select
          value={contentRequest.contentType}
          onChange={e => setContentRequest(prev => ({
            ...prev,
            contentType: e.target.value
          }))}
          className="w-full rounded-lg border border-[#E1E6E0] bg-white px-3 py-2.5 text-xs text-[#34443A]"
        >
          <option>Post</option>
          <option>Caption</option>
          <option>Video Script</option>
          <option>Product Description</option>
          <option>Content Ideas</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-[#526056]">
          Mục tiêu
        </label>
        <select
          value={contentRequest.objective}
          onChange={e => setContentRequest(prev => ({
            ...prev,
            objective: e.target.value
          }))}
          className="w-full rounded-lg border border-[#E1E6E0] bg-white px-3 py-2.5 text-xs text-[#34443A]"
        >
          <option>Tăng tương tác</option>
          <option>Tăng nhận diện thương hiệu</option>
          <option>Tăng lượt truy cập website</option>
          <option>Tăng tin nhắn tư vấn</option>
          <option>Thúc đẩy mua hàng</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-xs font-medium text-[#526056]">
          Giọng văn
        </label>
        <input
          value={contentRequest.tone}
          onChange={e => setContentRequest(prev => ({
            ...prev,
            tone: e.target.value
          }))}
          className="w-full rounded-lg border border-[#E1E6E0] px-3 py-2.5 text-xs text-[#34443A]"
          placeholder="Ví dụ: gần gũi, tự nhiên"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-xs font-medium text-[#526056]">
          Yêu cầu nội dung (Brief)
        </label>
        <textarea
          rows={4}
          value={contentRequest.brief}
          onChange={e => setContentRequest(prev => ({
            ...prev,
            brief: e.target.value
          }))}
          className="w-full rounded-lg border border-[#E1E6E0] px-3 py-2.5 text-xs text-[#34443A]"
          placeholder="Mô tả yêu cầu nội dung muốn AI thực hiện..."
        />
      </div>
    </div>
  )}

  <div className="mt-5 flex justify-end">
    <button
      onClick={runWorkflow}
      disabled={runLoading}
      className="flex items-center justify-center gap-2 rounded-lg bg-[#20352B] px-5 py-2.5 text-xs text-white disabled:opacity-50"
    >
      <Activity size={14} />
      {runLoading ? 'Đang thực thi...' : 'Chạy workflow'}
    </button>
  </div>
</section>

{notice && (
  <div className="rounded-xl border border-[#D8E9DB] bg-[#EDF6EF] p-4 text-sm text-[#376344]">
    {notice}
  </div>
)}

{/* Generated Content */}
{contentResult && (
  <section className="rounded-xl border border-[#E8EBE7] bg-white p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-[#26372E]">
          AI Generated Content
        </h3>
        <p className="mt-1 text-xs text-[#929A93]">
          Nội dung được tạo bởi Content Studio.
        </p>
      </div>

      <button
        onClick={() => {
          navigator.clipboard.writeText(contentResult);
          setNotice('Đã sao chép nội dung.');
        }}
        className="rounded-lg border border-[#E1E6E0] px-3 py-2 text-xs text-[#526056] hover:bg-[#F8F9F7]"
      >
        Sao chép nội dung
      </button>
    </div>

    <div className="mt-4 whitespace-pre-wrap rounded-lg bg-[#F8F9F7] p-4 text-xs leading-6 text-[#34443A]">
      {contentResult}
    </div>
  </section>
)}

      {/* Execution history */}
      <section className="overflow-hidden rounded-xl border border-[#E8EBE7] bg-white">
        <div className="border-b border-[#E8EBE7] p-5">
          <div className="flex items-center gap-2">
            <Clock3 size={17} className="text-[#9A8769]" />
            <h3 className="text-sm font-semibold text-[#26372E]">
              Execution History
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#929A93]">
            Các lần thực thi workflow gần đây.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="bg-[#F8F9F7] text-[#929A93]">
              <tr>
                <th className="px-5 py-3 font-medium">Workflow ID</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                <th className="px-5 py-3 font-medium">Thời gian bắt đầu</th>
                <th className="px-5 py-3 font-medium">Thời lượng</th>
                <th className="px-5 py-3 font-medium">Chế độ</th>
              </tr>
            </thead>
            <tbody>
              {executions.slice(0, 30).map(execution => {
                const failed = ['error', 'crashed'].includes(
                  execution.status.toLowerCase()
                );
                const succeeded = execution.status.toLowerCase() === 'success';

                return (
                  <tr
                    key={execution.id}
                    className="border-t border-[#F0F2EF]"
                  >
                    <td className="px-5 py-3 font-medium text-[#526056]">
                      {execution.workflowId}
                    </td>
                    <td className="px-5 py-3">
                      <span className={
                        failed
                          ? 'text-[#B64B40]'
                          : succeeded
                            ? 'text-[#477653]'
                            : 'text-[#9A8769]'
                      }>
                        {statusLabel(execution.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#818B82]">
                      {formatDate(execution.startedAt)}
                    </td>
                    <td className="px-5 py-3 text-[#818B82]">
                      {formatDuration(execution.durationMs)}
                    </td>
                    <td className="px-5 py-3 text-[#818B82]">
                      {execution.mode || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && executions.length === 0 && (
            <p className="p-8 text-center text-xs text-[#929A93]">
              Chưa có lịch sử thực thi.
            </p>
          )}
        </div>
      </section>

      {/* Schedule management */}
      <section className="rounded-xl border border-[#E8EBE7] bg-white p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock size={17} className="text-[#9A8769]" />
              <h3 className="text-sm font-semibold text-[#26372E]">
                Schedule Management
              </h3>
            </div>
            <p className="mt-1 text-xs text-[#929A93]">
              Lịch tự động được cấu hình trong các workflow.
            </p>
          </div>
          <span className="rounded-full bg-[#F2F3F1] px-3 py-1 text-[10px] text-[#737D75]">
            {scheduledCount} có lịch
          </span>
        </div>

        <div className="space-y-3">
          {schedules.map(item => (
            <div
              key={item.workflowId}
              className="rounded-lg border border-[#EEF0ED] p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#34443A]">
                    {item.workflowName}
                  </p>
                  <p className="mt-1 text-[10px] text-[#A0A8A1]">
                    {item.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <span className={`text-[10px] ${
                  item.hasSchedule ? 'text-[#477653]' : 'text-[#929A93]'
                }`}>
                  {item.hasSchedule
                    ? `${item.scheduleCount} lịch được cấu hình`
                    : 'Chưa có Schedule Trigger'}
                </span>
              </div>

              {item.schedules?.map((schedule, index) => (
                <div
                  key={`${schedule.nodeName}-${index}`}
                  className="mt-3 border-t border-[#F0F2EF] pt-3"
                >
                  <p className="text-[10px] text-[#929A93]">
                    {schedule.nodeName}
                  </p>
                  {schedule.schedules?.map((rule, ruleIndex) => (
                    <p
                      key={ruleIndex}
                      className="mt-1 text-xs text-[#526056]"
                    >
                      {rule.description}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {schedules.length === 0 && !loading && (
          <p className="py-8 text-center text-xs text-[#929A93]">
            Chưa có dữ liệu lịch chạy.
          </p>
        )}

        <p className="mt-4 text-[10px] leading-relaxed text-[#A0A8A1]">
          Lịch được đọc từ cấu hình Schedule Trigger đã lưu. Workflow cần được
          Publish/Active để lịch tự động thực thi.
        </p>
      </section>
    </div>
  );
}
