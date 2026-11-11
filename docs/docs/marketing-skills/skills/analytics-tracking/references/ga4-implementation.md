# GA4 Implementation – Hướng dẫn triển khai Google Analytics 4

Tài liệu này hướng dẫn cấu hình, triển khai và kiểm tra Google Analytics 4 (GA4), từ thiết lập cơ bản đến theo dõi sự kiện, chuyển đổi và chất lượng dữ liệu.

## 1. Cấu hình GA4 cơ bản

### 1.1. Data Stream

Data Stream là nguồn dữ liệu được kết nối với GA4 Property.

Thông thường:
- Website sử dụng Web Data Stream.
- Ứng dụng Android sử dụng Android Data Stream.
- Ứng dụng iOS sử dụng iOS Data Stream.

Mỗi nền tảng cần được cấu hình phù hợp với cách thu thập dữ liệu.

### 1.2. Enhanced Measurement

Enhanced Measurement hỗ trợ tự động ghi nhận một số hành vi phổ biến trên website mà không cần triển khai riêng từng sự kiện.

| Sự kiện | Ý nghĩa | Cách ghi nhận |
|---|---|---|
| page_view | Xem trang | Tự động |
| scroll | Cuộn trang đến ngưỡng nhất định | Tự động |
| click | Nhấn liên kết ra ngoài | Tự động |
| site_search | Tìm kiếm trên website | Cần cấu hình tham số tìm kiếm phù hợp |
| video_engagement | Tương tác video YouTube nhúng | Tự động khi đáp ứng điều kiện |
| file_download | Tải tệp | Tự động với định dạng được hỗ trợ |

Lưu ý:
- Enhanced Measurement không thay thế toàn bộ Custom Events.
- Không mặc định rằng mọi nút bấm hoặc hành động trên website đều được ghi nhận.
- Cần kiểm tra cấu hình và dữ liệu thực tế trước khi kết luận một sự kiện đang hoạt động.

### 1.3. Data Retention

Data Retention là thời gian lưu trữ dữ liệu sự kiện và dữ liệu người dùng ở cấp độ có thể sử dụng trong một số báo cáo khám phá.

Cần kiểm tra cấu hình lưu trữ trong GA4 Admin và lựa chọn thời gian phù hợp với nhu cầu phân tích, chính sách dữ liệu và điều kiện áp dụng.

Không nhầm lẫn thời gian lưu trữ này với thời gian dữ liệu vẫn tồn tại trong các báo cáo tổng hợp chuẩn của GA4.

## 2. Các sự kiện được GA4 khuyến nghị

Ưu tiên sử dụng các tên sự kiện chuẩn khi phù hợp với hành vi cần đo lường.

### 2.1. Sự kiện phổ biến

| Event | Ý nghĩa |
|---|---|
| login | Đăng nhập |
| sign_up | Đăng ký |
| search | Tìm kiếm |
| share | Chia sẻ |

### 2.2. Sự kiện thương mại điện tử

| Event | Ý nghĩa |
|---|---|
| view_item | Xem chi tiết sản phẩm |
| view_item_list | Xem danh sách sản phẩm |
| add_to_cart | Thêm sản phẩm vào giỏ |
| remove_from_cart | Xóa sản phẩm khỏi giỏ |
| begin_checkout | Bắt đầu thanh toán |
| add_payment_info | Nhập thông tin thanh toán |
| purchase | Hoàn tất mua hàng |
| refund | Hoàn tiền |

Việc sử dụng tên sự kiện chuẩn giúp tận dụng các báo cáo và chức năng phân tích tương ứng của GA4.

## 3. Custom Events – Sự kiện tùy chỉnh

Khi hành động cần đo lường không có sự kiện chuẩn phù hợp, có thể triển khai Custom Event.

### 3.1. Sử dụng gtag.js

Ví dụ ghi nhận người dùng gửi biểu mẫu:

```javascript
gtag('event', 'form_submitted', {
  form_name: 'contact',
  form_location: 'footer'
});
```

Ví dụ ghi nhận giao dịch:

```javascript
gtag('event', 'purchase', {
  transaction_id: 'T12345',
  value: 990000,
  currency: 'VND',
  items: [{
    item_id: 'SKU123',
    item_name: 'Product Name',
    price: 990000,
    quantity: 1
  }]
});
```

Các giá trị trong ví dụ chỉ mang tính minh họa. Khi triển khai thực tế, cần lấy dữ liệu từ giao dịch thật và đảm bảo `transaction_id` có tính duy nhất.

### 3.2. User Properties

User Properties giúp phân loại người dùng theo các đặc điểm phù hợp.

Ví dụ:

```javascript
gtag('set', 'user_properties', {
  user_type: 'customer'
});
```

