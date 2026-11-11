# Google Tag Manager Implementation – Hướng dẫn triển khai GTM

Tài liệu này hướng dẫn cách tổ chức và quản lý Google Tag Manager (GTM), bao gồm Tags, Triggers, Variables, Data Layer, kiểm tra và quản lý phiên bản.

GTM là công cụ quản lý thẻ tracking. GTM không tự động hiểu toàn bộ hành vi kinh doanh nếu website chưa cung cấp dữ liệu phù hợp.

## 1. Cấu trúc cơ bản của GTM

GTM gồm ba thành phần chính:

### 1.1. Tags

Tags là các đoạn mã hoặc cấu hình được thực thi khi điều kiện tương ứng được đáp ứng.

Một số loại Tag thường gặp:

| Tag | Mục đích |
|---|---|
| Google tag | Kết nối và cấu hình Google Analytics |
| GA4 Event | Gửi sự kiện đến GA4 |
| Google Ads Conversion | Ghi nhận chuyển đổi quảng cáo |
| Meta Pixel | Gửi dữ liệu đến Meta |
| Custom HTML | Chạy mã tùy chỉnh khi cần |

### 1.2. Triggers

Triggers xác định thời điểm một Tag được kích hoạt.

Một số loại Trigger phổ biến:

| Trigger | Mục đích |
|---|---|
| Page View | Khi trang được tải |
| DOM Ready | Khi DOM sẵn sàng |
| Window Loaded | Khi trang tải hoàn tất |
| Click – All Elements | Khi nhấn vào phần tử |
| Click – Just Links | Khi nhấn liên kết |
| Form Submission | Khi gửi biểu mẫu |
| Scroll Depth | Khi cuộn đến ngưỡng |
| Element Visibility | Khi phần tử xuất hiện trong vùng nhìn |
| Custom Event | Khi nhận được sự kiện từ Data Layer |

### 1.3. Variables

Variables lưu trữ hoặc lấy các giá trị động được sử dụng trong Tags và Triggers.

Một số Built-in Variables:
- Click Text.
- Click URL.
- Click ID.
- Click Classes.
- Page Path.
- Page URL.
- Page Hostname.
- Referrer.
- Form ID.

Một số User-defined Variables:
- Data Layer Variable.
- JavaScript Variable.
- Lookup Table.
- RegEx Table.
- Constant.

Chỉ bật những Variables thực sự cần thiết để tránh cấu hình quá phức tạp.

## 2. Quy tắc đặt tên

Nên sử dụng quy tắc thống nhất để dễ quản lý và tìm kiếm.

### 2.1. Tags

Cấu trúc:

`[Nền tảng] - [Loại] - [Sự kiện]`

Ví dụ:
- GA4 - Config - Base Configuration
- GA4 - Event - Form Submitted
- GA4 - Event - Purchase
- Meta - Pixel - Page View

### 2.2. Triggers

Ví dụ:
- Click - CTA Button
- Submit - Contact Form
- View - Product Page
- Custom - form_submitted

### 2.3. Variables

Ví dụ:
- DL - form_name
- DL - transaction_id
- Click - Text
- Page - URL

Tên gọi nên dễ hiểu, có tính nhất quán và mô tả đúng chức năng.

## 3. Data Layer – Lớp dữ liệu trung gian

Data Layer cho phép website truyền thông tin về hành vi và ngữ cảnh đến GTM.

### 3.1. Khởi tạo Data Layer

Ví dụ:

```javascript
window.dataLayer = window.dataLayer || [];
```

Thông thường, cần đảm bảo Data Layer được khởi tạo trước khi GTM xử lý các sự kiện cần thiết.

### 3.2. Gửi sự kiện tùy chỉnh

Ví dụ khi biểu mẫu được gửi thành công:

```javascript
dataLayer.push({
  event: 'form_submitted',
  form_name: 'contact',
  form_location: 'footer'
});
```

Lưu ý: Chỉ gửi sự kiện sau khi hệ thống xác nhận biểu mẫu đã gửi thành công, không chỉ dựa trên thao tác nhấn nút.

### 3.3. Gửi dữ liệu trang

Ví dụ:

```javascript
dataLayer.push({
  page_type: 'product',
  content_group: 'products'
});
```

Có thể bổ sung dữ liệu phù hợp với cấu trúc website, nhưng không đưa thông tin cá nhân nhạy cảm vào Data Layer.

### 3.4. Gửi dữ liệu thương mại điện tử

Ví dụ xem sản phẩm:

