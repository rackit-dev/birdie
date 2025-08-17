import React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

type PaymentResultScreenRouteProp = RouteProp<
  RootStackParamList,
  "PaymentResult"
>;
type PaymentResultScreenNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "PaymentResult"
>;

function getBoolean(value: any): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return undefined;
}

export default function PaymentResultScreen() {
  const navigation = useNavigation<PaymentResultScreenNavProp>();
  const route = useRoute<PaymentResultScreenRouteProp>();
  const { imp_success, success, imp_uid, merchant_uid, error_msg, error_code } =
    route.params ?? {};

  const isSuccess =
    getBoolean(imp_success) ??
    getBoolean(success) ??
    (error_code == null && error_msg == null);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        결제 {isSuccess ? "성공" : "실패"}하였습니다
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text>아임포트 UID: {imp_uid ?? "-"}</Text>
        <Text>주문번호: {merchant_uid ?? "-"}</Text>
        {!isSuccess && (
          <>
            <Text>에러코드: {error_code ?? "-"}</Text>
            <Text>에러메시지: {error_msg ?? "-"}</Text>
          </>
        )}
      </View>

      <Button
        title="홈으로 돌아가기"
        onPress={() => navigation.navigate("Main")}
      />
    </View>
  );
}