Chỉ sử dụng những thuộc tính có căn cứ và phù hợp với chính sách quyền riêng tư.

### 3.3. User ID

Đối với website hoặc ứng dụng có đăng nhập, có thể sử dụng User ID để hỗ trợ phân tích hành vi của cùng một người dùng trên các phiên hoặc thiết bị.

Không tự tạo User ID từ email, số điện thoại hoặc thông tin cá nhân nhạy cảm.

## 4. Key Events – Đo lường chuyển đổi

Key Events là các sự kiện quan trọng mà doanh nghiệp muốn sử dụng để đánh giá kết quả kinh doanh hoặc Marketing.

### 4.1. Quy trình thiết lập

1. Xác định hành động thực sự có ý nghĩa đối với doanh nghiệp.
2. Đảm bảo sự kiện đã được ghi nhận chính xác.
3. Vào GA4 Admin hoặc khu vực quản lý Events.
4. Đánh dấu sự kiện phù hợp thành Key Event.
5. Kiểm tra sự kiện xuất hiện trong báo cáo.

Tên giao diện và vị trí thao tác có thể thay đổi theo phiên bản GA4.

### 4.2. Counting Method

Cần lựa chọn cách đếm phù hợp với mục tiêu:

- Once per event: Ghi nhận mỗi lần sự kiện xảy ra.
- Once per session: Ghi nhận tối đa một lần trong mỗi phiên.

Ví dụ:
- Hành vi mua hàng thường cần ghi nhận từng giao dịch hợp lệ.
- Hành vi gửi yêu cầu tư vấn có thể cần giới hạn số lần tính chuyển đổi trong một phiên, tùy cách doanh nghiệp định nghĩa lead.

Không lựa chọn phương pháp đếm chỉ vì muốn số chuyển đổi cao hơn.

### 4.3. Conversion Value

Đối với sự kiện có giá trị tiền tệ, nên truyền giá trị và đơn vị tiền tệ chính xác.

Ví dụ:

```javascript
gtag('event', 'purchase', {
  value: 1500000,
  currency: 'VND',
  transaction_id: 'ORDER123'
});
```

Không tự gán giá trị doanh thu cho một sự kiện chỉ mang tính tương tác như `cta_clicked`.

## 5. Custom Dimensions và Custom Metrics

### 5.1. Custom Dimensions

Dùng để phân loại và lọc dữ liệu theo các thuộc tính không có sẵn trong báo cáo chuẩn.

Ví dụ:
- Loại nội dung.
- Danh mục sản phẩm.
- Nhóm khách hàng.
- Vị trí CTA.

### 5.2. Custom Metrics

Dùng để tổng hợp các giá trị dạng số, ví dụ:
- Số lượng sản phẩm.
- Điểm đánh giá.
- Thời lượng tùy chỉnh.

### 5.3. Các bước cấu hình

1. Mở GA4 Admin.
2. Tìm Custom Definitions.
3. Chọn tạo Custom Dimension hoặc Custom Metric.
4. Xác định Scope.
5. Nhập tên và Event Parameter tương ứng.
6. Lưu và chờ dữ liệu được xử lý.

Các Scope thường gặp:

| Scope | Phạm vi |
|---|---|
| Event | Gắn với từng sự kiện |
| User | Gắn với người dùng |
| Item | Gắn với từng sản phẩm trong sự kiện thương mại điện tử |

Tên Parameter trong GA4 phải khớp với Parameter được gửi từ website hoặc GTM.

## 6. Audiences – Phân khúc đối tượng

Audiences cho phép tạo nhóm người dùng dựa trên hành vi và thuộc tính.

Ví dụ:

### 6.1. Nhóm có ý định mua cao

Điều kiện tham khảo:
- Đã xem trang sản phẩm hoặc trang giá.
- Có tương tác với CTA.
- Chưa phát sinh chuyển đổi.

### 6.2. Nhóm người dùng tương tác tích cực

Điều kiện tham khảo:
- Có nhiều phiên truy cập.
- Có thời gian tương tác đáng kể.
- Có thực hiện các hành động quan trọng.

### 6.3. Nhóm khách hàng đã mua

Điều kiện:
- Có sự kiện `purchase` hợp lệ.

Có thể sử dụng Audience cho phân tích phân khúc hoặc hoạt động tiếp thị lại khi đáp ứng điều kiện về dữ liệu và sự đồng ý của người dùng.

## 7. Debugging – Kiểm tra sự kiện

### 7.1. DebugView

DebugView hỗ trợ theo dõi sự kiện của thiết bị đang ở chế độ gỡ lỗi.

Có thể bật chế độ debug thông qua các công cụ phù hợp, ví dụ Google Tag Manager Preview hoặc cấu hình debug trên Google tag.

