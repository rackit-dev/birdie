import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SearchModal() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>검색 모달 또는 페이지입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20 },
});
