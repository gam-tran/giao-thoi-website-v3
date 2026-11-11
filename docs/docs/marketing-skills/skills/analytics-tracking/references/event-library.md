# Event Library – Thư viện sự kiện Tracking

Tài liệu này tổng hợp các sự kiện có thể sử dụng khi xây dựng hệ thống đo lường Marketing và hành vi người dùng.

Đây là thư viện tham khảo, không phải danh sách bắt buộc phải triển khai toàn bộ. Chỉ lựa chọn những sự kiện phù hợp với mô hình kinh doanh, hành trình khách hàng và mục tiêu đo lường.

## 1. Marketing Website – Website Marketing

### 1.1. Điều hướng và tương tác

| Event Name | Mô tả | Properties |
|---|---|---|
| page_view | Người dùng xem trang | page_title, page_location |
| scroll_depth | Người dùng cuộn đến một ngưỡng nhất định | depth |
| outbound_link_clicked | Nhấn vào liên kết dẫn ra website khác | link_url, link_text |
| internal_link_clicked | Nhấn vào liên kết nội bộ | link_url, link_text, location |
| video_played | Bắt đầu xem video | video_id, video_title |
| video_completed | Xem hết video | video_id, video_title |

### 1.2. CTA và biểu mẫu

| Event Name | Mô tả | Properties |
|---|---|---|
| cta_clicked | Nhấn vào nút kêu gọi hành động | button_text, cta_location, page |
| form_started | Bắt đầu điền biểu mẫu | form_name, form_location |
| form_field_completed | Hoàn thành một trường thông tin | form_name, field_name |
| form_submitted | Gửi biểu mẫu thành công | form_name, form_location |
| form_error | Biểu mẫu gặp lỗi xác thực | form_name, error_type |
| resource_downloaded | Tải tài liệu | resource_name, resource_type |

### 1.3. Chuyển đổi

| Event Name | Mô tả | Properties |
|---|---|---|
| signup_started | Bắt đầu đăng ký | source, page |
| signup_completed | Hoàn tất đăng ký | method, plan, source |
| demo_requested | Gửi yêu cầu dùng thử hoặc tư vấn | company_size, industry |
| contact_submitted | Gửi yêu cầu liên hệ | inquiry_type |
| newsletter_subscribed | Đăng ký nhận email | source, list_name |
| trial_started | Bắt đầu dùng thử | plan, source |

## 2. Product/App – Website hoặc ứng dụng sản phẩm

### 2.1. Onboarding

| Event Name | Mô tả | Properties |
|---|---|---|
| signup_completed | Tạo tài khoản thành công | method, referral_source |
| onboarding_started | Bắt đầu quy trình làm quen | - |
| onboarding_step_completed | Hoàn thành một bước | step_number, step_name |
| onboarding_completed | Hoàn thành onboarding | steps_completed, time_to_complete |
| onboarding_skipped | Bỏ qua một bước | step_skipped_at |
| first_key_action_completed | Hoàn thành hành động quan trọng đầu tiên | action_type |

### 2.2. Sử dụng sản phẩm

| Event Name | Mô tả | Properties |
|---|---|---|
| session_started | Bắt đầu phiên sử dụng | session_number |
| feature_used | Sử dụng một tính năng | feature_name, feature_category |
| action_completed | Hoàn thành hành động chính | action_type, count |
| content_created | Tạo nội dung | content_type |
| content_edited | Chỉnh sửa nội dung | content_type |
| content_deleted | Xóa nội dung | content_type |
| search_performed | Thực hiện tìm kiếm | query, results_count |
| settings_changed | Thay đổi cài đặt | setting_name, new_value |

### 2.3. Lỗi và hỗ trợ

| Event Name | Mô tả | Properties |
|---|---|---|
| error_occurred | Xảy ra lỗi | error_type, page |
| help_opened | Mở khu vực trợ giúp | help_type, page |
| support_contacted | Liên hệ bộ phận hỗ trợ | contact_method, issue_type |
| feedback_submitted | Gửi phản hồi | feedback_type, rating |

## 3. Monetization – Doanh thu và thanh toán

### 3.1. Giá và thanh toán

