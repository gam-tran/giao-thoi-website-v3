/**
 * Normalize AI-generated social copy for clean platform-ready text.
 * Deterministic checks catch formatting and obvious editorial issues; they cannot prove factual accuracy.
 */
const stripInlineMarkdown = (value: string) => value
  .replace(/\*\*(.*?)\*\*/gs, '$1')
  .replace(/__(.*?)__/gs, '$1')
  .replace(/(?<!\*)\*(?!\s)(.*?)(?<!\s)\*(?!\*)/gs, '$1')
  .replace(/(?<!_)_(?!\s)(.*?)(?<!\s)_(?!_)/gs, '$1')
  .replace(/`+/g, '');

const decodeHashtag = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export function normalizeSocialPostContent(input: unknown): string {
  let content = typeof input === 'string' ? input : input == null ? '' : String(input);
  content = content
    .replace(/\r\n?/g, '\n')
    .replace(/&nbsp;|&#x20;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\[([^\]]*)\]\(https?:\/\/static\.xx\.fbcdn\.net\/images\/emoji\.php[^)]*\)/gi, '$1')
    .replace(/\[([^\]]+)\]\(https?:\/\/www\.facebook\.com\/hashtag\/([^?)]+)[^)]*\)/gi, (_m, label: string, tag: string) => {
      const plain = stripInlineMarkdown(label).trim();
      return plain.startsWith('#') ? plain : '#' + decodeHashtag(tag).replace(/[^\p{L}\p{N}_-]/gu, '');
    })
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)(?:\s+[^)]*)?\)/g, (_m, label: string, url: string) => {
      const plain = stripInlineMarkdown(label).trim();
      return !plain || plain === url || /^https?:\/\//i.test(plain) ? url : plain + ': ' + url;
    })
    .replace(/\\([*_~`#>+=-])/g, '$1')
    .replace(/^\s*\\?---+\s*$/gm, '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/<\/?(?:strong|b|em|i|p|div|br)[^>]*>/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return stripInlineMarkdown(content)
    .replace(/\*\*/g, '')
    .replace(/__+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function getContentQualityIssues(content: string): string[] {
  const issues: string[] = [];
  const text = content.trim();
  if (!text) return ['Nội dung đang trống.'];

  if (/static\.xx\.fbcdn\.net\/images\/emoji|\[[^\]]+\]\(https?:\/\//i.test(text)) {
    issues.push('Còn liên kết/định dạng không phù hợp để đăng trực tiếp.');
  }
  if (/\\[*_~#-]|`|\*\*|__|^\s{0,3}#{1,6}\s|^\s*---+\s*$/m.test(text)) {
    issues.push('Còn cú pháp Markdown chưa được làm sạch.');
  }
  if (text.length < 80) {
    issues.push('Nội dung quá ngắn; cần kiểm tra đã đủ thông tin và lời kêu gọi hành động chưa.');
  }
  if (/\b(?:undefined|null|lorem ipsum|insert here|tên sản phẩm)\b/i.test(text)) {
    issues.push('Còn nội dung giữ chỗ hoặc dữ liệu chưa được điền.');
  }
  if (/\b(?:100%|duy nhất|tốt nhất|số một|cam kết|chữa khỏi)\b/i.test(text)) {
    issues.push('Có tuyên bố tuyệt đối cần kiểm chứng trước khi duyệt.');
  }

  const clichePatterns = [
    /vibe\s+rất\s+gì\s+và\s+này\s+nọ/i,
    /upgrade\s+cực\s+xịn/i,
    /must[ -]?have\s+item/i,
    /gói\s+trọn\s+(?:tinh\s+hoa|di\s+sản)/i,
    /nâng\s+tầm\s+(?:không\s+gian|phong\s+cách|trải\s+nghiệm)/i,
    /đậm\s+chất\s+(?:truyền\s+thống|di\s+sản)/i,
    /món\s+đồ\s+không\s+thể\s+thiếu/i,
    /hoàn\s+hảo\s+cho\s+mọi/i,
  ];
  if (clichePatterns.some(pattern => pattern.test(text))) {
    issues.push('Có cụm từ quảng cáo sáo rỗng/gượng ép; cần viết lại bằng lợi ích hoặc chi tiết cụ thể.');
  }

  if (/\b(?:kiêu\s+kỳ|siêu\s+phẩm|cực\s+xịn|đỉnh\s+cao|must-have)\b/i.test(text)) {
    issues.push('Có từ ngữ phô trương hoặc pha tiếng Anh không tự nhiên; cần diễn đạt giản dị hơn.');
  }

  return issues;
}
