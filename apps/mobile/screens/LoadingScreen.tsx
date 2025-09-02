import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

const LoadingScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkAuth = async () => {
      // 1초 대기 (자연스러운 로딩처럼 보이게)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const token = await SecureStore.getItemAsync("accessToken");

      if (token) {
        navigation.replace("Main");
      } else {
        // 테스트용
        navigation.replace("Main");

        //navigation.replace("Login");
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