| Event Name | Mô tả | Properties |
|---|---|---|
| pricing_viewed | Xem trang giá | source |
| plan_selected | Chọn gói dịch vụ | plan_name, billing_cycle |
| checkout_started | Bắt đầu thanh toán | plan, value |
| payment_info_entered | Nhập thông tin thanh toán | payment_method |
| purchase_completed | Thanh toán thành công | transaction_id, value, currency |
| purchase_failed | Thanh toán thất bại | error_reason, plan |

### 3.2. Quản lý đăng ký

| Event Name | Mô tả | Properties |
|---|---|---|
| trial_started | Bắt đầu dùng thử | plan, trial_length |
| trial_ended | Kết thúc thời gian dùng thử | plan, converted |
| subscription_upgraded | Nâng cấp gói | from_plan, to_plan, value |
| subscription_downgraded | Hạ cấp gói | from_plan, to_plan |
| subscription_cancelled | Hủy đăng ký | plan, reason, tenure |
| subscription_renewed | Gia hạn đăng ký | plan, value |

Nhóm sự kiện này phù hợp với mô hình kinh doanh có gói đăng ký hoặc thanh toán định kỳ. Không áp dụng máy móc cho doanh nghiệp bán hàng thông thường.

## 4. E-commerce – Thương mại điện tử

### 4.1. Hành vi duyệt sản phẩm

| Event Name | Mô tả | Properties |
|---|---|---|
| view_item | Xem chi tiết sản phẩm | item_id, item_name, item_category, price |
| view_item_list | Xem danh sách sản phẩm | item_list_name, items |
| search | Tìm kiếm sản phẩm | search_term |
| product_filtered | Lọc sản phẩm | filter_type, filter_value |
| product_sorted | Sắp xếp sản phẩm | sort_by, sort_order |

### 4.2. Giỏ hàng

| Event Name | Mô tả | Properties |
|---|---|---|
| add_to_cart | Thêm sản phẩm vào giỏ hàng | item_id, item_name, price, quantity |
| remove_from_cart | Xóa sản phẩm khỏi giỏ hàng | item_id, item_name, price, quantity |
| view_cart | Xem giỏ hàng | value, items |

### 4.3. Thanh toán

| Event Name | Mô tả | Properties |
|---|---|---|
| begin_checkout | Bắt đầu thanh toán | value, items |
| checkout_step_completed | Hoàn thành một bước thanh toán | step_number, step_name |
| add_shipping_info | Nhập thông tin giao hàng | shipping_method |
| add_payment_info | Nhập thông tin thanh toán | payment_type |
| purchase | Hoàn tất đơn hàng | transaction_id, value, currency, items |

### 4.4. Sau mua hàng

| Event Name | Mô tả | Properties |
|---|---|---|
| order_confirmed | Xem xác nhận đơn hàng | transaction_id |
| refund_requested | Yêu cầu hoàn tiền | transaction_id, reason |
| refund_completed | Hoàn tiền thành công | transaction_id, value |
| review_submitted | Gửi đánh giá sản phẩm | item_id, rating |

**Lưu ý:** Với GA4, nên ưu tiên tên sự kiện thương mại điện tử được Google khuyến nghị như `view_item`, `add_to_cart`, `begin_checkout` và `purchase` thay vì tự tạo tên không thống nhất.

## 5. B2B và SaaS – Doanh nghiệp và phần mềm dịch vụ

### 5.1. Nhóm và cộng tác

| Event Name | Mô tả | Properties |
|---|---|---|
| team_created | Tạo nhóm mới | team_size, plan |
| team_member_invited | Mời thành viên | role, invite_method |
| team_member_joined | Thành viên tham gia | role |
| team_member_removed | Xóa thành viên | role |
| role_changed | Thay đổi quyền thành viên | old_role, new_role |

### 5.2. Tích hợp

| Event Name | Mô tả | Properties |
|---|---|---|
| integration_viewed | Xem trang tích hợp | integration_name |
| integration_started | Bắt đầu thiết lập tích hợp | integration_name |
| integration_connected | Kết nối thành công | integration_name |
| integration_disconnected | Ngắt kết nối | integration_name, reason |

### 5.3. Tài khoản

