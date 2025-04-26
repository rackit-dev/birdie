import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [showWebView, setShowWebView] = useState(false);
  const router = useRouter();

  const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
  const REDIRECT_URI = "http://localhost:8081";

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log("현재 웹뷰 URL:", url);

    if (url.startsWith(REDIRECT_URI)) {
      const codeMatch = url.match(/code=([^&]*)/);
      const code = codeMatch?.[1];
      if (code) {
        console.log("카카오 인증 성공, Authorization Code:", code);
        setShowWebView(false);
        router.replace("/(tabs)");
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
