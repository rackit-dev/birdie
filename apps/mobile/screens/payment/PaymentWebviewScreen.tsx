import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Payment } from "@portone/react-native-sdk";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentWebview">;

export default function PaymentWebviewScreen() {
  const navigation = useNavigation<Props["navigation"]>();
  const route = useRoute<Props["route"]>();
  const request = route.params.params;

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <Payment
        request={request}
        onComplete={(result) => {
          console.log("COMPLETE ←", JSON.stringify(result, null, 2));
          navigation.replace("PaymentResult", { ...result, success: true });
        }}
        onError={(err) => {
          // console.log("ERROR ←", err);
          const message = (err as Error)?.message ?? "결제 오류";
          navigation.replace("PaymentResult", { success: false, message });
        }}
      />
    </SafeAreaView>
  );
}