```javascript
dataLayer.push({ ecommerce: null });

dataLayer.push({
  event: 'view_item',
  ecommerce: {
    items: [{
      item_id: 'SKU123',
      item_name: 'Product Name',
      price: 990000,
      item_category: 'Accessories',
      quantity: 1
    }]
  }
});
```

Ví dụ thêm vào giỏ hàng:

```javascript
dataLayer.push({ ecommerce: null });

dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    items: [{
      item_id: 'SKU123',
      item_name: 'Product Name',
      price: 990000,
      quantity: 1
    }]
  }
});
```

Ví dụ mua hàng:

```javascript
dataLayer.push({ ecommerce: null });

dataLayer.push({
  event: 'purchase',
  ecommerce: {
    transaction_id: 'ORDER123',
    value: 990000,
    currency: 'VND',
    items: [{
      item_id: 'SKU123',
      item_name: 'Product Name',
      price: 990000,
      quantity: 1
    }]
  }
});
```

Các giá trị chỉ mang tính minh họa. Khi triển khai thực tế, dữ liệu phải lấy từ hệ thống sản phẩm và đơn hàng.

## 4. Cấu hình GA4 trong GTM

### 4.1. Google tag

Mục tiêu: Kết nối website với GA4.

Cấu hình cần có:
- Tag Type: Google tag.
- Tag ID: Measurement ID của GA4.
- Trigger: All Pages hoặc điều kiện phù hợp.

Kiểm tra để tránh cài đặt Google tag nhiều lần trên cùng một trang.

### 4.2. GA4 Event Tag

Mục tiêu: Gửi sự kiện cụ thể đến GA4.

Cấu hình gồm:
- Tag Type: Google Analytics: GA4 Event hoặc loại Tag tương ứng trong giao diện hiện tại.
- Google tag: Chọn cấu hình Google tag đã thiết lập.
- Event Name: Tên sự kiện.
- Event Parameters: Các thuộc tính cần gửi.
- Trigger: Điều kiện kích hoạt.

Ví dụ:
- Event Name: `form_submitted`.
- Parameter: `form_name`.
- Value: Data Layer Variable tương ứng.
- Trigger: Custom Event `form_submitted`.

Giao diện GTM có thể thay đổi theo phiên bản. Cần sử dụng đúng loại Tag đang được hỗ trợ.

## 5. Triển khai Meta Pixel

GTM cũng có thể quản lý các thẻ quảng cáo và tiếp thị khác.

Ví dụ Meta Pixel Base Code:

```html
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

Đây là mã minh họa. Chỉ sử dụng Pixel ID hợp lệ của doanh nghiệp và triển khai theo tài liệu chính thức hiện hành.

Không cài đặt đồng thời nhiều bản Pixel Base Code gây ghi nhận trùng.

## 6. Preview và Debug

### 6.1. Preview Mode

Quy trình kiểm tra:

1. Mở GTM Container.
2. Chọn Preview.
3. Nhập địa chỉ website.
4. Kết nối website với Tag Assistant.
5. Thực hiện hành động cần kiểm tra.
6. Quan sát các sự kiện và Tags trong bảng debug.

### 6.2. Nội dung cần kiểm tra

- Tag nào đã được kích hoạt?
- Tag nào không được kích hoạt?
- Trigger có đáp ứng đúng điều kiện không?
- Variables có nhận đúng giá trị không?
- Data Layer có chứa dữ liệu mong muốn không?
- Có Tag nào bị kích hoạt nhiều lần không?

### 6.3. Xử lý lỗi phổ biến

| Vấn đề | Nguyên nhân cần kiểm tra |
|---|---|
| Tag không chạy | Trigger sai hoặc điều kiện chưa thỏa mãn |
| Variable sai giá trị | Sai đường dẫn hoặc kiểu dữ liệu |
| Data Layer thiếu dữ liệu | Website chưa gửi đúng thông tin |
| Tag chạy nhiều lần | Trigger trùng hoặc có nhiều container |
| Không thấy sự kiện trong GA4 | Kiểm tra Tag, Measurement ID và kết nối |

## 7. Workspaces và Version Management

### 7.1. Workspaces

Workspace giúp quản lý các thay đổi trong GTM.

Có thể sử dụng Workspace riêng cho:
- Các thay đổi nhỏ.
- Một chiến dịch tracking mới.
- Các cập nhật lớn cần kiểm tra trước khi xuất bản.

### 7.2. Version Management

Mỗi lần xuất bản nên có tên phiên bản và mô tả rõ thay đổi.

Ví dụ:

```text
Version 15: Added purchase tracking

