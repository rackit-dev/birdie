import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  Platform,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as AppleAuthentication from "expo-apple-authentication";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";
import { login } from "@react-native-seoul/kakao-login";
import * as GoogleAuth from "expo-auth-session/providers/google";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useUserIdStore } from "../store/useUserIdStore";
import axios from "axios";
import {
  API_URL,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from "@env";
import CustomHeader from "../components/CustomHeader";

const AUTH_ENDPOINT = `${API_URL}/users/social-login`;

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function exchangeWithServer(
    provider: "KAKAO" | "GOOGLE" | "APPLE",
    token: string
  ) {
    const endpoint = AUTH_ENDPOINT;

    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=password&username=${encodeURIComponent(
        provider
      )}&password=${encodeURIComponent(token)}`,
    });

    const raw = await r.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {}

    if (r.status === 422) {
      throw new Error("탈퇴한 회원은 탈퇴일로부터 30일 이후 재가입 가능");
    }

    const sessionToken = data.sessionToken || data.token || data.access_token;

    if (!r.ok || !sessionToken) {
      throw new Error(data?.error || `세션 발급 실패 (status ${r.status})`);
    }

    await SecureStore.setItemAsync("session_token", sessionToken);

    try {
      const profileRes = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const profile = profileRes.data;

      useUserIdStore.getState().setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
      });
    } catch (err) {
      console.error("프로필 불러오기 실패:", err);
    }

    return sessionToken as string;
  }

  // 일반 로그인 처리
  const handleNormalLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
    }

    try {
      const r = await axios.post(
        `${API_URL}/users/login`,
        {
          username: email,
          password: password,
        },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const token =
        r.data?.token || r.data?.access_token || r.data?.sessionToken;
      if (!token) throw new Error("토큰 없음");

      await SecureStore.setItemAsync("session_token", token);

      const profileRes = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      useUserIdStore.getState().setUser({
        id: profileRes.data.id,
        name: profileRes.data.name,
        email: profileRes.data.email,
      });

      navigation.replace("Main");
    } catch (err: any) {
      Alert.alert(
        "로그인 실패",
        err?.response?.data?.detail ??
          "이메일 또는 비밀번호가 올바르지 않습니다."
      );
    }
  };

  /* --------------------------
   GOOGLE 로그인 (iOS)
  --------------------------- */
  const [request, response, promptAsync] = GoogleAuth.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    if (response?.type !== "success") return;

    const accessToken = response.authentication?.accessToken ?? "";

    exchangeWithServer("GOOGLE", accessToken)
      .then(() => navigation.replace("Main"))
      .catch((e) =>
        Alert.alert("Google 로그인 실패", e?.message ?? "서버 교환 실패")
      );
  }, [response]);

  /* --------------------------
   Google Android
  --------------------------- */
  useEffect(() => {
    if (Platform.OS === "android") {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      if (Platform.OS === "ios") return promptAsync();

      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.idToken ?? result.data?.idToken ?? null;

      if (!idToken) throw new Error("Google idToken 없음");

      await exchangeWithServer("GOOGLE", `idToken:${idToken}`);
      navigation.replace("Main");
    } catch (e: any) {
      Alert.alert("Google 로그인 실패", e?.message ?? "로그인 실패");
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const { accessToken } = await login();

      await exchangeWithServer("KAKAO", accessToken);
      navigation.replace("Main");
    } catch (e: any) {
      if (e?.code === "E_CANCELLED_OPERATION") return;

      Alert.alert(
        "카카오 로그인 실패",
        e?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const idToken = credential.identityToken ?? "";

      await exchangeWithServer("APPLE", idToken);
      navigation.replace("Main");
    } catch (e: any) {
      if (e?.code === "ERR_CANCELED") return;
      Alert.alert("애플 로그인 실패", e?.message ?? "서버 교환 실패");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <CustomHeader
          showBackButton={true}
          onPressBack={() => navigation.goBack()}
          onPressHome={() => navigation.navigate("Main")}
        />

        <View style={styles.container}>
          <View style={{ marginBottom: 120, alignSelf: "flex-start" }}>
            <Text style={styles.appDescription}>신발부터 라켓까지,</Text>
            <Text style={styles.appDescription}>배드민턴 올인원 쇼핑몰</Text>
            <Text style={styles.appName}>영스배드민턴</Text>
          </View>

          {/* ---------------- 일반 로그인 입력칸 ---------------- */}
          <TextInput
            placeholder="이메일"
            placeholderTextColor="#c7c7c7"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#c7c7c7"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.loginBtn} onPress={handleNormalLogin}>
            <Text style={styles.loginBtnText}>로그인</Text>
          </Pressable>

          {/* ---------------- 소셜 로그인 ---------------- */}
          <Text style={styles.snsCaption}>SNS 계정으로 간편 가입하기</Text>
          <View style={styles.snsRow}>
            <Pressable
              onPress={handleKakaoLogin}
              style={[styles.circleBtn, { backgroundColor: "#FEE500" }]}
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
              </Svg>
            </Pressable>

            {Platform.OS === "ios" && (
              <Pressable
                onPress={handleAppleLogin}
                style={[styles.circleBtn, { backgroundColor: "#000" }]}
              >
                <Text style={{ color: "#fff", fontSize: 30 }}></Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleGoogleLogin}
              style={[styles.circleBtn, { backgroundColor: "#e8e8e8" }]}
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
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 35,
    paddingTop: 50,
  },
  appDescription: {
    fontFamily: "P-500",
    fontSize: 24,
    textAlign: "left",
  },
  appName: {
    fontFamily: "P-600",
    fontSize: 45,
    marginTop: 6,
  },
  input: {
    width: "100%",
    height: 55,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 14,
  },
  loginBtn: {
    width: "100%",
    height: 55,
    backgroundColor: "black",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 28,
  },
  loginBtnText: {
    fontFamily: "P-600",
    fontSize: 18,
    color: "#fff",
  },
  snsCaption: {
    fontFamily: "P-500",
    fontSize: 14,
    color: "#bbbbbb",
    textAlign: "center",
    marginBottom: 16,
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
