# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Nhận thông báo Realtime (Nhắc thuốc)

## 1. Thông tin chung
- **Mã chức năng:** E.2.2
- **Tên chức năng:** Nhận thông báo Realtime — Nhắc lịch uống thuốc (Medication Reminder — Realtime Push)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Mức độ ưu tiên:** Khó
- **Cơ sở dữ liệu:** PostgreSQL (bảng `notifications`, dùng chung với E.2.1)

## 2. Mục tiêu
Đẩy (Push) thông báo nhắc nhở tới đúng khách hàng ngay tại thời điểm đến giờ uống thuốc theo phác đồ, mà không cần khách hàng phải chủ động tải lại (refresh) trang.

> [!IMPORTANT]
> *Ghi chú kỹ thuật quan trọng: Yêu cầu ban đầu là "Kế thừa hạ tầng SSE của AI" (tái sử dụng cơ chế Server-Sent Events từ tính năng Chat AI). Tuy nhiên, tại thời điểm viết tài liệu này, hạ tầng SSE cho AI Chat **chưa được xây dựng** trong source code (chỉ tồn tại entity `ChatSession` ở dạng model dữ liệu, thư mục `ai-service/` chưa có code, chưa có `SseEmitter`/`WebSocketConfig` nào trong `ds-backend`). Vì vậy, UC E.2.2 và tính năng SSE Streaming của AI Chat cần được xem là **2 use case phụ thuộc lẫn nhau, phải thiết kế tầng hạ tầng Realtime dùng chung ngay từ đầu**, thay vì "kế thừa" một hạ tầng có sẵn. Đội Dev cần xác nhận thứ tự ưu tiên: xây hạ tầng Realtime chung trước, rồi 2 tính năng cùng dùng lại.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Không có màn hình riêng.** Đây là một Component nền (Background Listener), hoạt động xuyên suốt khi khách hàng đang mở ứng dụng.

### 3.1. Mô tả hành vi (Behavior Mockup)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Gastro AI                                                                    🔔(4)   👤 Nguyễn Văn A   │
│                                                                                                        │
│                              ┌───────────────────────────────────────────┐                             │
│                              │  💊  Đã đến giờ uống thuốc!                │  ← Toast/Popup xuất hiện    │
│                              │  Omeprazol 20mg - 1 viên sau ăn sáng        │     realtime, không cần F5  │
│                              └───────────────────────────────────────────┘                             │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Kết nối:** Ngay khi khách hàng đăng nhập thành công và mở ứng dụng, FE tự động khởi tạo 1 kết nối lắng nghe sự kiện (SSE `EventSource` hoặc WebSocket Client), đính kèm JWT Token để xác thực kênh kết nối.
- **Nhận sự kiện:** Khi Backend đẩy sự kiện `MEDICATION_REMINDER` tới đúng kết nối của khách hàng đó, FE:
  1. Hiển thị Toast/Popup nhắc nhở ngay lập tức (tái sử dụng cơ chế Toast của **E.1**).
  2. Tự động cập nhật lại Badge số lượng chưa đọc và chèn thêm item mới vào đầu danh sách thông báo (**E.2.1**) mà không cần gọi lại API GET.
- **Tự phục hồi kết nối (Reconnect):** Nếu kết nối bị rớt (mất mạng, sập tab), Component phải tự động thử kết nối lại theo cơ chế backoff (SSE có sẵn cơ chế `retry` mặc định của trình duyệt; WebSocket cần tự cài đặt).

## 4. Yêu cầu Backend (BE)
- **Thành phần Scheduler (Trigger):** Một Job chạy định kỳ (Ví dụ: mỗi phút — Spring `@Scheduled`) quét các phác đồ/lịch uống thuốc của khách hàng đến đúng giờ nhắc.
- **Thành phần đẩy sự kiện (Push Layer):**
  - **API Endpoint (SSE):** `GET /api/v1/notifications/stream` — trả về `Content-Type: text/event-stream`, giữ kết nối mở (Long-lived Connection) cho từng khách hàng.
  - BE quản lý một Registry ánh xạ `customerId -> SseEmitter` (hoặc WebSocket Session) đang mở, để biết đẩy sự kiện tới đúng kết nối của khách hàng nào.
- **Luồng xử lý Logic:**
  1. Scheduler phát hiện đến giờ uống thuốc của khách hàng X.
  2. BE `INSERT` một bản ghi mới vào bảng `notifications` (dùng chung cấu trúc với E.2.1, `type = 'MEDICATION_REMINDER'`).
  3. BE tra cứu trong Registry xem `customerId` của khách hàng X có đang giữ kết nối SSE/WebSocket nào đang mở hay không.
     - Nếu có: Đẩy (Push) ngay nội dung thông báo qua kết nối đó.
     - Nếu không (khách hàng đang offline): Bỏ qua bước đẩy realtime — thông báo vẫn đã được lưu ở Bước 2, khách hàng sẽ thấy khi mở lại danh sách thông báo (E.2.1).
  4. Khi khách hàng đóng tab/đăng xuất, BE phải dọn dẹp (remove) kết nối tương ứng khỏi Registry để tránh rò rỉ bộ nhớ (Memory Leak).

## 5. Ngoại lệ (Exception Handling)
| Tình huống | Mô tả | Xử lý |
|---|---|---|
| Mất kết nối mạng tạm thời | Kênh SSE/WebSocket bị ngắt | FE tự động reconnect; nếu bỏ lỡ sự kiện, dữ liệu vẫn có sẵn trong DB, đồng bộ lại qua API GET của E.2.1 khi kết nối lại |
| Khách hàng offline tại thời điểm nhắc | Không có kết nối realtime nào đang mở cho `customerId` đó | Không đẩy realtime; thông báo vẫn được lưu DB, hiển thị dạng "chưa đọc" khi khách hàng quay lại |
| Token hết hạn giữa phiên kết nối | Kết nối SSE bị BE từ chối xác thực | FE bắt lỗi, thử refresh Token rồi khởi tạo lại kết nối |
| Quá tải kết nối đồng thời | Số lượng kết nối SSE mở cùng lúc lớn | Cân nhắc giới hạn Timeout mỗi kết nối (Ví dụ: tự đóng và FE tự mở lại sau mỗi 30-60 phút) để tránh treo tài nguyên Server |

> [!NOTE]
> *Vì SSE là kết nối một chiều (Server → Client) và hoạt động ổn định qua HTTP/1.1 thông thường (không cần hạ tầng riêng như WebSocket), đây là lựa chọn mặc định phù hợp cho nhu cầu "nhắc nhở một chiều" của UC này. Chỉ cân nhắc chuyển sang WebSocket nếu về sau cần giao tiếp 2 chiều thời gian thực (ví dụ Chat AI cần Client gửi tin nhắn liên tục) — khi đó nên thiết kế tầng hạ tầng Realtime dùng chung cho cả 2 use case như ghi chú ở Mục 2.*
