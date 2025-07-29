import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

const LoadingScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkAuth = async () => {
      // 1초 대기 (자연스러운 로딩처럼 보이게)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const token = await SecureStore.getItemAsync("accessToken");

      if (token) {
        navigation.replace("Main"); // or your home screen stack name
      } else {
        // 테스트용
        navigation.replace("Main");

        // navigation.replace("Login"); -> 실제 앱에서는 로그인 화면으로 이동하도록 수정 필요
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 10 }}>잠시만 기다려주세요...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default LoadingScreen;
