import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { useUserIdStore } from "@/store/useUserIdStore";
import axios from "axios";
import { API_URL } from "@env";

const LoadingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const setUser = useUserIdStore((s) => s.setUser);
  const clearUser = useUserIdStore((s) => s.clearUser);

  useEffect(() => {
    const initAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const token = await SecureStore.getItemAsync("session_token");
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser({
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
          });
        } catch (err) {
          console.error("유저 정보 fetch 실패:", err);
          clearUser();
        }
      } else {
        clearUser();
      }

      navigation.replace("Main");
    };

    initAuth();
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
    fontFamily: "P-500",
    fontSize: 30,
    alignSelf: "center",
    textAlign: "center",
    color: "#fff",
    letterSpacing: -0.5,
  },
});

export default LoadingScreen;