| Event Name | Mô tả | Properties |
|---|---|---|
| account_created | Tạo tài khoản | source, plan |
| account_upgraded | Nâng cấp tài khoản | from_plan, to_plan |
| account_churned | Khách hàng rời bỏ | reason, tenure |
| account_reactivated | Khách hàng quay lại | previous_tenure, new_plan |

## 6. Các thuộc tính sự kiện phổ biến

### 6.1. Người dùng

| Property | Ý nghĩa |
|---|---|
| user_id | Mã định danh người dùng |
| user_type | Nhóm người dùng |
| account_id | Mã tài khoản |
| plan_type | Loại gói dịch vụ |

### 6.2. Phiên truy cập

| Property | Ý nghĩa |
|---|---|
| session_id | Mã phiên |
| session_number | Số thứ tự phiên |
| page | Trang đang truy cập |
| referrer | Nguồn giới thiệu |

### 6.3. Chiến dịch

| Property | Ý nghĩa |
|---|---|
| source | Nguồn truy cập |
| medium | Phương tiện Marketing |
| campaign | Tên chiến dịch |
| content | Nội dung hoặc phiên bản quảng cáo |
| term | Từ khóa |

### 6.4. Sản phẩm

| Property | Ý nghĩa |
|---|---|
| item_id | Mã sản phẩm |
| item_name | Tên sản phẩm |
| item_category | Danh mục |
| price | Giá |
| quantity | Số lượng |
| currency | Đơn vị tiền tệ |

## 7. Xây dựng Funnel từ các sự kiện

Funnel giúp theo dõi hành trình người dùng qua nhiều bước và xác định điểm có thể xảy ra tình trạng rời bỏ.

### 7.1. Funnel đăng ký

1. signup_started
2. signup_step_completed
3. signup_completed
4. onboarding_started

### 7.2. Funnel mua hàng

1. view_item
2. add_to_cart
3. view_cart
4. begin_checkout
5. add_shipping_info
6. add_payment_info
7. purchase

### 7.3. Nguyên tắc phân tích Funnel

- Xác định rõ các bước trong hành trình.
- Đảm bảo từng sự kiện đại diện cho một hành động thực tế.
- Kiểm tra sự kiện có được ghi nhận đầy đủ không.
- Tính tỷ lệ chuyển tiếp giữa các bước.
- Xác định bước có tỷ lệ rời bỏ cao.
- Không kết luận nguyên nhân rời bỏ chỉ dựa trên tỷ lệ chuyển đổi; cần kiểm tra thêm trải nghiệm và bối cảnh.

## 8. Nguyên tắc lựa chọn sự kiện

Không triển khai toàn bộ sự kiện trong thư viện một cách máy móc.

Trước khi thêm một sự kiện, hãy trả lời:

1. Sự kiện này giúp trả lời câu hỏi kinh doanh nào?
2. Hành động nào thực sự kích hoạt sự kiện?
3. Có thể sử dụng sự kiện hiện có thay vì tạo sự kiện mới không?
4. Những thuộc tính nào thực sự cần thiết?
5. Có cách nào xác minh sự kiện hoạt động chính xác không?

Ưu tiên những sự kiện liên quan trực tiếp đến mục tiêu kinh doanh và hành trình khách hàng.

## 9. Lưu ý khi sử dụng với GIAO THỜI

Với website GIAO THỜI, có thể tham khảo các nhóm sự kiện:

| Nhóm mục tiêu | Sự kiện tham khảo |
|---|---|
| Truy cập website | page_view |
| Khám phá sản phẩm | view_item, view_item_list |
| Tương tác nội dung | scroll, outbound_click |
| Quan tâm sản phẩm | cta_clicked |
| Liên hệ tư vấn | form_started, form_submitted |
| Mua hàng | purchase |

Đây là danh sách đề xuất, không phải xác nhận rằng các sự kiện đã được triển khai.

Chỉ báo cáo sự kiện nào đã hoạt động khi có dữ liệu thực tế hoặc kết quả kiểm tra xác nhận.

Đặc biệt, nếu website chưa ghi nhận `add_to_cart` hoặc `purchase`, không được tự tạo số liệu để lấp khoảng trống trong báo cáo.
