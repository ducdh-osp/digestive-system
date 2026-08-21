# Mô tả Luồng hoạt động (Workflow) - Nhật ký & Biểu đồ

Tài liệu này tổng hợp luồng đi (Flow) của module C.1 — nơi khách hàng ghi lại nhật ký ăn uống, đánh giá phân theo thang Bristol, và xem lại xu hướng qua biểu đồ.

> [!NOTE]
> *Module C (Theo dõi Bệnh lý) hiện chưa có code trong source — 3 luồng dưới đây mô tả thiết kế dự kiến, xem chi tiết đặc tả từng UC tại `Ghi-nhat-ky-an-uong.md` (C.1.1), `Danh-gia-phan-bristol.md` (C.1.2), `Bieu-do-suc-khoe.md` (C.1.3).*

## 1. Luồng Ghi nhật ký ăn uống (C.1.1)
**Mục đích:** Lưu lại các bữa ăn trong ngày làm dữ liệu nền cho biểu đồ và tư vấn sau này.

1. **Bước 1 (FE):** Khách hàng mở form, chọn loại bữa (Sáng/Trưa/Tối/Phụ), chỉnh thời điểm nếu cần (mặc định hiện tại), chọn/thêm món đã ăn, ghi chú tuỳ chọn.
2. **Bước 2 (FE -> BE):** Bấm "Lưu nhật ký", FE gọi `POST /api/v1/tracking/meal-logs`.
3. **Bước 3 (BE):** Validate `meal_time` không ở tương lai và có tối thiểu 1 món ăn, `INSERT` vào bảng `meal_logs` kèm `customer_id` trích từ JWT.
4. **Bước 4 (FE):** Toast thành công, làm mới danh sách lịch sử (nếu đang mở), reset form.

---

## 2. Luồng Đánh giá phân theo thang Bristol (C.1.2)
**Mục đích:** Ghi nhận hình dạng phân mỗi lần đi vệ sinh theo thang đo y khoa chuẩn.

1. **Bước 1 (FE):** Khách hàng chọn 1 trong 7 card minh hoạ Bristol, chỉnh thời điểm nếu cần, ghi chú tuỳ chọn.
2. **Bước 2 (FE -> BE):** Bấm "Lưu đánh giá", FE gọi `POST /api/v1/tracking/bristol-logs`.
3. **Bước 3 (BE):** Validate `bristol_type` trong khoảng 1–7 và `log_time` không ở tương lai, `INSERT` vào bảng `bristol_logs`.
4. **Bước 4 (FE):** Toast thành công, làm mới danh sách lịch sử (nếu đang mở).

---

## 3. Luồng Xem biểu đồ sức khỏe (C.1.3)
**Mục đích:** Trực quan hoá dữ liệu đã ghi ở 2 luồng trên để khách hàng tự nhận diện xu hướng.

1. **Bước 1 (FE):** Khách hàng mở trang Biểu đồ sức khỏe, chọn khoảng thời gian (7 ngày/30 ngày/tuỳ chọn, mặc định 30 ngày).
2. **Bước 2 (FE -> BE):** FE gọi song song `GET /api/v1/tracking/charts/bristol-summary` và `GET /api/v1/tracking/charts/meal-summary` kèm `from`/`to`.
3. **Bước 3 (BE):** Mỗi API `GROUP BY` theo ngày trên bảng tương ứng (`bristol_logs`/`meal_logs`), chỉ tính dữ liệu của khách hàng hiện tại, trả về danh sách điểm dữ liệu theo ngày.
4. **Bước 4 (FE):** Recharts vẽ `LineChart` (xu hướng Bristol trung bình theo ngày) và `BarChart` (số bữa ăn theo ngày). Nếu không có dữ liệu, hiển thị trạng thái rỗng thay vì biểu đồ trống.

> Ghi chú: `meal_logs` (C.1.1) và `bristol_logs` (C.1.2) là 2 bảng độc lập, không có khoá ngoại liên kết trực tiếp với nhau — C.1.3 chỉ tổng hợp riêng từng bảng, không đối chiếu chéo món ăn với đánh giá phân trong phạm vi MVP.
