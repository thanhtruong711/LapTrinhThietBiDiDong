import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CartItem } from "../types";
import { colors, formatPrice, radius } from "../theme";
import { useDebounce } from "../hooks/useDebounce";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

// TODO BT8.6: nút −/+ với STATE CỤC BỘ + debounce 300ms
//   1) const [qty, setQty] = useState(item.quantity); const debouncedQty = useDebounce(qty, 300);
//   2) useEffect: khi debouncedQty khác item.quantity → onChangeQty(item.bookId, debouncedQty)
//   3) useEffect: khi item.quantity đổi từ nơi khác → setQty(item.quantity)
//   4) canDec = qty > 1; canInc = qty < item.stock (không vượt tồn kho); nút bị mờ khi không bấm được
//   5) hiển thị "Còn {item.stock}"
// Hiện tại chỉ hiện số lượng tĩnh "x{quantity}".
export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  const [qty, setQty] = useState(item.quantity);
  const debouncedQty = useDebounce(qty, 300);

  // qty đã đứng yên 300 ms thì mới ghi lên store
  useEffect(() => {
    if (debouncedQty !== item.quantity) onChangeQty(item.bookId, debouncedQty);
  }, [debouncedQty]);

  // store đổi từ nơi khác thì đồng bộ lại số hiển thị
  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>

        <View style={styles.stepper}>
          <Pressable
            style={[styles.stepBtn, !canDec && { opacity: 0.35 }]}
            disabled={!canDec}
            onPress={() => setQty((q) => q - 1)}
            accessibilityLabel="Giảm"
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>

          <Text style={styles.qty}>{qty}</Text>

          <Pressable
            style={[styles.stepBtn, !canInc && { opacity: 0.35 }]}
            disabled={!canInc}
            onPress={() => setQty((q) => q + 1)}
            accessibilityLabel="Tăng"
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.stock}>Còn {item.stock}</Text>
      </View>
      <Pressable onPress={() => onRemove(item.bookId)} hitSlop={8} accessibilityLabel="Xóa khỏi giỏ">
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, padding: 10, marginHorizontal: 12, marginVertical: 5, gap: 10 },
  cover: { width: 54, height: 72, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: "700", color: colors.text },
  price: { color: colors.indigo, fontWeight: "800" },
  todo: { borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.warning, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#FFFBEB", alignSelf: "flex-start", marginTop: 4 },
  todoText: { color: "#B45309", fontSize: 11, fontWeight: "700" },
  qty: { fontWeight: "800", color: colors.navy, fontSize: 16 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  stepText: { fontSize: 18, fontWeight: "800", color: colors.navy },
  stock: { color: colors.muted, fontSize: 12 },
  trash: { fontSize: 22 },
});
