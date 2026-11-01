# Trả lời câu hỏi bổ sung – Buổi 7 (BookStore)

## 1. Cấu trúc điều hướng

BookDetail là màn con của luồng xem sách: bấm vào một cuốn thì đẩy màn lên trên, bấm ← thì quay lại, đúng kiểu push/pop của Stack. Vì nằm ở Stack nên nó phủ lên cả Tab Bar và có sẵn nút ← mà mình không phải tự viết. Nếu đặt vào Tab thì BookDetail trở thành một tab ngang hàng với Home, Danh mục, Giỏ hàng, Tài khoản: Tab Bar vẫn hiện, không có nút quay lại tự động, và với Tab Bar tự dựng của bài này thì nó còn bị vẽ thành tab thứ 5 vì CustomTabBar lấy toàn bộ `state.routes`.

## 2. Redux

Reducer của Redux Toolkit chạy bằng Immer, nên `state` trong reducer thực ra là một bản nháp chứ không phải state thật. Khi reducer chạy xong, Immer so bản nháp với bản gốc rồi tạo ra state mới, vì vậy state cũ vẫn nguyên và `state.items.push(...)` chỉ trông như sửa trực tiếp. Khi bỏ `useMemo` trong `useCart`, tổng số lượng và tổng tiền vẫn hiển thị đúng, vì `useMemo` chỉ để tối ưu. Hậu quả là hai phép `reduce` bị tính lại ở mọi lần render, kể cả khi giỏ không đổi; giỏ nhỏ thì không thấy gì, giỏ lớn thì tốn.

## 3. Promise.all

`Promise.all` báo lỗi ngay khi một request lỗi, nên Home rơi vào `catch` và hiện ErrorView dù `getBooks()` đã tải xong; dữ liệu sách bị bỏ phí. Dùng `Promise.allSettled` thì cả hai request chạy đến cùng, mỗi kết quả có `status` là `fulfilled` hoặc `rejected`, nhờ vậy vẫn `setBooks` được khi sách tải thành công. Đánh đổi là phải tự kiểm tra từng kết quả và tự quyết định giao diện khi chỉ có một phần dữ liệu (ví dụ không có chip danh mục), và nên có thêm thông báo lỗi riêng cho phần bị lỗi, nếu không người dùng không biết dữ liệu chưa đầy đủ.

```tsx
const [b, c] = await Promise.allSettled([getBooks(), getCategories()]);
if (b.status === "fulfilled") setBooks(b.value);
else setError(getErrorMessage(b.reason));
if (c.status === "fulfilled") setCategories(c.value);
```

## 4. Debounce

Nếu đặt `setTimeout` thẳng trong `onChangeText` thì mỗi phím gõ tạo một timer riêng và không timer nào bị huỷ, nên mỗi ký tự vẫn gây một lần lọc, chỉ chậm đi 400 ms chứ không gộp lại. Đặt trong `useEffect` có hàm dọn dẹp thì mỗi lần `value` đổi, timer cũ bị huỷ trước khi timer mới được tạo, nên chỉ lần gõ cuối cùng được áp dụng. Hàm dọn dẹp cũng chạy khi component bị gỡ, nhờ đó timer không còn chạy tiếp rồi gọi `setState` trên một component đã biến mất.


