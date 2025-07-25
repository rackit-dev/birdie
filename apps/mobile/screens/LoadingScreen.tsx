import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Loading: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>잠시만 기다려주세요...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loading;
