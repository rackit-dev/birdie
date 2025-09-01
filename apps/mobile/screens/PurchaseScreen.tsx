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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

import CustomHeader from "../components/CustomHeader";

export default function OrderPaymentScreen() {
  const [point, setPoint] = useState("1750");
  const [selectedPayment, setSelectedPayment] = useState("tosspay");
  const [normalType, setNormalType] = useState<"card" | "phone" | "vbank">(
    "card"
  );
  const formatName = (name: string) => name.replace(/_/g, " ");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Purchase">>();
  const products = route.params.products;

  const totalProductPrice = products.reduce(
    (acc, product) => acc + product.price,
    0
  );
  const finalAmount = totalProductPrice - parseInt(point, 10);

  const groupedByBrand = products.reduce((acc, product) => {
    if (!acc[product.brand]) {
      acc[product.brand] = [];
    }
    acc[product.brand].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const handlePayment = () => {
    let pg = "html5_inicis";
    let pay_method = "card";
    let extraData: { [key: string]: string } = {};

    if (selectedPayment === "tosspay") {
      pay_method = "tosspay";
    } else if (selectedPayment === "kakaopay") {
      pay_method = "kakaopay";
    } else if (selectedPayment === "normal") {
      if (normalType === "card") {
        pay_method = "card";
      } else if (normalType === "phone") {
        pay_method = "phone";
      }
    }

    const paymentData = {
      pg,
      pay_method,
      digital: false,
      merchant_uid: `mid_${Date.now()}`,
      name: `${products.length}개 상품`,
      amount: "2000",
      // amount: finalAmount.toString(),
      buyer_name: "강지웅",
      buyer_tel: "01099999999",
      buyer_email: "jiwoong@example.com",
      app_scheme: "myapp",
      m_redirect_url: "https://example.com", // 실제 앱 배포시엔 이 주소가 백엔드 or 앱딥링크 처리 페이지여야함
      ...extraData,
    };

    navigation.navigate("PaymentWebview", { params: paymentData });
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="주문/결제"
        showBackButton
        onPressBack={() => navigation.goBack()}
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.section}>
          <Text style={styles.title}>배송지</Text>
          <Text style={styles.name}>
            강지웅 <Text style={styles.badge}>기본 배송지</Text>
          </Text>
          <Text style={styles.text}>
            충북 청주시 서원구 모충로3번길 61 벨엘타운302호
          </Text>
          <Text style={styles.text}>010-5548-2364</Text>
          <TouchableOpacity activeOpacity={1} style={styles.changeBtn}>
            <Text>배송지 변경</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>주문 상품 {products.length}개</Text>
          {Object.entries(groupedByBrand).map(([brand, items]) => (
            <View key={brand}>
              {items.map((item, index) => (
                <View
                  key={`${item.name}-${item.option}-${index}`}
                  style={[styles.productBox, { marginBottom: 10 }]}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{brand}</Text>
                    <Text style={styles.option}>
                      {formatName(item.name)} {"\n"}
                      {item.option} / {item.quantity}개
                    </Text>
                    <Text style={styles.price}>
                      {item.price.toLocaleString()}원
                    </Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity activeOpacity={1} style={styles.couponBtn}>
                <Text>쿠폰 사용</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>결제 수단</Text>

          {["tosspay", "kakaopay", "normal"].map((type) => (
            <TouchableOpacity
              activeOpacity={1}
              key={type}
              style={styles.radioRow}
              onPress={() => setSelectedPayment(type)}
            >
              <View style={styles.customRadio}>
                {selectedPayment === type && <View style={styles.radioInner} />}
              </View>
              {type === "tosspay" && (
                <View style={styles.row}>
                  <Image
                    source={require("../assets/images/logos/Toss_Logo_Alternative.png")}
                    style={styles.tossIcon}
                  />
                  <Text>토스페이</Text>
                </View>
              )}

              {type === "kakaopay" && (
                <View style={styles.row}>
                  <Image
                    source={require("../assets/images/logos/payment_icon_yellow_small.png")}
                    style={styles.kakaoIcon}
                  />
                  <Text>카카오페이</Text>
                </View>
              )}
              {type === "normal" && <Text>다른 결제 수단</Text>}
            </TouchableOpacity>
          ))}
          {selectedPayment === "normal" && (
            <View style={{ marginTop: 10 }}>
              <View style={styles.row}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    styles.selectBtn,
                    normalType === "card" && styles.selectedBtn,
                  ]}
                  onPress={() => setNormalType("card")}
                >
                  <Text>신용카드</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    styles.selectBtn,
                    normalType === "phone" && styles.selectedBtn,
                  ]}
                  onPress={() => setNormalType("phone")}
                >
                  <Text>휴대폰</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
          <Text style={styles.subText}>
            적용한도(7%) 1,750원 / 보유 5,764원
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>결제 금액</Text>
          <View style={styles.rowBetween}>
            <Text>총 상품금액</Text>
            <Text>{totalProductPrice.toLocaleString()}원</Text>
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
            <Text style={styles.totalPrice}>
              {finalAmount.toLocaleString()}원
            </Text>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.paymentBtn} onPress={handlePayment}>
        <Text style={styles.paymentBtnText}>
          {finalAmount.toLocaleString()}원 결제하기
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    padding: 16,
    borderBottomWidth: 10,
    borderBottomColor: "#f5f5f5ff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },
  name: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 6,
  },
  badge: {
    backgroundColor: "#eee",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  text: {
    marginVertical: 2,
    fontSize: 14,
  },
  changeBtn: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  productBox: {
    flexDirection: "row",
    gap: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productName: {
    fontWeight: "500",
  },
  option: {
    fontSize: 13,
    color: "#888",
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
  },
  couponBtn: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
  },
  cancelBtn: {
    marginLeft: 10,
  },
  subText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    minHeight: 40,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  free: {
    color: "#f90",
    fontWeight: "bold",
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  paymentBtn: {
    backgroundColor: "#000",
    paddingVertical: 16,
    margin: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  paymentBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  badgeNew: {
    backgroundColor: "#ffeef0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: "#ff3b30",
    fontSize: 10,
    fontWeight: "bold",
  },
  tossIcon: {
    width: 45,
    height: 37,
    marginRight: 6,
  },
  kakaoIcon: {
    width: 45,
    height: 18.2,
    marginRight: 6,
    resizeMode: "contain",
  },
  selectBtn: {
    flex: 1,
    padding: 13,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginLeft: 20,
    marginRight: 3,
    marginTop: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBtn: {
    borderColor: "#000",
    backgroundColor: "#eee",
  },
  customRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
});
