import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import * as SecureStore from "expo-secure-store";

import CustomHeader from "../components/CustomHeader";
import AddressListModal from "./AddressListModal";
import AddressAddModal from "./AddressAddModal";

const STORE_ID = "store-3048375f-0af1-4793-82f8-83b099967e2e";
const CH_KG = "channel-key-2d2b34cc-a56c-47df-8ffd-bbe0e2a47dad";
const CH_KAKAO = "channel-key-75f610e0-fff1-44a4-994b-22b0411a6fba";
const CH_TOSS = "channel-key-c5c6f532-1da0-4195-bd88-50f20697c8d0";

type PurchaseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Purchase"
>;

type Product = RootStackParamList["Purchase"]["products"][number];

const makePaymentId = () =>
  `mid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function OrderPaymentScreen() {
  const [point, setPoint] = useState("1750");
  const [selectedPayment, setSelectedPayment] = useState("tosspay");
  const [normalType, setNormalType] = useState<"card" | "phone">("card");

  const [userId, setUserId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [addressLine1, setAddressLine1] = useState<string | null>(null);
  const [addressLine2, setAddressLine2] = useState<string | null>(null);
  const [zipcode, setZipcode] = useState<string | null>(null);
  const [recipientPhone, setRecipientPhone] = useState<string | null>(null);
  const [orderMemo, setOrderMemo] = useState<string | null>(null);

  const [showListModal, setShowListModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const formatName = (name: string) => name.replace(/_/g, " ");
  const navigation = useNavigation<PurchaseScreenProps["navigation"]>();
  const route = useRoute<PurchaseScreenProps["route"]>();
  const products = (route.params?.products || []) as Product[];

  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("session_token");
        if (!token) throw new Error("로그인 토큰 없음");

        const res = await fetch(`${API_URL}/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`유저 API 실패 (status ${res.status})`);
        }

        const data = await res.json();
        setUserId(data.id);
        setRecipientName(data.name);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };
    fetchUser();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = await SecureStore.getItemAsync("session_token");
      if (!token) {
        console.error("토큰 없음");
        return;
      }

      const res = await fetch(`${API_URL}/users/user_address`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 토큰 넣기
        },
      });

      if (!res.ok) throw new Error("주소 API 호출 실패");

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const firstAddr = data[0]; // 첫 번째 주소 사용
        setRecipientName(firstAddr.recipient_name);
        setRecipientPhone(firstAddr.phone_number);
        setAddressLine1(firstAddr.address_line1);
        setAddressLine2(firstAddr.address_line2 || "");
        setZipcode(firstAddr.zipcode);
        setOrderMemo(firstAddr.order_memo);
      } else {
        setRecipientName(null);
        setRecipientPhone(null);
        setAddressLine1(null);
        setAddressLine2(null);
        setZipcode(null);
        setOrderMemo(null);
      }
    } catch (err) {
      console.error("배송지 불러오기 실패:", err);
    }
  };

  // 페이지 포커스될 때마다 새로 불러오기
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const totalProductPrice = products.reduce<number>(
    (acc: number, product: Product) => acc + product.price,
    0
  );
  const finalAmount = totalProductPrice - parseInt(point, 10);

  const groupedByBrand = products.reduce<Record<string, Product[]>>(
    (acc, product) => {
      if (!acc[product.brand]) acc[product.brand] = [];
      acc[product.brand].push(product);
      return acc;
    },
    {}
  );

  const handlePayment = async () => {
    const { channelKey, payMethod } = (() => {
      if (selectedPayment === "kakaopay") {
        return { channelKey: CH_KAKAO, payMethod: "EASY_PAY" as const };
      }
      if (selectedPayment === "tosspay") {
        return { channelKey: CH_TOSS, payMethod: "EASY_PAY" as const };
      }
      return {
        channelKey: CH_KG,
        payMethod:
          normalType === "card" ? ("CARD" as const) : ("MOBILE" as const),
      };
    })();

    const productType =
      payMethod === "MOBILE" ? ("PRODUCT_TYPE_REAL" as const) : undefined;

    const orderPayload = {
      user_id: userId,
      subtotal_price: totalProductPrice,
      coupon_discount_price: 0,
      point_discount_price: parseInt(point, 10),
      total_price: finalAmount,
      recipient_name: recipientName,
      phone_number: recipientPhone,
      zipcode,
      address_line1: addressLine1,
      address_line2: addressLine2,
      order_memo: orderMemo || "",
      items: products.map((p) => ({
        product_id: p.id,
        coupon_wallet_id: null,
        quantity: p.quantity,
        unit_price: p.price,
        coupon_discount_price: 0,
        point_discount_price: 0,
        final_price: p.price * p.quantity,
      })),
    };

    try {
      const token = await SecureStore.getItemAsync("session_token");
      if (!token) throw new Error("로그인 토큰 없음");

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`주문 생성 실패 (status ${res.status}): ${errText}`);
      }

      const orderData = await res.json();
      console.log("주문 생성 성공:", orderData);

      const request = {
        storeId: STORE_ID,
        channelKey,
        paymentId: makePaymentId(),
        orderName: `${products.length}개 상품`,
        totalAmount: finalAmount,
        currency: "KRW",
        payMethod,
        ...(productType ? { productType } : {}),
        customData: orderData.id,
        noticeUrls: [`${API_URL}/orders/payment/webhook`],
      } as const;

      navigation.navigate("PaymentWebview", { params: request });
    } catch (err) {
      console.error("결제 처리 중 오류:", err);
      alert("주문 생성 중 문제가 발생했습니다.");
    }
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
          {!recipientName ? (
            <View style={{ alignItems: "center", marginVertical: 20 }}>
              <Text style={{ color: "#999", marginBottom: 10 }}>
                등록된 배송지가 없습니다.
              </Text>
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Text>배송지 추가</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.addressBox}>
                <Text style={styles.name}>{recipientName}</Text>
                <Text style={styles.text}>
                  {recipientName} · {recipientPhone}
                </Text>
                <Text style={styles.text}>
                  [{zipcode}] {addressLine1} {addressLine2}
                </Text>
                {orderMemo ? (
                  <Text style={[styles.text, { color: "#666" }]}>
                    배송 메모: {orderMemo}
                  </Text>
                ) : (
                  <Text style={[styles.text, { color: "#aaa" }]}>
                    배송 메모가 없습니다.
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.changeBtn}
                  onPress={() => setShowListModal(true)}
                >
                  <Text>배송지 변경</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>주문 상품 {products.length}개</Text>
          {Object.entries(groupedByBrand).map(([brand, items]) => (
            <View style={styles.title} key={brand}>
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

      <AddressListModal
        visible={showListModal}
        onClose={() => setShowListModal(false)}
        onSelect={(addr) => {
          setRecipientName(addr.recipient_name);
          setRecipientPhone(addr.phone_number);
          setAddressLine1(addr.address_line1);
          setAddressLine2(addr.address_line2 || "");
          setZipcode(addr.zipcode);
          setOrderMemo(addr.order_memo || "");
          setShowListModal(false);
        }}
        onAdd={() => {
          setShowListModal(false);
          setShowAddModal(true);
        }}
      />
      <AddressAddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => {
          fetchAddresses();
        }}
      />
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
    fontFamily: "P-600",
    marginBottom: 14,
  },
  addressBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
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
  postcodeHeader: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontFamily: "P-Medium",
    fontSize: 20,
  },
  headerClose: {
    fontSize: 25,
  },
});
