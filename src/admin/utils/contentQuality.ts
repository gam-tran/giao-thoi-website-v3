/**
 * Clean AI-generated social copy for display and publishing.
 * This is a deterministic formatting and risk check, not a factuality detector.
 */
const stripInlineMarkdown = (value: string) => value
  .replace(/\\*\\*(.*?)\\*\\*/gs, '$1')
  .replace(/__(.*?)__/gs, '$1')
  .replace(/(?<!\\*)\\*(?!\\s)(.*?)(?<!\\s)\\*/gs, '$1')
  .replace(/(?<!_)_(?!\\s)(.*?)(?<!\\s)_/gs, '$1')
  .replace(/`/g, '');

export function normalizeSocialPostContent(input: unknown): string {
  let content = typeof input === 'string' ? input : input == null ? '' : String(input);
  content = content
    .replace(/\\r\\n?/g, '\\n')
    .replace(/&nbsp;|&#x20;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\\[([^\\]]*)\\]\\(https?:\\/\\/static\\.xx\\.fbcdn\\.net\\/images\\/emoji\\.php[^)]*\\)/gi, '$1')
    .replace(/\\[([^\\]]+)\\]\\(https?:\\/\\/www\\.facebook\\.com\\/hashtag\\/([^?)]+)[^)]*\\)/gi, (_m, label: string, tag: string) => {
      const plain = stripInlineMarkdown(label).trim();
      return plain.startsWith('#') ? plain : '#' + decodeURIComponent(tag).replace(/[^\\p{L}\\p{N}_-]/gu, '');
    })
    .replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)(?:\\s+[^)]*)?\\)/g, (_m, label: string, url: string) => {
      const plain = stripInlineMarkdown(label).trim();
      return !plain || plain === url || /^https?:\\/\\//i.test(plain) ? url : plain + ': ' + url;
    })
    .replace(/\\\\([*_~`#>+=-])/g, '$1')
    .replace(/^\\s*\\\\?---+\\s*$/gm, '')
    .replace(/^\\s{0,3}#{1,6}\\s+/gm, '')
    .replace(/<\\/?(?:strong|b|em|i|p|div|br)[^>]*>/gi, '')
    .replace(/[ \\t]+\\n/g, '\\n')
    .replace(/\\n{3,}/g, '\\n\\n')
    .trim();
  content = stripInlineMarkdown(content)
    .replace(/\\*\\*/g, '')
    .replace(/__+/g, '')
    .replace(/\\n{3,}/g, '\\n\\n')
    .trim();
  return content;
}

export function getContentQualityIssues(content: string): string[] {
  const issues: string[] = [];
  const text = content.trim();
  if (!text) return ['Nội dung đang trống.'];
  if (/static\\.xx\\.fbcdn\\.net\\/images\\/emoji|\\[[^\\]]+\\]\\(https?:\\/\\//i.test(text)) {
    issues.push('Còn liên kết hoặc định dạng ảnh/hashtag không phù hợp để đăng.');
  }
  if (/\\\\[*_~#-]|\\*\\*|__|^\\s{0,3}#{1,6}\\s|^\\s*---+\\s*$/m.test(text)) {
    issues.push('Còn cú pháp Markdown chưa được làm sạch.');
  }
  if (text.length < 80) issues.push('Nội dung quá ngắn; cần kiểm tra bài có đủ ý và lời kêu gọi hành động chưa.');
  if (/\\b(?:undefined|null|lorem ipsum|insert here|[Tt]ên sản phẩm)\\b/.test(text)) {
    issues.push('Còn nội dung giữ chỗ hoặc dữ liệu chưa được điền.');
  }
  if (/\\b(?:cọ non|lụa tơ tằm dệt tay|vành tre|làng nghề|100%|duy nhất|tốt nhất|chữa|cam kết)\\b/i.test(text)) {
    issues.push('Có chi tiết sản phẩm/claim cần đối chiếu Product Data trước khi duyệt.');
  }
  return issues;
}
