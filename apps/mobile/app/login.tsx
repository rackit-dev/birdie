import { View, Text, Pressable, Alert } from "react-native";
import { useState } from "react";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [showWebView, setShowWebView] = useState(false);
  const router = useRouter();

  const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
  const REDIRECT_URI = "http://localhost:8081"; // 추후 실제 빌드 시 수정 필요
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;

  const handleWebViewNavigationStateChange = async (navState: any) => {
    const { url } = navState;
    console.log("현재 웹뷰 URL:", url);

    if (url.startsWith(REDIRECT_URI)) {
      const codeMatch = url.match(/code=([^&]*)/);
      const code = codeMatch?.[1];
      if (code) {
        console.log("카카오 인증 성공, Authorization Code:", code);

        try {
          const tokenResponse = await fetch(
            "https://kauth.kakao.com/oauth/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `grant_type=authorization_code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&code=${code}`,
            }
          );

          const tokenResult = await tokenResponse.json();
          console.log("카카오 토큰 응답:", tokenResult);

          if (tokenResult.access_token) {
            // 토큰 확인용
            console.log("Access Token:", tokenResult.access_token);
            console.log("Refresh Token:", tokenResult.refresh_token);

            setShowWebView(false);
            router.replace("/(tabs)");
          } else {
            Alert.alert(
              "토큰 발급 실패",
              "카카오 서버에서 토큰을 받지 못했습니다."
            );
          }
        } catch (error) {
          console.error("토큰 요청 에러:", error);
          Alert.alert("에러 발생", "토큰 요청 중 문제가 발생했습니다.");
        }
      }
    }
  };

  if (showWebView) {
    return (
      <WebView
        source={{ uri: kakaoAuthUrl }}
        incognito={true}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        startInLoadingState
        javaScriptEnabled
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 40 }}>
        로그인
      </Text>

      <Pressable
        onPress={() => setShowWebView(true)}
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          backgroundColor: "#FEE500",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#3C1E1E", fontSize: 16, fontWeight: "bold" }}>
          카카오로 로그인
        </Text>
      </Pressable>
    </View>
  );
}
