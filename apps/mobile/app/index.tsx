import { View, Image } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function LoadingScreen() {
  const router = useRouter();
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    console.log("🚀 앱 시작 - LoadingScreen 마운트됨");

    const checkLoginStatus = async () => {
      try {
        // 로그인화면테스트용: 기존 저장된 토큰 삭제
        await SecureStore.deleteItemAsync("access_token");

        const accessToken = await SecureStore.getItemAsync("access_token");

        // 토큰 저장 확인
        console.log("Stored access token:", accessToken);

        if (accessToken) {
          router.replace("/(tabs)");
        } else {
          // 로그인페이지 잠시 건너뛰기
          router.replace("/(tabs)");

          // router.replace("/login");
        }
      } catch (error) {
        console.error("토큰 확인 중 에러:", error);
        router.replace("/login");
      } finally {
        setCheckingToken(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (checkingToken) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return null;
}
