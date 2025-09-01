import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

const LoadingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const IMAGE_URL = process.env.EXPO_PUBLIC_API_IMAGE_URL;

  useEffect(() => {
    const checkAuth = async () => {
      // 1초 대기 (자연스러운 로딩처럼 보이게)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const token = await SecureStore.getItemAsync("accessToken");

      if (token) {
        navigation.replace("Main");
      } else {
        // 테스트용
        // navigation.replace("Main");

        navigation.replace("Login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../assets/images/logos/reverse_logo.png")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  logo: {
    width: 180,
    height: 60,
  },
});

export default LoadingScreen;