- Added GA4 Event - Purchase
- Added Custom Event Trigger - purchase
- Added Variables - transaction_id, value
- Tested using GTM Preview
```

Không xuất bản thay đổi khi chưa kiểm tra các Tags và Triggers liên quan.

## 8. Consent Management – Quản lý sự đồng ý

Tracking cần tuân thủ các yêu cầu liên quan đến quyền riêng tư và sự đồng ý của người dùng.

### 8.1. Consent Mode

Ví dụ minh họa:

```javascript
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied'
});
```

Khi người dùng đồng ý, trạng thái có thể được cập nhật theo lựa chọn hợp lệ:

```javascript
gtag('consent', 'update', {
  analytics_storage: 'granted',
  ad_storage: 'granted'
});
```

Đây là ví dụ kỹ thuật, không phải cấu hình áp dụng mặc định cho mọi website.

Cần xác định:
- Quy định pháp lý áp dụng.
- Loại dữ liệu cần thu thập.
- Cơ chế lấy và lưu lựa chọn đồng ý.
- Cấu hình Consent Mode phù hợp.

### 8.2. GTM Consent Overview

Có thể sử dụng Consent Overview để kiểm tra trạng thái và yêu cầu đồng ý của các Tags.

Đảm bảo Tags không thu thập dữ liệu trái với trạng thái consent đã được xác định.

## 9. Advanced Patterns – Các kỹ thuật nâng cao

### 9.1. Tag Sequencing

Tag Sequencing giúp xác định thứ tự thực thi giữa các Tags.

Ví dụ:
- Google tag được thiết lập trước khi gửi sự kiện.
- Pixel được khởi tạo trước khi gửi sự kiện chuyển đổi.

Chỉ sử dụng khi có nhu cầu thực tế, tránh làm phức tạp hệ thống.

### 9.2. Trigger Exceptions

Có thể thiết lập điều kiện ngăn Tag chạy trong một số trường hợp.

Ví dụ:
- Không chạy trên trang thử nghiệm.
- Không chạy với traffic nội bộ.
- Không chạy khi điều kiện consent chưa đáp ứng.

### 9.3. Custom JavaScript Variables

Có thể sử dụng JavaScript Variable để xử lý dữ liệu động khi cần.

Ví dụ lấy tham số URL:

```javascript
function() {
  var params = new URLSearchParams(window.location.search);
  return params.get('campaign') || '(not set)';
}
```

Chỉ sử dụng Custom JavaScript khi Built-in Variables hoặc Data Layer Variables không đáp ứng được nhu cầu.

Không sử dụng JavaScript tùy chỉnh nếu chưa hiểu rõ tác động và cách kiểm tra.

## 10. Checklist trước khi xuất bản

### Cấu hình
- [ ] Google tag đã được thiết lập đúng.
- [ ] Measurement ID chính xác.
- [ ] Các Tags có Trigger phù hợp.
- [ ] Variables trả về đúng giá trị.
- [ ] Data Layer có dữ liệu cần thiết.

### Kiểm tra
- [ ] Đã chạy Preview Mode.
- [ ] Các sự kiện được kích hoạt đúng thời điểm.
- [ ] Không có sự kiện bị ghi nhận trùng.
- [ ] Các Parameter được truyền đúng.
- [ ] Đã kiểm tra trên các thiết bị hoặc trình duyệt cần thiết.

### Quyền riêng tư
- [ ] Đã xem xét yêu cầu consent.
- [ ] Không gửi dữ liệu cá nhân nhạy cảm.
- [ ] Tags tuân thủ trạng thái consent.

### Xuất bản
- [ ] Có tên phiên bản.
- [ ] Có mô tả thay đổi.
- [ ] Đã kiểm tra lần cuối.
- [ ] Có thể xác định và khôi phục phiên bản trước nếu xảy ra lỗi.

## 11. Nguyên tắc sử dụng cho Agent

- Phân biệt GTM với GA4: GTM quản lý việc triển khai Tags, GA4 thu thập và phân tích dữ liệu.
- Không khẳng định GTM đã triển khai chỉ vì website có GA4.
- Không tự tạo mã tracking với giả định về cấu trúc HTML hoặc mã nguồn website.
- Không hướng dẫn người dùng xuất bản Tag khi chưa kiểm tra.
- Nếu không có quyền truy cập GTM, chỉ cung cấp hướng dẫn hoặc cấu hình mẫu.
- Luôn yêu cầu kiểm tra bằng Preview Mode trước khi xuất bản.
- Không sử dụng ví dụ dữ liệu minh họa làm dữ liệu thật.
- Ưu tiên triển khai đơn giản, dễ kiểm soát và dễ bảo trì.
