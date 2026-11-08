# Trả lời câu hỏi bổ sung – Buổi 8 (BookStore)

## 1. Cờ ready

Ở lần render đầu, giỏ hàng trong store còn rỗng và `ready` đang là `false`. Nếu bỏ điều kiện `ready`, effect của `useAutoPersist` chạy ngay sau lần render đầu đó và ghi mảng rỗng vào AsyncStorage, trong lúc hàm đọc giỏ cũ chưa chắc đã trả kết quả. Giỏ đã lưu bị đè bằng `[]`, nên mở lại app thì giỏ trống, hoặc đúng sai tùy việc bên nào xong trước, rất khó đoán. Có cờ `ready` thì việc ghi chỉ bắt đầu sau khi đọc xong và đã nạp dữ liệu vào store, nên dữ liệu cũ không bị mất.

## 2. Token giả

Điểm không an toàn thứ nhất: mật khẩu nằm sẵn trong `db.json` ở dạng chữ thường và app tự so sánh, nên ai gọi `/users` cũng đọc được mật khẩu của mọi người. Điểm thứ hai: token do chính app tự tạo, server không xác minh gì, nên ai cũng có thể tự làm ra một token giả để "đăng nhập". Hệ thống thật thì server kiểm tra mật khẩu (đã băm), rồi cấp token có thời hạn. Phía app nên lưu token bằng SecureStore (Keychain trên iOS, Keystore trên Android) thay cho AsyncStorage, vì AsyncStorage lưu chữ thường, không mã hóa.

## 3. Hai effect trong CartItemRow

Nếu xóa effect `setQty(item.quantity)`, số hiển thị trên nút chỉ lấy giá trị ở lần render đầu và không đổi theo store nữa. Số hiển thị sẽ lệch khi store đổi từ nơi khác: ví dụ giỏ được nạp từ AsyncStorage sau khi mở app, hoặc mình vào trang Chi tiết bấm "Thêm vào giỏ" cho một cuốn đã có trong giỏ làm số lượng tăng lên, trong khi dòng ở màn Giỏ hàng vẫn giữ số cũ. Tệ hơn, lần bấm + tiếp theo sẽ tính từ số cũ và ghi đè giá trị mới của store.

## 4. Một nguồn state

Nếu mỗi HeartButton giữ trạng thái bằng `useState` riêng thì mỗi nút chỉ biết chuyện của nó. Bấm tim ở lưới sách rồi vào trang Chi tiết, tim ở đó vẫn trắng vì là một state khác, và thoát ra vào lại thì state cũng mất vì nó gắn với component. Dùng store thì danh sách id yêu thích nằm ở một chỗ duy nhất, mọi HeartButton đọc `isFavorite(bookId)` từ đó và `toggle` thì sửa chính nó, nên tim ở lưới, ở trang Chi tiết và màn Yêu thích luôn khớp nhau. Việc lưu xuống AsyncStorage cũng chỉ cần làm một lần.

