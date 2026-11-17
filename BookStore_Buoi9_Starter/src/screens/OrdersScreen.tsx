import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";import { StatusBadge } from "../components/StatusBadge";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { TodoBox } from "../components/TodoBox";
import { getOrdersByUser } from "../services/orderService";
import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useAuth, useCart } from "../store/hooks";
import { formatDateTime } from "../utils/format";
import { showMessage } from "../utils/dialog";
import { RootScreenProps } from "../navigation/types";
import { Order, OrderStatus } from "../types";
import { colors, formatPrice, radius } from "../theme";

export const PAYMENT_LABEL = { cod: "Thanh toán khi nhận hàng (COD)", bank: "Chuyển khoản ngân hàng" } as const;
type StatusFilter = "all" | OrderStatus;

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Đã huỷ" },
];

export function OrdersScreen({ navigation }: RootScreenProps<"Orders">) {
  const { user, isLoggedIn } = useAuth();
  const { items: cartItems, add, setQty } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null); // đơn đang mở rộng (xem chi tiết ngay tại màn này)

  const [status, setStatus] = useState<StatusFilter>("all");
  const shown = useMemo(
    () => orders.filter((o) => status === "all" || o.status === status),
    [orders, status]
  );

  const load = useCallback(async () => {
    // TODO BT9.3a: if (!user) return; bật loading, xoá error; gọi getOrdersByUser(user.id);
    // SẮP XẾP LẠI ở client: mới nhất lên đầu (b.createdAt.localeCompare(a.createdAt)); catch → setError(getErrorMessage(e)); finally tắt loading
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrdersByUser(user.id);
      setOrders([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // TODO BT9.C1 (thử thách "Mua lại"): thêm lại toàn bộ sản phẩm của đơn vào giỏ hiện tại
  const reorder = async (order: Order) => {
    try {
      const books = await getBooks(); // lấy giá và tồn kho mới nhất, vì giá trong đơn cũ có thể đã đổi
      order.items.forEach((it) => {
        const book = books.find((b) => b.id === it.bookId);
        if (!book) return; // sách đã bị xoá khỏi cửa hàng thì bỏ qua
        const inCart = cartItems.find((c) => c.bookId === it.bookId);
        if (!inCart) {
          add({ bookId: book.id, title: book.title, price: book.price, emoji: book.emoji, color: book.color, stock: book.stock });
        }
        setQty(it.bookId, (inCart?.quantity ?? 0) + it.quantity); // cùng sách thì cộng dồn, setQty tự chặn ở tồn kho
      });
      showMessage("Đã thêm vào giỏ", "Các sản phẩm của đơn hàng đã được thêm lại vào giỏ.", () =>
        navigation.navigate("Tabs", { screen: "Cart" })
      );
    } catch (e) {
      showMessage("Không thể mua lại", getErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  if (!isLoggedIn) {
    return <EmptyState emoji="🔒" title="Bạn cần đăng nhập" actionLabel="Đăng nhập" onAction={() => navigation.navigate("Login")} />;
  }
  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setStatus(f.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      
      {/* <TodoBox id="BT9.3b">{"FlatList đơn hàng: mỗi thẻ có Đơn #id, ngày (formatDateTime), tổng tiền, <StatusBadge>; bấm vào thẻ → mở rộng chi tiết sản phẩm + địa chỉ giao ngay trên màn này (openId)."}</TodoBox>
      <TodoBox id="BT9.3c">{"ListEmptyComponent: <EmptyState emoji=\"🧾\" title=\"Bạn chưa có đơn hàng nào\" …> có nút “Mua sắm ngay”."}</TodoBox> */}
      <FlatList
        data={shown}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ padding: 12, gap: 10, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            emoji="🧾"
            title={status === "all" ? "Bạn chưa có đơn hàng nào" : "Không có đơn ở trạng thái này"}
            message="Đặt đơn đầu tiên để theo dõi tại đây."
            actionLabel="Mua sắm ngay"
            onAction={() => navigation.navigate("Tabs", { screen: "Home" })}
          />
        }
        renderItem={({ item: o }) => {
          const open = openId === o.id;
          return (
            <View style={styles.card}>
              <Pressable onPress={() => setOpenId(open ? null : o.id)} style={styles.head}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.code}>Đơn #{o.id}</Text>
                  <Text style={styles.date}>{formatDateTime(o.createdAt)}</Text>
                  <Text style={styles.total}>{formatPrice(o.total)}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <StatusBadge status={o.status} />
                  <Text style={styles.toggle}>{open ? "Thu gọn ▲" : "Chi tiết ▼"}</Text>
                </View>
              </Pressable>

              {open && (
                <View style={styles.detail}>
                  {o.items.map((it) => (
                    <View key={it.bookId} style={styles.itemRow}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{it.title} × {it.quantity}</Text>
                      <Text style={styles.itemPrice}>{formatPrice(it.price * it.quantity)}</Text>
                    </View>
                  ))}
                  <View style={styles.addr}>
                    <Text style={styles.addrH}>Giao đến</Text>
                    <Text style={styles.addrT}>{o.address.name} · {o.address.phone}</Text>
                    <Text style={styles.addrT}>{o.address.address}</Text>
                    <Text style={styles.addrT}>Thanh toán: {PAYMENT_LABEL[o.paymentMethod]}</Text>
                  </View>

                  {o.status === "completed" && (
                    <PrimaryButton title="Mua lại" variant="outline" onPress={() => reorder(o)} />
                  )}

                </View>
              )}
            </View>
          );
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: colors.bg, padding: 12, gap: 10 },
  card: { backgroundColor: "#fff", borderRadius: radius.md, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  code: { fontWeight: "800", color: colors.navy, fontSize: 16 },
  date: { color: colors.muted, fontSize: 12 },
  total: { color: colors.indigo, fontWeight: "800", fontSize: 15 },
  toggle: { color: colors.indigo, fontSize: 12, fontWeight: "700" },
  detail: { borderTopWidth: 1, borderTopColor: colors.line, padding: 12, gap: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  itemTitle: { flex: 1, color: colors.text },
  itemPrice: { color: colors.text, fontWeight: "700" },
  addr: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 10, gap: 2, marginTop: 4 },
  addrH: { fontWeight: "800", color: colors.navy, marginBottom: 2 },
  addrT: { color: colors.text, fontSize: 13 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { fontSize: 13, color: colors.navy },
  chipTextActive: { color: "#fff", fontWeight: "600" },
});
