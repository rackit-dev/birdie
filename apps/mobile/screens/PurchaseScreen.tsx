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
import Modal from "react-native-modal";
import axios from "axios";
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

type CouponDetail = {
  id: string;
  code: string;
  description: string;
  discount_type: "비율" | "정액";
  discount_rate?: number;
  discount_amount?: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  valid_until: string;
};

type CouponWallet = {
  id: string;
  coupon_id: string;
  is_used: boolean;
  created_at: string;
  updated_at: string;
  coupon?: CouponDetail | null;
};

const makePaymentId = () =>
  `mid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function OrderPaymentScreen() {
  const [point, setPoint] = useState("0");
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

  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState<
    Record<string, string | null>
  >({});
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  const [targetProductKey, setTargetProductKey] = useState<string | null>(null);

  const makeProductKey = (p: Product) =>
    `${p.id}-${p.option || ""}-${p.option_1_value || ""}-${
      p.option_2_value || ""
    }-${p.option_3_value || ""}`;

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
    (acc, product: Product) => acc + product.price * product.quantity,
    0
  );

  const groupedByBrand = products.reduce<Record<string, Product[]>>(
    (acc, product) => {
      if (!acc[product.brand]) acc[product.brand] = [];
      acc[product.brand].push(product);
      return acc;
    },
    {}
  );

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = await SecureStore.getItemAsync("session_token");
        if (!token) return;

        const res = await axios.get(`${API_URL}/coupons/wallet/by_user`, {
          params: { user_id: userId },
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("구매 페이지 쿠폰 응답:", res.data);

        const walletList: CouponWallet[] = res.data.coupon_wallets ?? [];

        const merged: CouponWallet[] = await Promise.all(
          walletList.map(async (w) => {
            try {
              const detailRes = await axios.get(`${API_URL}/coupons/by_id`, {
                params: { coupon_id: w.coupon_id },
              });
              return { ...w, coupon: detailRes.data };
            } catch (e) {
              console.error(`쿠폰 상세 불러오기 실패: ${w.coupon_id}`, e);
              return { ...w, coupon: null };
            }
          })
        );

        const available = merged.filter(
          (c) =>
            !c.is_used &&
            c.coupon &&
            new Date(c.coupon.valid_until) > new Date()
        );

        setAvailableCoupons(available);
      } catch (err) {
        console.error("구매페이지 쿠폰 불러오기 실패:", err);
        setAvailableCoupons([]);
      }
    };
    if (userId) fetchCoupons();
  }, [userId]);

  // 전체 쿠폰 할인 금액 계산
  const totalCouponDiscount = products.reduce((acc, p) => {
    const key = makeProductKey(p);
    const appliedCouponId = selectedCoupons[key];
    const appliedCoupon = availableCoupons.find(
      (c) => c.id === appliedCouponId
    );
    if (!appliedCoupon?.coupon) return acc;

    const productPrice = p.price * p.quantity;
    let discount = 0;

    if (appliedCoupon.coupon.discount_type === "비율") {
      const rate = appliedCoupon.coupon.discount_rate || 0;
      const rawDiscount = Math.floor((productPrice * rate) / 100);
      discount = appliedCoupon.coupon.max_discount_amount
        ? Math.min(rawDiscount, appliedCoupon.coupon.max_discount_amount)
        : rawDiscount;
    } else {
      discount = appliedCoupon.coupon.discount_amount || 0;
    }

    return acc + discount;
  }, 0);

  const finalAmount =
    totalProductPrice - parseInt(point, 10) - totalCouponDiscount;

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

    const couponDiscount = totalCouponDiscount;
    const finalAmount =
      totalProductPrice - parseInt(point, 10) - couponDiscount;

    const orderPayload = {
      user_id: userId,
      subtotal_price: totalProductPrice,
      coupon_discount_price: couponDiscount,
      point_discount_price: parseInt(point, 10),
      total_price: finalAmount,
      recipient_name: recipientName,
      phone_number: recipientPhone,
      zipcode,
      address_line1: addressLine1,
      address_line2: addressLine2,
      order_memo: orderMemo || "",
      items: products.map((p) => {
        const key = makeProductKey(p);
        const appliedCouponId = selectedCoupons[key];
        const appliedCoupon = availableCoupons.find(
          (c) => c.id === appliedCouponId
        );
        let couponDiscount = 0;

        if (appliedCoupon?.coupon) {
          const productPrice = p.price * p.quantity;
          if (appliedCoupon.coupon.discount_type === "비율") {
            const rate = appliedCoupon.coupon.discount_rate || 0;
            const rawDiscount = Math.floor((productPrice * rate) / 100);
            couponDiscount = appliedCoupon.coupon.max_discount_amount
              ? Math.min(rawDiscount, appliedCoupon.coupon.max_discount_amount)
              : rawDiscount;
          } else {
            couponDiscount = appliedCoupon.coupon.discount_amount || 0;
          }
        }

        const parseOption = (optionStr: string) => {
          const parts = optionStr.split("/").map((s) => s.trim());
          const result: any = {};
          parts.forEach((part, i) => {
            const [type, value] = part.split(":").map((s) => s.trim());
            result[`option_${i + 1}_type`] = type;
            result[`option_${i + 1}_value`] = value;
          });
          return result;
        };

        return {
          product_id: p.id,
          product_name: p.name,
          coupon_wallet_id: appliedCouponId,
          quantity: p.quantity,
          unit_price: p.price,
          coupon_discount_price: couponDiscount,
          point_discount_price: 0,
          final_price: p.price * p.quantity - couponDiscount,
          ...parseOption(p.option),
        };
      }),
    };
    console.log("📦 주문 payload:", JSON.stringify(orderPayload, null, 2));
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

      for (const key of Object.keys(selectedCoupons)) {
        const couponId = selectedCoupons[key];
        if (couponId) {
          try {
            await axios.put(`${API_URL}/coupons/wallet/use`, null, {
              params: { coupon_wallet_id: couponId },
            });
            console.log("쿠폰 사용 처리 완료:", couponId);
          } catch (err) {
            console.error("쿠폰 사용 처리 실패:", err);
          }
        }
      }

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
            <View key={brand}>
              {items.map((item, index) => {
                const productKey = makeProductKey(item);

                return (
                  <View
                    key={`${productKey}-${index}`}
                    style={{ marginBottom: 20 }}
                  >
                    <View style={styles.productBox}>
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
                          {(item.price * item.quantity).toLocaleString()}원
                        </Text>

                        {selectedCoupons[productKey] &&
                          (() => {
                            const selectedCoupon = availableCoupons.find(
                              (c) => c.id === selectedCoupons[productKey]
                            );
                            if (!selectedCoupon?.coupon) return null;

                            const productPrice = item.price * item.quantity;
                            let discount = 0;

                            if (
                              selectedCoupon.coupon.discount_type === "비율"
                            ) {
                              const rate =
                                selectedCoupon.coupon.discount_rate || 0;
                              const rawDiscount = Math.floor(
                                (productPrice * rate) / 100
                              );
                              discount = selectedCoupon.coupon
                                .max_discount_amount
                                ? Math.min(
                                    rawDiscount,
                                    selectedCoupon.coupon.max_discount_amount
                                  )
                                : rawDiscount;
                            } else {
                              discount =
                                selectedCoupon.coupon.discount_amount || 0;
                            }

                            const discountedPrice = Math.max(
                              productPrice - discount,
                              0
                            );

                            return (
                              <Text style={styles.discountedPrice}>
                                쿠폰 적용가: {discountedPrice.toLocaleString()}
                                원
                              </Text>
                            );
                          })()}
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={1}
                      style={styles.couponBtn}
                      onPress={() => {
                        setTargetProductKey(productKey);
                        setCouponModalVisible(true);
                      }}
                    >
                      <Text>쿠폰 사용</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
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
          <Text style={styles.subText}>0원 / 보유 0원</Text>
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

      <Modal
        isVisible={couponModalVisible}
        onBackdropPress={() => setCouponModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            maxHeight: "70%",
          }}
        >
          <Text
            style={{
              fontFamily: "P-600",
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            쿠폰 선택
          </Text>

          <TouchableOpacity
            style={[
              styles.couponBox,
              !selectedCoupons[targetProductKey!] && styles.couponBoxSelected,
            ]}
            onPress={() => {
              setSelectedCoupons((prev) => ({
                ...prev,
                [targetProductKey!]: null,
              }));
            }}
          >
            <Text style={styles.couponText}>선택 안 함</Text>
          </TouchableOpacity>

          {availableCoupons.length === 0 ? (
            <Text
              style={{ textAlign: "center", color: "#888", marginTop: 20 }}
            ></Text>
          ) : (
            availableCoupons.map((c) => {
              const targetProduct =
                products.find((p) => p.id === targetProductId) || products[0];
              const productPrice = targetProduct.price * targetProduct.quantity;

              let discountText = "";
              if (c.coupon?.discount_type === "비율") {
                const rate = c.coupon.discount_rate || 0;
                const rawDiscount = Math.floor((productPrice * rate) / 100);

                const finalDiscount = c.coupon.max_discount_amount
                  ? Math.min(rawDiscount, c.coupon.max_discount_amount)
                  : rawDiscount;

                discountText = `${finalDiscount.toLocaleString()}원 할인`;
              } else if (c.coupon?.discount_type === "정액") {
                const amount = c.coupon.discount_amount || 0;
                discountText = `${amount.toLocaleString()}원 할인`;
              }

              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.couponBox,
                    selectedCoupons[targetProductKey!] === c.id &&
                      styles.couponBoxSelected,
                    Object.values(selectedCoupons).includes(c.id) &&
                      selectedCoupons[targetProductKey!] !== c.id && {
                        opacity: 0.4,
                      },
                  ]}
                  disabled={
                    Object.values(selectedCoupons).includes(c.id) &&
                    selectedCoupons[targetProductKey!] !== c.id
                  }
                  onPress={() => {
                    if (
                      Object.values(selectedCoupons).includes(c.id) &&
                      selectedCoupons[targetProductKey!] !== c.id
                    ) {
                      alert("이미 다른 상품에 적용된 쿠폰입니다.");
                      return;
                    }

                    setSelectedCoupons((prev) => ({
                      ...prev,
                      [targetProductKey!]: c.id,
                    }));
                  }}
                >
                  <Text style={styles.couponText}>
                    {c.coupon?.description ?? "쿠폰"}
                  </Text>
                  <Text style={styles.couponSubText}>{discountText}</Text>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity
            style={{
              marginTop: 16,
              padding: 12,
              alignItems: "center",
              borderRadius: 8,
              backgroundColor: "#000",
            }}
            onPress={() => {
              console.log("선택된 쿠폰:", selectedCoupons[targetProductKey!]);

              setCouponModalVisible(false);
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: "P-600",
                padding: 4,
                fontSize: 16,
              }}
            >
              선택 쿠폰 사용하기
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    marginTop: 5,
  },
  couponBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  couponBoxSelected: {
    borderColor: "#000",
  },
  couponText: {
    fontSize: 15,
    fontWeight: "500",
  },
  couponSubText: {
    fontSize: 13,
    color: "#555",
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
  discountedPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF2D55",
    marginTop: 4,
  },
});
