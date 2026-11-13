
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Plus,
  Copy,
  RotateCcw,
  Loader2,
  MessageSquare,
  Lightbulb,
  Megaphone,
  Target,
  BookOpen,
} from 'lucide-react';

const ASSISTANT_API_URL = '/api/n8n/giaothoi-ai-assistant';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const suggestions = [
  {
    icon: Target,
    title: 'Phân tích khách hàng',
    description: 'Xác định chân dung và nhu cầu khách hàng',
    prompt: 'Hãy phân tích nhóm khách hàng mục tiêu phù hợp với GIAO THỜI. Đề xuất chân dung khách hàng, nhu cầu, rào cản mua hàng và cách tiếp cận.',
  },
  {
    icon: Megaphone,
    title: 'Lên ý tưởng Marketing',
    description: 'Tìm ý tưởng truyền thông cho sản phẩm',
    prompt: 'Hãy đề xuất 5 ý tưởng Marketing thực tế cho GIAO THỜI, ưu tiên tăng nhận diện thương hiệu và thu hút khách hàng tiềm năng.',
  },
  {
    icon: Lightbulb,
    title: 'Tìm kiếm insight',
    description: 'Tìm vấn đề và động cơ mua hàng',
    prompt: 'Hãy phân tích insight của khách hàng quan tâm đến sản phẩm thủ công và chất liệu truyền thống Việt Nam. Giải thích nhu cầu, động cơ và rào cản mua hàng.',
  },
  {
    icon: BookOpen,
    title: 'Tư vấn thương hiệu',
    description: 'Định vị và phát triển thương hiệu',
    prompt: 'Hãy đánh giá định vị thương hiệu hiện tại của GIAO THỜI và đề xuất hướng truyền thông giúp thương hiệu khác biệt hơn.',
  },
];

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();

    if (!question || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: question },
    ];

    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(ASSISTANT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages.slice(-12),
        }),
      });

      if (!response.ok) {
        throw new Error(`API trả về lỗi HTTP ${response.status}`);
      }

      const result = await response.json();
      const answer = result.content || result.message || '';

      if (!result.success || !answer) {
        throw new Error(
          result.message || 'AI chưa trả về câu trả lời.'
        );
      }

      setMessages([
        ...nextMessages,
        { role: 'assistant', content: answer },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối AI Assistant.'
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewChat = () => {
    if (loading) return;
    setMessages([]);
    setInput('');
    setError('');
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      setError('Không thể sao chép nội dung trên trình duyệt này.');
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-5 min-h-[calc(100vh-150px)]">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs text-[#89938A] mb-2">
            WORKSPACE / AI ASSISTANT
          </div>
          <h2 className="text-2xl md:text-[28px] font-semibold tracking-tight">
            Marketing AI Assistant
          </h2>
          <p className="text-sm text-[#818B82] mt-2">
            Trợ lý AI đồng hành cùng các hoạt động Marketing của GIAO THỜI.
          </p>
        </div>

        <button
          onClick={startNewChat}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white border border-[#E8EBE7] rounded-lg px-4 py-2.5 text-xs font-medium text-[#526056] hover:bg-[#F6F7F5] disabled:opacity-50"
        >
          <Plus size={15} />
          Cuộc trò chuyện mới
        </button>
      </div>

      {/* Assistant identity */}
      <div className="bg-[#1F3029] text-white rounded-2xl p-5 md:p-6 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#D5B98C] text-[#1F3029] flex items-center justify-center shrink-0">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="font-semibold text-sm">
            GIAO THỜI Marketing Assistant
          </div>
          <p className="text-xs text-white/65 mt-2 leading-relaxed">
            Tôi có thể hỗ trợ bạn nghiên cứu khách hàng, phát triển chiến lược,
            tư vấn thương hiệu và giải quyết các vấn đề Marketing. Câu trả lời
            được định hướng theo kiến thức sản phẩm và thương hiệu GIAO THỜI.
          </p>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-[#D5B98C]">
            <span className="w-2 h-2 rounded-full bg-[#8AC49A]" />
            Marketing knowledge assistant
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 bg-white border border-[#E8EBE7] rounded-2xl flex flex-col min-h-[430px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF0ED]">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#9A8769]" />
            <span className="text-sm font-semibold">
              Cuộc trò chuyện
            </span>
          </div>
          <span className="text-[11px] text-[#929A93]">
            {messages.length} tin nhắn
          </span>
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-5 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-5">
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl bg-[#F3F0E9] text-[#9A8769] flex items-center justify-center mx-auto mb-4">
                  <Bot size={27} />
                </div>
                <h3 className="text-lg font-semibold text-[#29372F]">
                  Xin chào! Tôi có thể giúp gì cho bạn?
                </h3>
                <p className="text-xs text-[#929A93] mt-2">
                  Hãy đặt câu hỏi hoặc chọn một gợi ý bên dưới để bắt đầu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      onClick={() => sendMessage(item.prompt)}
                      disabled={loading}
                      className="text-left p-4 border border-[#E8EBE7] rounded-xl hover:border-[#C9B38D] hover:bg-[#FCFBF8] transition-colors"
                    >
                      <Icon size={18} className="text-[#9A8769] mb-3" />
                      <div className="text-xs font-semibold text-[#354238]">
                        {item.title}
                      </div>
                      <p className="text-[11px] text-[#929A93] mt-1">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    message.role === 'assistant'
                      ? 'bg-[#1F3029] text-[#D5B98C]'
                      : 'bg-[#E9E1D3] text-[#69563B]'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'assistant'
                      ? 'bg-[#F6F7F5] text-[#354238] rounded-tl-sm'
                      : 'bg-[#1F3029] text-white rounded-tr-sm'
                  }`}
                >
                  <div className="text-[10px] font-semibold mb-2 opacity-65">
                    {message.role === 'assistant' ? 'GIAO THỜI AI' : 'BẠN'}
                  </div>
                  <div className="text-xs leading-6 whitespace-pre-wrap break-words">
                    {message.content}
                  </div>

                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="flex items-center gap-1.5 mt-3 text-[10px] text-[#89938A] hover:text-[#354238]"
                    >
                      <Copy size={12} />
                      Sao chép
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1F3029] text-[#D5B98C] flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-[#F6F7F5] rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-[#89938A]">
                <Loader2 size={14} className="animate-spin" />
                AI đang suy nghĩ...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-4 mb-3 p-3 rounded-lg bg-[#FFF1F0] border border-[#F2D0CC] text-xs text-[#963C33]">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[#EEF0ED]">
          <div className="flex items-end gap-3 bg-[#F6F7F5] border border-[#E8EBE7] rounded-xl p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi Marketing của bạn..."
              rows={2}
              disabled={loading}
              className="flex-1 resize-none bg-transparent outline-none text-xs text-[#354238] placeholder:text-[#A0A8A1] px-2 py-2 max-h-32"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-lg bg-[#1F3029] text-white flex items-center justify-center hover:bg-[#31483C] disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Gửi tin nhắn"
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[10px] text-[#A0A8A1]">
              Enter để gửi · Shift + Enter để xuống dòng
            </span>
            <span className="text-[10px] text-[#A0A8A1]">
              AI có thể đưa ra thông tin chưa chính xác.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
