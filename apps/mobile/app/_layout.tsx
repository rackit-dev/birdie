import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, Link } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { View, Text, Pressable } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { customFonts } from "@/constants/Fonts";
import * as AuthSession from "expo-auth-session";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "login",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    ...customFonts,
    ...FontAwesome.font,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="cart"
          options={{
            title: "",
            headerLeft: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Link href="/(tabs)" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <Ionicons
                        name="chevron-back-outline"
                        size={29}
                        color={Colors["light"].text}
                        style={{ opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "P-Bold",
                    color: Colors["light"].text,
                    marginLeft: 8,
                  }}
                >
                  장바구니
                </Text>
                <View style={{ width: 20 }} />
              </View>
            ),
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const redirectUri = `https://auth.expo.io/@ung26/mobile`;

  const discovery = {
    authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
    tokenEndpoint: "https://kauth.kakao.com/oauth/token",
  };

  const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KAKAO_REST_API_KEY,
      scopes: [],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success" && response.params?.code) {
      const authorizationCode = response.params.code;
      console.log("카카오 인증 성공, Authorization Code:", authorizationCode);

      // TODO: authorizationCode를 백엔드로 보내서 accessToken 받아야 함
      onLogin();
    } else if (response?.type === "error") {
      console.error("카카오 인증 에러:", response.error);
    }
  }, [response]);

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

      {/* TODO: 카카오 로그인 버튼 */}
      <Pressable
        onPress={() => promptAsync()}
        disabled={!request}
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

      {/* TODO: 구글 로그인 버튼 (나중에 연결 예정) */}
      <Pressable
        onPress={onLogin}
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          backgroundColor: "#4285F4",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          Google로 로그인
        </Text>
      </Pressable>

      {/* 네이버 로그인 버튼 (나중에 연결 예정) */}
      <Pressable
        onPress={onLogin}
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          backgroundColor: "#03C75A",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          네이버로 로그인
        </Text>
      </Pressable>
    </View>
  );
}
