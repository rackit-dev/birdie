import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Payment } from "@portone/react-native-sdk";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";

import CustomHeader from "../../components/CustomHeader";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentWebview">;

export default function PaymentWebviewScreen() {
  const navigation = useNavigation<Props["navigation"]>();
  const route = useRoute<Props["route"]>();
  const request = route.params.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerOverlay}>
        <CustomHeader
          showBackButton
          onPressBack={() =>
            navigation.replace("PaymentResult", {
              success: false,
              message: "사용자가 결제를 취소했습니다.",
            })
          }
        />
      </View>

      <View style={styles.paymentWrap}>
        <Payment
          request={request}
          onComplete={(result) => {
            console.log("COMPLETE ←", JSON.stringify(result, null, 2));
            navigation.replace("PaymentResult", { ...result, success: true });
          }}
          onError={(err) => {
            const message = (err as Error)?.message ?? "결제 오류";
            navigation.replace("PaymentResult", {
              success: false,
              message,
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: "transparent",
  },

  paymentWrap: {
    flex: 1,
  },
});
