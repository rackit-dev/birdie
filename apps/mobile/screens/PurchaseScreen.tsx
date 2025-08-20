import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import Modal from "react-native-modal";
import { RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

import Ionicons from "@expo/vector-icons/Ionicons";

import CustomHeader from "../components/CustomHeader";

export default function OrderPaymentScreen() {
  const [point, setPoint] = useState("1750");
  const [selectedPayment, setSelectedPayment] = useState("tosspay");
  const [normalType, setNormalType] = useState<"card" | "phone" | "vbank">(
    "card"
  );
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState("카드를 선택해 주세요");
  const [selectedCardCode, setSelectedCardCode] = useState<string | null>(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [installment, setInstallment] = useState("일시불");
  const [vbankModalVisible, setVbankModalVisible] = useState(false);
  const [selectedVbank, setSelectedVbank] = useState("은행을 선택해 주세요");

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const amount = 25000 - parseInt(point, 10); // 실제 계산에 맞춰 조정 가능

  const cardCodeMap: { [key: string]: string } = {
    BC: "361",
    KB: "381",
    현대: "367",
    삼성: "365",
    롯데: "368",
    NH: "371",
    우리: "041",
    하나SK: "374",
    새마을: "045",
    제주: "373",
    광주: "364",
    신한: "366",
    KDB: "002",
    수협: "369",
    신협: "048",
    씨티: "370",
    우체국: "071",
    K뱅크: "089",
    전북: "372",
    카카오뱅크: "090",
  };

  const cardList = [
    { display: "BC카드", codeKey: "BC" },
    { display: "KB국민카드", codeKey: "KB" },
    { display: "현대카드", codeKey: "현대" },
    { display: "삼성카드", codeKey: "삼성" },
    { display: "롯데카드", codeKey: "롯데" },
    { display: "NH채움카드", codeKey: "NH" },
    { display: "우리카드", codeKey: "우리" },
    { display: "하나카드", codeKey: "하나SK" },
    { display: "새마을금고카드", codeKey: "새마을" },
    { display: "제주카드", codeKey: "제주" },
    { display: "광주카드", codeKey: "광주" },
    { display: "신한카드", codeKey: "신한" },
    { display: "KDB산업카드", codeKey: "KDB" },
    { display: "수협카드", codeKey: "수협" },
    { display: "신협카드", codeKey: "신협" },
    { display: "씨티카드", codeKey: "씨티" },
    { display: "우체국카드", codeKey: "우체국" },
    { display: "케이뱅크카드", codeKey: "K뱅크" },
    { display: "전북카드", codeKey: "전북" },
    { display: "카카오뱅크카드", codeKey: "카카오뱅크" },
  ];

  const vbankCodeMap: { [key: string]: string } = {
    KB국민은행: "04",
    SC제일은행: "23",
    경남은행: "39",
    광주은행: "34",
    기업은행: "03",
    농협: "11",
    대구은행: "31",
    부산은행: "32",
    산업은행: "02",
    새마을금고: "45",
    수협: "07",
    신한은행: "88",
    신협: "48",
    "하나(외환)은행": "81",
    우리은행: "20",
    우체국: "71",
    전북은행: "37",
    축협: "12",
    카카오뱅크: "90",
    케이뱅크: "89",
    한국씨티은행: "27",
    토스뱅크: "92",
  };
  const vbankList = Object.keys(vbankCodeMap);

  const handlePayment = () => {
    let pg = "html5_inicis"; // KG이니시스 고정
    let pay_method = "card";
    let extraData: { [key: string]: string } = {};

    if (selectedPayment === "tosspay") {
      pay_method = "tosspay"; // 중요: 여기서 페이방식 지정
    } else if (selectedPayment === "kakaopay") {
      pay_method = "kakaopay";
    } else if (selectedPayment === "normal") {
      if (normalType === "card") {
        pay_method = "card";
        if (selectedCardCode) {
          extraData.card_code = selectedCardCode;
        }
      } else if (normalType === "phone") {
        pay_method = "phone";
      } else if (normalType === "vbank") {
        pay_method = "vbank";
        const vbankCode = vbankCodeMap[selectedVbank];
        if (vbankCode) {
          extraData.vbank_code = vbankCode;
        }
      }
    }

    const paymentData = {
      pg, // 고정: html5_inicis
      pay_method,
      digital: false,
      merchant_uid: `mid_${Date.now()}`,
      name: "디어달리아 페탈 드롭 리퀴드 블러쉬",
      amount: amount.toString(),
      buyer_name: "강지웅",
      buyer_tel: "01055482364",
      buyer_email: "jiwoong@example.com",
      app_scheme: "myapp",
      m_redirect_url: "https://your-backend.com/payment/callback",
      ...extraData,
    };

    console.log("🔵 결제 요청 데이터:", paymentData);

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
          <Text style={styles.title}>결제 수단</Text>

          {["tosspay", "kakaopay", "normal"].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioRow}
              onPress={() => setSelectedPayment(type)}
            >
              <RadioButton
                value={type}
                status={selectedPayment === type ? "checked" : "unchecked"}
                onPress={() => setSelectedPayment(type)}
              />
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
                  style={[
                    styles.selectBtn,
                    normalType === "card" && styles.selectedBtn,
                  ]}
                  onPress={() => setNormalType("card")}
                >
                  <Text>신용카드</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    normalType === "vbank" && styles.selectedBtn,
                  ]}
                  onPress={() => setNormalType("vbank")}
                >
                  <Text>무통장</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    normalType === "phone" && styles.selectedBtn,
                  ]}
                  onPress={() => setNormalType("phone")}
                >
                  <Text>휴대폰</Text>
                </TouchableOpacity>
              </View>

              {normalType === "vbank" && (
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={styles.cardSelect}
                    onPress={() => setVbankModalVisible(true)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text>{selectedVbank}</Text>
                      <Ionicons name="chevron-down" size={18} color="black" />
                    </View>
                  </TouchableOpacity>

                  <Modal
                    isVisible={vbankModalVisible}
                    onBackdropPress={() => setVbankModalVisible(false)}
                    swipeDirection="down"
                    onSwipeComplete={() => setVbankModalVisible(false)}
                    style={{ justifyContent: "flex-end", margin: 0 }}
                  >
                    <View style={[styles.modalContainer, { maxHeight: "75%" }]}>
                      <Text style={styles.title}>은행을 선택해 주세요</Text>
                      <ScrollView>
                        {vbankList.map((bank) => (
                          <TouchableOpacity
                            key={bank}
                            onPress={() => {
                              setSelectedVbank(bank);
                              setVbankModalVisible(false);
                            }}
                            style={styles.cardOption}
                          >
                            <Text style={styles.cardText}>{bank}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </Modal>
                </View>
              )}

              {normalType === "card" && (
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={styles.cardSelect}
                    onPress={() => setCardModalVisible(true)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text>{selectedCard}</Text>
                      <Ionicons name="chevron-down" size={18} color="black" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardSelect}
                    onPress={() => setShowInstallmentModal(true)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text>{installment}</Text>
                      <Ionicons name="chevron-down" size={18} color="black" />
                    </View>
                  </TouchableOpacity>
                  <Modal
                    isVisible={cardModalVisible}
                    onBackdropPress={() => setCardModalVisible(false)}
                    swipeDirection="down"
                    onSwipeComplete={() => setCardModalVisible(false)}
                    style={{ justifyContent: "flex-end", margin: 0 }}
                  >
                    <View style={[styles.modalContainer, { maxHeight: "75%" }]}>
                      <Text style={styles.title}>카드를 선택해 주세요</Text>
                      <ScrollView>
                        {cardList.map(({ display, codeKey }) => (
                          <TouchableOpacity
                            key={display}
                            onPress={() => {
                              setSelectedCard(display);
                              setSelectedCardCode(cardCodeMap[codeKey]);
                              setCardModalVisible(false);
                            }}
                            style={styles.cardOption}
                          >
                            <Text style={styles.cardText}>{display}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </Modal>

                  <Modal
                    isVisible={showInstallmentModal}
                    onBackdropPress={() => setShowInstallmentModal(false)}
                    swipeDirection="down"
                    onSwipeComplete={() => setShowInstallmentModal(false)}
                    style={{ justifyContent: "flex-end", margin: 0 }}
                  >
                    <View style={[styles.modalContainer, { maxHeight: "55%" }]}>
                      <Text style={styles.title}>
                        할부 기간을 선택해 주세요
                      </Text>
                      <ScrollView>
                        {[
                          "일시불",
                          "2개월",
                          "3개월",
                          "4개월",
                          "5개월",
                          "6개월",
                          "7개월",
                          "8개월",
                          "9개월",
                          "10개월",
                          "11개월",
                          "12개월",
                        ].map((opt) => (
                          <TouchableOpacity
                            key={opt}
                            onPress={() => {
                              setInstallment(opt);
                              setShowInstallmentModal(false);
                            }}
                            style={styles.cardOption}
                          >
                            <Text style={styles.cardText}>{opt}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </Modal>
                </View>
              )}
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
      </ScrollView>
      <TouchableOpacity style={styles.paymentBtn} onPress={handlePayment}>
        <Text style={styles.paymentBtnText}>
          {amount.toLocaleString()}원 결제하기
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
    marginTop: 6,
    alignSelf: "flex-start",
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
    marginTop: 10,
    alignSelf: "flex-start",
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
  cardSelect: {
    marginTop: 6,
    padding: 12,
    borderWidth: 1,
    marginLeft: 20,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  cardText: {
    fontSize: 18,
  },
});
