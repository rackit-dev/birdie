import { View, StyleSheet, Text, Pressable, Alert } from "react-native";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";
import { login } from "@react-native-seoul/kakao-login";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
const AUTH_ENDPOINT = `${API_BASE}/users/social-login`;

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  async function exchangeWithServer(
    provider: "KAKAO" | "GOOGLE" | "APPLE",
    token: string
  ) {
    const r = await fetch(AUTH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(
        provider
      )}&password=${encodeURIComponent(token)}`,
    });

    const raw = await r.text();
    console.log("status", r.status, "raw", raw);

    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {}

    // 서버 응답 키가 'sessionToken' 또는 'token' 등 다를 수 있으니 유연하게
    const sessionToken = data.sessionToken || data.token || data.access_token;

    if (!r.ok || !sessionToken) {
      throw new Error(data?.error || `세션 발급 실패 (status ${r.status})`);
    }
    return sessionToken as string;
  }

  // 카카오
  const handleKakaoLogin = async () => {
    try {
      const { accessToken } = await login();
      // console.log("kakao accessToken", accessToken);
      const sessionToken = await exchangeWithServer("KAKAO", accessToken);
      await SecureStore.setItemAsync("session_token", sessionToken);
      navigation.replace("Main");
    } catch (e: any) {
      if (e?.code === "E_CANCELLED_OPERATION") return;

      Alert.alert(
        "카카오 로그인 실패",
        e?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  // 구글
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
  });

  useEffect(() => {
    const go = async () => {
      if (response?.type !== "success") return;
      try {
        const accessToken = response.authentication?.accessToken ?? "";
        // console.log("google accessToken", accessToken);
        const sessionToken = await exchangeWithServer("GOOGLE", accessToken);
        await SecureStore.setItemAsync("session_token", sessionToken);
        navigation.replace("Main");
      } catch (e: any) {
        Alert.alert("Google 로그인 실패", e?.message ?? "서버 교환 실패");
      }
    };
    go();
  }, [response]);

  // 애플
  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const idToken = credential.identityToken ?? ""; // JWT
      const sessionToken = await exchangeWithServer("APPLE", idToken);
      await SecureStore.setItemAsync("session_token", sessionToken);
      navigation.replace("Main");
    } catch (e: any) {
      if (e?.code === "ERR_CANCELED") return;
      Alert.alert("애플 로그인 실패", e?.message ?? "서버 교환 실패");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appDescription}>신발부터 라켓까지,</Text>
      <Text style={styles.appDescription}>배드민턴 올인원 쇼핑몰</Text>
      <Text style={styles.appName}>영스배드민턴</Text>
      <View style={{ flex: 0.55 }} />

      <Text style={styles.snsCaption}>SNS 계정으로 간편 가입하기</Text>
      <View style={styles.snsRow}>
        {/* 카카오 */}
        <Pressable
          onPress={handleKakaoLogin}
          style={[styles.circleBtn, { backgroundColor: "#FEE500" }]}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
        >
          <Svg width={22} height={22} viewBox="0 0 18 18" fill="none">
            <G clipPath="url(#clip0_114_6)">
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.00004 0.476132C4.02919 0.476132 1.8e-05 3.60553 1.8e-05 7.46512C1.8e-05 9.86547 1.55842 11.9815 3.93154 13.2401L2.93305 16.9069C2.84483 17.2309 3.21343 17.4892 3.49648 17.3014L7.87336 14.3974C8.24272 14.4333 8.61809 14.4542 9.00004 14.4542C13.9705 14.4542 17.9999 11.3249 17.9999 7.46512C17.9999 3.60553 13.9705 0.476132 9.00004 0.476132"
                fill="black"
              />
            </G>
            <Defs>
              <ClipPath id="clip0_114_6">
                <Rect width={18} height={18} fill="white" />
              </ClipPath>
            </Defs>
          </Svg>
        </Pressable>

        {/* 애플 */}
        <Pressable
          onPress={handleAppleLogin}
          style={[styles.circleBtn, { backgroundColor: "#000" }]}
          android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: true }}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M21.2807 18.424C20.9329 19.2275 20.5211 19.9672 20.0441 20.6472C19.3939 21.5743 18.8615 22.216 18.4512 22.5724C17.8152 23.1573 17.1337 23.4568 16.404 23.4739C15.8801 23.4739 15.2483 23.3248 14.5129 23.0224C13.7751 22.7214 13.097 22.5724 12.4771 22.5724C11.8268 22.5724 11.1295 22.7214 10.3836 23.0224C9.6365 23.3248 9.03469 23.4824 8.57456 23.498C7.87478 23.5278 7.17728 23.2197 6.48105 22.5724C6.03669 22.1848 5.48087 21.5204 4.81503 20.5791C4.10063 19.5739 3.51329 18.4084 3.05317 17.0795C2.56038 15.6442 2.31335 14.2543 2.31335 12.9087C2.31335 11.3673 2.64642 10.0379 3.31354 8.92385C3.83784 8.029 4.53534 7.32312 5.40832 6.80493C6.2813 6.28674 7.22456 6.02267 8.24036 6.00578C8.79618 6.00578 9.52506 6.1777 10.4308 6.51559C11.334 6.85462 11.914 7.02655 12.1683 7.02655C12.3584 7.02655 13.0026 6.82552 14.0948 6.42473C15.1277 6.05305 15.9994 5.89916 16.7135 5.95978C18.6485 6.11595 20.1023 6.87876 21.0691 8.25303C19.3385 9.30163 18.4824 10.7703 18.4995 12.6544C18.5151 14.122 19.0475 15.3432 20.0938 16.3129C20.568 16.7629 21.0975 17.1107 21.6867 17.3578C21.5589 17.7283 21.4241 18.0832 21.2807 18.424V18.424ZM16.8427 0.960131C16.8427 2.11039 16.4224 3.18439 15.5848 4.17847C14.574 5.36023 13.3513 6.04311 12.0254 5.93536C12.0086 5.79736 11.9988 5.65213 11.9988 5.49951C11.9988 4.39526 12.4795 3.21349 13.3331 2.24724C13.7593 1.75801 14.3014 1.35122 14.9587 1.02671C15.6146 0.707053 16.235 0.530273 16.8185 0.5C16.8356 0.653772 16.8427 0.807554 16.8427 0.960116V0.960131Z"
              fill="white"
            />
          </Svg>
        </Pressable>

        {/* 구글 */}
        <Pressable
          onPress={() => promptAsync()}
          disabled={!request}
          style={[
            styles.circleBtn,
            { backgroundColor: "#ebeaeaff", opacity: request ? 1 : 0.5 },
          ]}
          android_ripple={{
            color: "rgba(230, 230, 230, 0.08)",
            borderless: true,
          }}
        >
          <Svg width={22} height={22} viewBox="0 0 18 18" fill="none">
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.64 9.20468C17.64 8.5665 17.5827 7.95286 17.4764 7.36377H9V10.8451H13.8436C13.635 11.9701 13.0009 12.9233 12.0477 13.5615V15.8197H14.9564C16.6582 14.2529 17.64 11.9456 17.64 9.20468Z"
              fill="#4285F4"
            />
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
              fill="#34A853"
            />
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40664 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z"
              fill="#FBBC05"
            />
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
              fill="#EA4335"
            />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 35,
  },
  appDescription: {
    fontFamily: "P-medium",
    fontSize: 24,
    alignSelf: "flex-start",
    textAlign: "left",
  },
  appName: {
    fontFamily: "P-Bold",
    fontSize: 45,
    alignSelf: "flex-start",
    textAlign: "left",
    marginTop: 10,
  },
  snsCaption: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    color: "#bbbbbbff",
    textAlign: "center",
    alignSelf: "center",
  },
  snsRow: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  circleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
