# GIAO THỜI – AI Agent Architecture & Implementation Notes

> Tài liệu này ghi nhận những gì có thể xác minh từ mã nguồn của repository. Cấu hình bên trong n8n chỉ được mô tả là đã triển khai khi có workflow export hoặc bằng chứng cấu hình tương ứng.

## 1. Mục đích

AI Assistant trong khu vực Admin được thiết kế để hỗ trợ các công việc Marketing của GIAO THỜI: nghiên cứu khách hàng, phát triển ý tưởng, tư vấn thương hiệu, lập kế hoạch nội dung và hỗ trợ phân tích khi có dữ liệu phù hợp.

Tài liệu này phân biệt ba lớp:

1. **Frontend và API trong Git:** có thể kiểm tra trực tiếp qua mã nguồn.
2. **Marketing Skills và Brand/Product Context:** tài liệu hướng dẫn, bối cảnh chuyên môn được lưu trong repository.
3. **Workflow, model, system prompt, memory và tools trong n8n:** cần kiểm tra trực tiếp trên instance n8n hoặc có workflow export để xác nhận.

## 2. Luồng xử lý có thể xác minh trong mã nguồn

```text
Admin
  |
  v
src/admin/pages/AIAssistant.tsx
  |
  | POST /api/n8n/giaothoi-ai-assistant
  | JSON: { messages: [...] }
  v
api/n8n/[route].ts
  |
  | Xác thực Supabase + kiểm tra role
  | Chuyển tiếp request đến webhook
  v
N8N_BASE_URL/webhook/giaothoi-ai-assistant
  |
  | X-GIAO-THOI-KEY
  v
n8n workflow (cấu hình bên ngoài repository)
  |
  v
JSON response: { success, content/message }
  |
  v
AIAssistant.tsx hiển thị câu trả lời
```

### 2.1. Frontend

File: `src/admin/pages/AIAssistant.tsx`

Những điểm xác minh được:

- Giao diện gửi request bằng phương thức `POST` đến `/api/n8n/giaothoi-ai-assistant`.
- Request body có cấu trúc `{ messages: [...] }`.
- Frontend gửi tối đa 12 tin nhắn gần nhất trong phiên hiện tại.
- Mỗi message có `role` là `user` hoặc `assistant`, cùng trường `content`.
- Frontend đọc câu trả lời từ `result.content` hoặc `result.message`; yêu cầu `result.success` là truthy và nội dung không rỗng.
- Đoạn component hiện tại giữ hội thoại bằng React state; không có bằng chứng trong component này về việc lưu lịch sử chat lâu dài.

### 2.2. API trung gian

File: `api/n8n/[route].ts`

Đối với route `giaothoi-ai-assistant`:

- Phương thức được chấp nhận: `POST`.
- Webhook đích: `/webhook/giaothoi-ai-assistant`.
- API gọi `authenticateRequest` trước khi chuyển tiếp request.
- Route này không có cấu hình role riêng trong `roleMap`; do đó áp dụng nhóm role mặc định: `admin`, `creator`, `approver`, `publisher`.
- API gửi header `X-GIAO-THOI-KEY` đến n8n, lấy giá trị từ biến môi trường `N8N_WEBHOOK_KEY`.
- URL n8n lấy từ `N8N_BASE_URL`.
- API chuyển tiếp body JSON và trả lại nội dung phản hồi từ webhook.

API trung gian không chứa nội dung system prompt và không tự định nghĩa model AI. Nó đóng vai trò xác thực, định tuyến và chuyển tiếp request.

## 3. Marketing Knowledge trong repository

### 3.1. Brand Knowledge

- File: `docs/brand-knowledge.md`
- Vai trò: thông tin nền tảng về thương hiệu GIAO THỜI.
- Cần được xem là nguồn thông tin thương hiệu khi xây dựng nội dung và đề xuất Marketing.

### 3.2. Product Marketing Context

- File: `docs/docs/marketing-skills/product-marketing-context.md`
- Phiên bản ghi trong tài liệu: `1.0 – Draft`.
- Nội dung gồm mô hình kinh doanh, định hướng thương hiệu, nhóm khách hàng, nhu cầu và rào cản, giá trị cung cấp, định hướng nội dung, brand voice, kênh, mục tiêu và nguyên tắc sử dụng dữ liệu.
- Tài liệu tự ghi nhận một số thông tin còn thiếu, ví dụ chính sách giao hàng/đổi trả, quy trình đơn hàng, nguồn cung và bằng chứng sản phẩm, đối thủ, ngân sách và trạng thái tracking.