### 7.2. Realtime

Realtime giúp kiểm tra các hoạt động gần thời gian thực.

Sử dụng để xác nhận:
- Website đã gửi dữ liệu chưa.
- Sự kiện có xuất hiện không.
- Một số thuộc tính có được ghi nhận không.

Không nên dùng Realtime để thay thế việc kiểm tra dữ liệu đã xử lý trong các báo cáo dài hạn.

### 7.3. Các lỗi phổ biến

| Vấn đề | Nguyên nhân cần kiểm tra |
|---|---|
| Không thấy sự kiện | Tag chưa chạy hoặc sự kiện chưa được gửi |
| Thiếu Parameter | Sai tên hoặc chưa đăng ký Custom Definition |
| Sự kiện trùng | Nhiều nguồn tracking cùng gửi một sự kiện |
| Chưa thấy dữ liệu báo cáo | Dữ liệu chưa được xử lý hoặc bộ lọc đang ảnh hưởng |
| Không có Key Event | Chưa đánh dấu hoặc sự kiện chưa phát sinh |

## 8. Data Quality – Chất lượng dữ liệu

### 8.1. Internal Traffic

Traffic nội bộ có thể làm sai lệch số liệu về người dùng và mức độ tương tác.

Có thể thiết lập bộ lọc Internal Traffic trong GA4 để nhận diện hoặc loại trừ dữ liệu nội bộ phù hợp.

Cần kiểm tra bộ lọc trước khi kích hoạt để tránh loại nhầm dữ liệu thật.

### 8.2. Cross-domain Tracking

Nếu khách hàng chuyển giữa nhiều domain thuộc cùng một hành trình, cần đánh giá nhu cầu cấu hình Cross-domain Tracking.

Mục tiêu là hạn chế việc một hành trình bị chia thành nhiều phiên hoặc ghi nhận sai nguồn truy cập.

### 8.3. Session Settings

Cần hiểu các cấu hình liên quan đến:
- Thời gian chờ của phiên.
- Điều kiện xác định phiên tương tác.
- Cách GA4 phân loại phiên và nguồn truy cập.

Không thay đổi cấu hình nếu chưa xác định được vấn đề dữ liệu cần giải quyết.

## 9. Tích hợp Google Ads

### 9.1. Liên kết tài khoản

Khi doanh nghiệp sử dụng Google Ads, có thể liên kết tài khoản với GA4 để hỗ trợ chia sẻ dữ liệu và phân tích hiệu quả quảng cáo.

### 9.2. Conversion Import

Các Key Events phù hợp có thể được sử dụng làm cơ sở thiết lập chuyển đổi trong Google Ads.

Cần kiểm tra:
- Sự kiện đã được ghi nhận chính xác.
- Giá trị chuyển đổi phù hợp.
- Không bị đếm trùng với một hành động đã được thiết lập theo cách khác.
- Cài đặt attribution phù hợp.

### 9.3. Audience

Có thể sử dụng Audience từ GA4 cho các hoạt động tiếp thị lại khi đáp ứng yêu cầu về quyền riêng tư, điều kiện tài khoản và nền tảng quảng cáo.

## 10. Quy trình triển khai GA4

1. Xác định mục tiêu kinh doanh và câu hỏi đo lường.
2. Kiểm tra GA4 Property và Data Stream.
3. Kiểm tra Google tag hoặc GTM.
4. Xây dựng Tracking Plan.
5. Triển khai hoặc cấu hình các sự kiện.
6. Kiểm tra bằng DebugView và Realtime.
7. Đánh dấu Key Events.
8. Cấu hình Custom Dimensions khi cần.
9. Kiểm tra chất lượng dữ liệu.
10. Theo dõi và cập nhật định kỳ.

## 11. Lưu ý cho Agent

- Phân biệt dữ liệu đang được thu thập với dữ liệu đã được xử lý.
- Không khẳng định một sự kiện hoạt động chỉ vì sự kiện đó có trong Tracking Plan.
- Không khẳng định đã có chuyển đổi nếu chưa kiểm tra dữ liệu.
- Không tự tạo số liệu hoặc giả định về doanh thu.
- Không đề xuất thay đổi cấu hình GA4 khi chưa hiểu tác động.
- Nếu không có quyền truy cập GA4 Admin, chỉ hướng dẫn thao tác và nêu rõ giới hạn.
- Khi sử dụng GA4 Data API, phải phân biệt Metric, Dimension, Event và Key Event.
- Nếu API không trả về dữ liệu, cần kiểm tra phạm vi ngày, bộ lọc, tên Metric/Dimension và tình trạng tracking trước khi kết luận.
