import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#344e81" />
      <Text style={{ marginTop: 16, fontFamily: "P-500" }}>
        잠시만 기다려주세요...
      </Text>
    </View>
  );
}