Không được coi nội dung được đánh dấu là giả thuyết hoặc chưa xác nhận thành dữ kiện thực tế.

### 3.3. Marketing Skills hiện có

Repository hiện có 6 thư mục Skill:

| Skill | Phạm vi |
|---|---|
| `content-strategy` | Chiến lược nội dung, content pillars, topic clusters và ưu tiên chủ đề |
| `social-content` | Lập kế hoạch, sáng tạo, tái sử dụng và tối ưu nội dung mạng xã hội |
| `copywriting` | Nội dung website, landing page, trang sản phẩm, headline và CTA |
| `marketing-ideas` | Phát triển, đánh giá và lựa chọn ý tưởng Marketing |
| `campaign-planning` | Campaign brief, mục tiêu, audience, channel, content plan, timeline, ngân sách và đo lường |
| `analytics-tracking` | Tracking plan, GA4, GTM, UTM, kiểm tra dữ liệu và nguyên tắc privacy |

Một số Skill có tài liệu tham khảo bổ sung:

- `analytics-tracking/references/`: GA4 implementation, GTM implementation, event library.
- `copywriting/references/`: copy frameworks, natural transitions.
- `marketing-ideas/references/`: ideas by category.
- `social-content/references/`: platforms, post templates, reverse engineering.

**Lưu ý về trạng thái:** các file trên chứng minh Skill đã được biên soạn và lưu trong Git. Chúng không tự chứng minh n8n đã nạp các file này vào AI Agent ở runtime. Cần kiểm tra node/workflow thực tế để xác nhận cơ chế đọc file, chọn Skill và truyền nội dung Skill vào model.

## 4. Những route n8n khác được khai báo trong API

File `api/n8n/[route].ts` còn khai báo các route sau:

| Route frontend | Webhook path | Method |
|---|---|---|
| `giaothoi-dashboard` | `/webhook/giaothoi-dashboard` | GET |
| `giaothoi-ai-assistant` | `/webhook/giaothoi-ai-assistant` | POST |
| `giaothoi-content-studio` | `/webhook/giaothoi-content-studio` | POST |
| `giaothoi-campaign-planner` | `/webhook/giaothoi-campaign-planner` | POST |
| `giaothoi-analytics` | `/webhook/giaothoi-analytics` | POST |
| `giaothoi-marketing-insights` | `/webhook/giaothoi-marketing-insights` | POST |
| `giaothoi-content-library` | `/webhook/giaothoi-content-library` | GET |
| `giaothoi-content-library-save` | `/webhook/giaothoi-content-library-save` | POST |
| `giaothoi-content-approval` | `/webhook/giaothoi-content-approval` | POST |
| `giaothoi-automation-workflows` | `/webhook/giaothoi-automation-workflows` | GET |
| `giaothoi-automation-executions` | `/webhook/giaothoi-automation-executions` | GET |
| `giaothoi-schedules` | `/webhook/giaothoi-schedules` | GET |
| `giaothoi-automation-control` | `/webhook/giaothoi-automation-control` | POST |
| `giaothoi-automation-run` | `/webhook/giaothoi-automation-run` | POST |

Đây là danh sách route được khai báo trong API proxy, không phải danh sách workflow đã được xác minh đang active trong n8n.

## 5. Model, System Prompt, Memory và Tools: trạng thái xác minh

Trong nhánh repository được rà soát, không tìm thấy file export workflow n8n hoặc file cấu hình riêng chứa system prompt của webhook `giaothoi-ai-assistant`.

Vì vậy, hiện chưa đủ căn cứ để ghi cụ thể:

- Model/provider và phiên bản model thực tế đang chạy.
- Nội dung system prompt đang được dùng trong workflow.
- Agent node hay chain/node AI nào đang xử lý request.
- Memory có được bật hay không; nếu có thì loại memory, session key và thời gian lưu.
- Các tools/sub-workflows được gắn vào AI Agent.
- Cách Brand Knowledge, Product Data và từng Marketing Skill được truy xuất trong lúc trả lời.
- GA4 Data API hoặc các nguồn dữ liệu khác có thực sự được gắn làm tool của AI Assistant hay không.
- Cơ chế duyệt của con người trước các hành động có tác động ra bên ngoài.

Mã nguồn có dependency `@google/genai`, và Skills có nhắc đến GA4 Data API; riêng hai chi tiết này không đủ chứng minh model hoặc công cụ tương ứng đang được dùng trong workflow AI Assistant.

