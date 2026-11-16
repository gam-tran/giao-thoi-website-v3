/**
 * Normalize AI-generated social copy into plain text suitable for Facebook,
 * Instagram and TikTok. This is a presentation cleanup layer, not a substitute
 * for human review or product-fact verification.
 */
const stripInlineMarkdown = (value: string) =>
  value
    .replace(/\\*\\*(.*?)\\*\\*/gs, '$1')
    .replace(/__(.*?)__/gs, '$1')
    .replace(/\\*(.*?)\\*/gs, '$1')
    .replace(/_(.*?)_/gs, '$1')
    .replace(/`/g, '');

export function normalizeSocialPostContent(input: unknown): string {
  let content = typeof input === 'string'
    ? input
    : input == null
      ? ''
      : String(input);

  content = content
    .replace(/\\r\\n?/g, '\\n')
    .replace(/&#x20;|&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    // Facebook sometimes returns emoji and hashtag links as HTML-style Markdown.
    .replace(/\\[([^\\]]*)\\]\\((https?:\\/\\/static\\.xx\\.fbcdn\\.net\\/images\\/emoji\\.php[^)]*)\\)/gi, '$1')
    .replace(/\\[([^\\]]*)\\]\\((https?:\\/\\/www\\.facebook\\.com\\/hashtag\\/([^?)]+)[^)]*)\\)/gi, (_match, label: string, _url: string, tag: string) => {
      const cleanLabel = stripInlineMarkdown(label).trim();
      return cleanLabel.startsWith('#') ? cleanLabel : `#${decodeURIComponent(tag).replace(/[^\\p{L}\\p{N}_-]/gu, '')}`;
    })
    // Preserve destination URLs, but remove Markdown link syntax that Facebook displays literally.
    .replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)(?:\\s+[^)]*)?\\)/g, (_match, label: string, url: string) => {
      const cleanLabel = stripInlineMarkdown(label).trim();
      if (!cleanLabel || cleanLabel === url) return url;
      if (/^https?:\\/\\//i.test(cleanLabel)) return cleanLabel;
      return `${cleanLabel}: ${url}`;
    })
    // Undo escaped Markdown punctuation commonly returned by copied AI output.
    .replace(/\\\\([*_~`#>+=-])/g, '$1')
    .replace(/^\\s*\\\\?---+\\s*$/gm, '')
    .replace(/^\\s{0,3}#{1,6}\\s+/gm, '')
    .replace(/\\*\\*/g, '')
    .replace(/__+/g, '')
    .replace(/`/g, '')
    .replace(/[ \\t]+\\n/g, '\\n')
    .replace(/\\n{3,}/g, '\\n\\n')
    .trim();

  return content;
}

export function getContentQualityIssues(content: string): string[] {
  const issues: string[] = [];
  if (!content.trim()) issues.push('Nội dung đang trống.');
  if (/static\\.xx\\.fbcdn\\.net\\/images\\/emoji/i.test(content)) {
    issues.push('Còn sót đường dẫn ảnh emoji nội bộ của Facebook.');
  }
  if (/\\[[^\\]]+\\]\\(https?:\\/\\//i.test(content)) {
    issues.push('Còn cú pháp liên kết Markdown; hãy chuyển thành URL hiển thị trực tiếp.');
  }
  if (/\\\\[*_~#-]|\\*\\*|__/.test(content)) {
    issues.push('Còn ký tự Markdown bị escape hoặc định dạng thô.');
  }
  if (content.trim().length > 0 && content.trim().length < 50) {
    issues.push('Nội dung quá ngắn; cần kiểm tra xem AI có trả về thiếu phần hay không.');
  }
  return issues;
}
