import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import CustomHeader from "../../components/CustomHeader";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentResult">;

export default function PaymentResultScreen() {
  const navigation = useNavigation<Props["navigation"]>();
  const route = useRoute<Props["route"]>();

  const { success, code, message, paymentId, orderId } = route.params ?? {};

  const isSuccess =
    (typeof success === "boolean" ? success : success === "true") ??
    (code == null && message == null);

  const title = isSuccess ? "결제가 완료되었어요" : "결제가 실패했어요";
  const leadIcon = isSuccess ? "✅" : "⚠️";

  const description = isSuccess
    ? ([
        "결제가 정상적으로 처리되었습니다.",
        "영수증/주문 내역은 주문 상세에서 확인할 수 있습니다.",
      ].filter(Boolean) as string[])
    : ([
        "결제가 실패하였거나 취소되었습니다.",
        // `사유: ${message ?? "알 수 없는 오류"}`,
        // code ? `에러코드: ${code}` : undefined,
        "문제가 계속 발생하면 고객센터로 문의해 주세요.",
      ].filter(Boolean) as string[]);

  return (
    <View style={styles.safe}>
      <CustomHeader
        showBackButton
        onPressBack={() => navigation.goBack()}
        onPressHome={() => navigation.navigate("Main")}
      />
      <View style={styles.container}>
        <Text accessibilityRole="image" style={styles.icon}>
          {leadIcon}
        </Text>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.descriptionWrap}>
          {description.map((line, idx) => (
            <Text key={idx} style={styles.description} numberOfLines={2}>
              {line}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: Platform.select({ ios: "700", android: "700" }),
    letterSpacing: -0.2,
    color: "#111827",
    marginBottom: 8,
  },
  descriptionWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    textAlign: "center",
  },
});
