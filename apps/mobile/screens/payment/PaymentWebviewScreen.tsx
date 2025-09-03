import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import IMP from "iamport-react-native";
import Loading from "../payment/PaymentLoading"; // 필요시 직접 작성
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type PaymentWebviewScreenRouteProp = RouteProp<
  RootStackParamList,
  "PaymentWebview"
>;
type PaymentWebviewScreenNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "PaymentWebview"
>;

export default function PaymentWebviewScreen() {
  const navigation = useNavigation<PaymentWebviewScreenNavProp>();
  const route = useRoute<PaymentWebviewScreenRouteProp>();
  const rawParams = route.params.params;
  const userCode = "imp83677210"; // 아임포트 기본 테스트 코드
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <IMP.Payment
        userCode={userCode}
        data={{
          ...rawParams,
          notice_url: rawParams?.notice_url ?? `${API_URL}/orders/payment/test`,
        }}
        loading={<Loading />}
        callback={(response) => {
          navigation.replace("PaymentResult", response);
        }}
      />
    </SafeAreaView>
  );
}
