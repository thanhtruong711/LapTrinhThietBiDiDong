import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function Loading() {
  return (
    <View style={styles.box}>
      <ActivityIndicator size="large" color={colors.blue} />
      <Text style={styles.text}>Đang tải...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff" },
  text: { fontSize: 15, color: colors.muted },
});