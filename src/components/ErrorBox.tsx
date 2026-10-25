import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Có lỗi xảy ra</Text>
      <Text style={styles.msg}>{message}</Text>
      <Pressable style={styles.btn} onPress={onRetry}>
        <Text style={styles.btnText}>THỬ LẠI</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", color: colors.red },
  msg: { fontSize: 14, color: colors.text, textAlign: "center" },
  btn: { backgroundColor: colors.blue, borderRadius: 4, paddingVertical: 12, paddingHorizontal: 28, marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "bold" },
});