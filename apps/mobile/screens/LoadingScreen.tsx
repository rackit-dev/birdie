import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { useUserIdStore } from "@/store/useUserIdStore";

const LoadingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const setUser = useUserIdStore((state) => state.setUser);

  const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const token = await SecureStore.getItemAsync("session_token");

      console.log("token", token);

      if (token) {
        try {
          const res = await fetch(`${API_BASE}/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("Failed to fetch user");

          const data = await res.json();

          setUser(data);

          navigation.replace("Main");

          // 테스트용
          // navigation.replace("Login");
        } catch (err) {
          console.error("유저정보 불러오기 실패:", err);
          navigation.replace("Login");
        }
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
      <Text style={styles.appName}>YOUNG'S MINTION</Text>
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
  appName: {
    fontFamily: "P-Bold",
    fontSize: 30,
    alignSelf: "center",
    textAlign: "center",
    color: "#fff",
    letterSpacing: -0.5,
  },
});

export default LoadingScreen;
