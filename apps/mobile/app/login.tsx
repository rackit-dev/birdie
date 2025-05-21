import { View, Text, Pressable, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [showWebView, setShowWebView] = useState(false);
  const router = useRouter();

  const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
  const REDIRECT_URI = makeRedirectUri({
    useProxy: true,
  });

  // 구글로그인 테스트용(https://auth.expo.io/… 형태로 나와야하는데 안 나옴. 빌드 후에 가능)
  console.log("Redirect URI:", REDIRECT_URI);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
    redirectUri: REDIRECT_URI,
  });

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

          if (tokenResult.access_token) {
            console.log("Access Token:", tokenResult.access_token);

            await SecureStore.setItemAsync(
              "access_token",
              tokenResult.access_token
            );

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

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === "success") {
        const { authentication } = response;
        try {
          const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${authentication?.accessToken}`,
              },
            }
          );
          const userInfo = await userInfoResponse.json();

          console.log("Google 로그인 성공:", userInfo);
          await SecureStore.setItemAsync(
            "access_token",
            authentication?.accessToken || ""
          );
          router.replace("/(tabs)");
        } catch (e) {
          console.error("Google 유저 정보 가져오기 실패:", e);
          Alert.alert("Google 로그인 실패", "유저 정보를 가져오지 못했습니다.");
        }
      }
    };

    handleGoogleLogin();
  }, [response]);

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("Apple 로그인 성공:", credential);

      await SecureStore.setItemAsync("access_token", credential.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      if (e.code === "ERR_CANCELED") {
        console.log("Apple 로그인 취소됨");
      } else {
        console.error("Apple 로그인 실패:", e);
        Alert.alert("로그인 실패", "Apple 로그인에 실패했습니다.");
      }
    }
  };

  if (showWebView) {
    return (
      <WebView
        source={{ uri: kakaoAuthUrl }}
        incognito
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

      <Pressable
        onPress={() => promptAsync()}
        disabled={!request}
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          backgroundColor: request ? "#4285F4" : "#9bb7f4",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          구글로 로그인
        </Text>
      </Pressable>

      {Platform.OS === "ios" && (
        <Pressable
          onPress={handleAppleLogin}
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 14,
            backgroundColor: "#000",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            애플로 로그인
          </Text>
        </Pressable>
      )}
    </View>
  );
}
