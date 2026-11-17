# Trả lời câu hỏi bổ sung – Buổi 9 (BookStore)

## 1. Giá trị dẫn xuất

`errors` và `valid` đều suy ra được từ `name`, `phone`, `address` và số sản phẩm trong giỏ, nên tính lại mỗi lần render thì lúc nào cũng khớp với dữ liệu hiện tại, không cần giữ thêm gì. Nếu lưu chúng bằng `useState` riêng thì phải nhớ cập nhật ở mọi chỗ làm dữ liệu đổi (`setName`, `setPhone`, `setAddress`, cả khi giỏ thay đổi). Quên một chỗ là lỗi đỏ hiện sai, hoặc nút "Xác nhận đặt hàng" sáng lên dù SĐT đang sai. Khi đó còn có hai nguồn sự thật cho cùng một thông tin và chúng dễ lệch nhau.

## 2. Thứ tự gọi

Nếu `clear()` chạy trước `await createOrder(...)` mà mất mạng, giỏ đã bị xóa khỏi store và cả AsyncStorage (vì `useAutoPersist` ghi giỏ rỗng xuống), trong khi server chưa nhận đơn nào. Người dùng mất hết hàng đã chọn, không có đơn, và không bấm thử lại được vì giỏ trống. Đặt `clear()` ngay sau `await createOrder(...)` thì chỉ khi server đã nhận đơn thành công giỏ mới bị xóa; nếu lỗi thì lệnh ném ngoại lệ, nhảy vào `catch` và giỏ vẫn nguyên.

## 3. PUT hay PATCH

`PUT /users/1` với `{ name, phone }` thay cả object, nên user đó trong `db.json` chỉ còn `id`, `name`, `phone`; `email` và `password` biến mất, và người này không đăng nhập được nữa. `PATCH` chỉ đổi các trường được gửi, các trường còn lại giữ nguyên. Vì form chỉ sửa một phần hồ sơ nên bài này dùng PATCH và chỉ gửi `{ name, phone }`.

## 4. Cập nhật lạc quan

Nếu bỏ đoạn hoàn lại `read: false` trong `catch`, khi mất mạng giao diện vẫn báo thông báo đã đọc trong khi server vẫn lưu là chưa đọc. Người dùng tưởng đã xong, nhưng lần sau mở lại màn Thông báo thì nó quay về chưa đọc, rất khó hiểu. Cách làm này hợp với thao tác nhẹ, ít khi sai và dễ hoàn lại, ví dụ tăng/giảm số lượng trong giỏ hoặc bấm tim yêu thích nếu dữ liệu nằm trên server. Thanh toán thì không nên dùng, vì phải chờ server xác nhận đã nhận đơn rồi mới được báo "Đặt hàng thành công".

## 5. Code bổ sung: bộ lọc trạng thái ở màn Đơn hàng

Thêm state `status` và hàng nút lọc, rồi đổi `data` của `FlatList` thành danh sách đã lọc.

```tsx
type StatusFilter = "all" | OrderStatus;

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Đã huỷ" },
];

const [status, setStatus] = useState<StatusFilter>("all");

const shown = useMemo(
  () => orders.filter((o) => status === "all" || o.status === status),
  [orders, status]
);

// <FlatList data={shown} … />
```

Ảnh chụp màn hình kết quả: (đính kèm file ảnh cùng bài nộp)
