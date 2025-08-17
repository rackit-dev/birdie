import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

export default function OrderPaymentScreen() {
  const [point, setPoint] = useState("1750");
  const [selectedPayment, setSelectedPayment] = useState("tosspay");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const amount = 25000 - parseInt(point, 10); // 실제 계산에 맞춰 조정 가능

  const handlePayment = () => {
    const paymentData = {
      pg: "html5_inicis",
      pay_method: "card",
      merchant_uid: `mid_${Date.now()}`,
      name: "디어달리아 페탈 드롭 리퀴드 블러쉬",
      amount: amount.toString(),
      buyer_name: "강지웅",
      buyer_tel: "01055482364",
      buyer_email: "jiwoong@example.com",
      app_scheme: "myapp", // ← app.json의 scheme과 동일해야 함
      m_redirect_url: "https://your-backend.com/payment/callback", // 필요 시 대체
    };

    navigation.navigate("PaymentWebview", { params: paymentData });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>배송지</Text>
        <Text style={styles.name}>
          강지웅 <Text style={styles.badge}>기본 배송지</Text>
        </Text>
        <Text style={styles.text}>
          충북 청주시 서원구 모충로3번길 61 벨엘타운302호
        </Text>
        <Text style={styles.text}>010-5548-2364</Text>
        <TouchableOpacity style={styles.changeBtn}>
          <Text>배송지 변경</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>주문 상품</Text>
        <View style={styles.productBox}>
          <Image
            source={{ uri: "https://via.placeholder.com/80" }}
            style={styles.productImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>
              디어달리아 페탈 드롭 리퀴드 블러쉬
            </Text>
            <Text style={styles.option}>태피 / 1개</Text>
            <Text style={styles.price}>25,000원</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.couponBtn}>
          <Text>쿠폰 사용</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>적립금 사용</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={point}
            onChangeText={setPoint}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.cancelBtn}>
            <Text>사용 취소</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subText}>적용한도(7%) 1,750원 / 보유 5,764원</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>결제 금액</Text>
        <View style={styles.rowBetween}>
          <Text>총 상품금액</Text>
          <Text>25,000원</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text>적립금 할인</Text>
          <Text>-{point}원</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text>배송비</Text>
          <Text style={styles.free}>무료배송</Text>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>총 결제금액</Text>
          <Text style={styles.totalPrice}>{amount.toLocaleString()}원</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.paymentBtn} onPress={handlePayment}>
        <Text style={styles.paymentBtnText}>
          {amount.toLocaleString()}원 결제하기
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  name: { fontWeight: "600", fontSize: 15 },
  badge: { backgroundColor: "#eee", paddingHorizontal: 6, borderRadius: 4 },
  text: { marginVertical: 2, fontSize: 14 },
  changeBtn: { marginTop: 6, alignSelf: "flex-start" },

  productBox: { flexDirection: "row", gap: 10 },
  productImage: { width: 80, height: 80, borderRadius: 8 },
  productName: { fontWeight: "500" },
  option: { fontSize: 13, color: "#888" },
  price: { fontSize: 15, fontWeight: "bold", marginTop: 4 },
  couponBtn: { marginTop: 10, alignSelf: "flex-start" },

  row: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
  },
  cancelBtn: { marginLeft: 10 },
  subText: { fontSize: 12, color: "#888", marginTop: 4 },

  radioRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  free: { color: "#f90", fontWeight: "bold" },

  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  totalText: { fontSize: 16, fontWeight: "bold" },
  totalPrice: { fontSize: 18, fontWeight: "bold", color: "#000" },

  paymentBtn: {
    backgroundColor: "#000",
    paddingVertical: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  paymentBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