## 6. Quy tắc nghiệp vụ và dữ liệu cần giữ

Khi hoàn thiện system prompt và tool descriptions, cần giữ các nguyên tắc đã có trong Brand Knowledge và Marketing Skills:

- GIAO THỜI là đơn vị phân phối/giới thiệu sản phẩm, không tự nhận là nhà sản xuất nếu không có bằng chứng.
- Không tự tạo nguồn gốc, chất liệu, kỹ thuật, giá bán, tồn kho, khuyến mãi, phản hồi khách hàng hoặc số liệu hiệu quả.
- Phân biệt dữ liệu đã xác minh, nhận định và giả thuyết.
- Khi thiếu dữ liệu, nói rõ giới hạn và đề xuất cách kiểm chứng.
- Không coi traffic hoặc tương tác là doanh thu nếu không có dữ liệu chuyển đổi phù hợp.
- Không tự đăng nội dung, gửi tin nhắn, chạy quảng cáo hoặc sử dụng ngân sách khi chưa có phê duyệt của con người.
- Nội dung social cần tuân thủ quy tắc nền tảng và quy trình media của GIAO THỜI. Một bài Facebook chỉ chứa album nhiều ảnh hoặc một video riêng; không gộp ảnh và video trong cùng một bài, cũng không tự tách thành hai bài.

## 7. Việc cần làm để hoàn thiện tài liệu và khả năng tái lập

| Ưu tiên | Việc cần bổ sung | Lý do |
|---|---|---|
| P0 | Export workflow n8n của `giaothoi-ai-assistant` và lưu bản đã loại bỏ credential/secret | Xác minh cấu trúc node, prompt, model, memory và tools |
| P0 | Ghi lại system prompt đang chạy và phiên bản/ngày cập nhật | Có thể kiểm tra, review và khôi phục thay đổi |
| P0 | Ghi rõ tool list, tool descriptions, input/output và quyền truy cập | Tránh Agent gọi sai hoặc tưởng có dữ liệu/công cụ không tồn tại |
| P1 | Xác minh cách nạp Brand Knowledge, Product Data và Skills | Đảm bảo tài liệu trong Git thực sự được dùng ở runtime |
| P1 | Xác minh GA4 Data API, phạm vi property, dimensions/metrics và quyền đọc | Tránh tuyên bố phân tích dữ liệu khi chưa có kết nối |
| P1 | Kiểm tra memory/session handling và giới hạn lịch sử hội thoại | Đảm bảo hội thoại đúng ngữ cảnh và không lẫn phiên |
| P1 | Xây dựng bộ test cho các tình huống đúng/sai dữ liệu và hành động cần phê duyệt | Đánh giá chất lượng và giới hạn Agent |
| P2 | Quản lý workflow export và prompt theo phiên bản trong Git | Tăng khả năng bàn giao và tái lập |

### Checklist kiểm thử tối thiểu

- [ ] Người dùng chưa đăng nhập không gọi được API.
- [ ] Role hợp lệ gọi được AI Assistant; role không hợp lệ bị từ chối.
- [ ] API trả lỗi rõ ràng khi thiếu cấu hình n8n hoặc n8n không truy cập được.
- [ ] AI không tự bịa giá, tồn kho, nguồn gốc hay số liệu.
- [ ] AI nói rõ khi không có dữ liệu GA4 hoặc Product Data cần thiết.
- [ ] AI phân biệt giả thuyết insight với insight đã có bằng chứng.
- [ ] AI không tự đăng bài, nhắn khách hoặc chạy quảng cáo khi chưa được duyệt.
- [ ] Lịch sử hội thoại không bị trộn giữa các người dùng/phiên.
- [ ] Các Skill phù hợp được tham chiếu đúng với từng nhiệm vụ.

## 8. Nguồn trong repository

- `src/admin/pages/AIAssistant.tsx`
- `api/n8n/[route].ts`
- `docs/brand-knowledge.md`
- `docs/docs/marketing-skills/README.md`
- `docs/docs/marketing-skills/product-marketing-context.md`
- `docs/docs/marketing-skills/skills/`

## 9. Tài liệu tham khảo kỹ thuật bên ngoài

Các tài liệu n8n dưới đây chỉ được dùng làm hướng dẫn thiết kế/đối chiếu, không phải bằng chứng cấu hình hiện tại của GIAO THỜI:

- [n8n – Build and manage agents](https://docs.n8n.io/advanced-ai/intro-tutorial/)
- [n8n – AI Agent node](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)
- [n8n – AI Agent Tool node](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolaiagent/)
