import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { useLocalSearchParams, Link, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";

const TABS = ["정보", "추천", "후기", "문의"];
const OPTIONS = ["230mm", "240mm", "250mm", "260mm", "270mm", "280mm"];
const mockQnA = [
  {
    category: "상품상세문의",
    title: "끊어짐",
    content: "우포스 오리지널 끊어짐 이슈가 많은데 보완됐나요?",
    user: "gse***",
    date: "25.06.22",
    answered: false,
    secret: false,
  },
  {
    category: "상품상세문의",
    title: "문의 입니다.",
    content: "박스에 풀리 씌워져 왔는데 정상인가요?",
    user: "yu1***",
    date: "25.06.13",
    answered: true,
    secret: false,
    answer: "안녕하세요 우포스입니다. 일부 사이즈는 신형박스로 출고 중입니다.",
    answerUser: "우포스 담당자",
    answerDate: "25.06.16",
  },
  {
    category: "배송",
    title: "상품 관련 문의입니다.",
    content: "",
    user: "jim***",
    date: "25.06.07",
    answered: true,
    secret: true,
  },
];

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [currentTab, setCurrentTab] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(OPTIONS[0]);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<boolean[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [qtyAlertVisible, setQtyAlertVisible] = useState(false);
  const [pendingQty, setPendingQty] = useState<number>(1);

  const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/products?page=1&items_per_page=309`
        );
        const found = response.data.products.find(
          (item: any) => item.id === id
        );
        setProduct(found);
      } catch (error) {
        console.error("상품 가져오기 실패", error);

        // 테스트용 더미 데이터
        setProduct({
          id: "dummy-001",
          name: "더미 상품명",
          category_main: "신발",
          category_sub: "브랜드",
          product_number: "MS123456",
          created_at: new Date().toISOString(),
          price_sell: 89000,
          price_whole: 129000,
          discount_rate: 31,
        });
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <Text>Loading...</Text>;

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>상품 정보</Text>
            <Text>품번: {product.product_number}</Text>
            <Text>카테고리: {product.category_main}</Text>
            <Text>브랜드: {product.category_sub}</Text>
            <Text>등록일: {product.created_at?.split("T")[0]}</Text>
          </View>
        );
      case 1:
        return (
          <View style={styles.tabContent}>
            <Text>추천 상품</Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.tabContent}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
              96%가 만족했어요
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              {[1, 2, 3, 4, 5].map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: "#ddd",
                    borderRadius: 8,
                    marginRight: 10,
                  }}
                />
              ))}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <View>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>색상</Text>
                <Text style={{ fontWeight: "600" }}>화면과 같아요</Text>
              </View>
              <Text style={{ alignSelf: "center" }}>96%</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <View>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>사이즈</Text>
                <Text style={{ fontWeight: "600" }}>잘 맞아요</Text>
              </View>
              <Text style={{ alignSelf: "center" }}>95%</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {["신발 사이즈", "옵션", "만족도"].map((label, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: "#fff",
                  }}
                >
                  <Text>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                style={{ fontWeight: "700", fontSize: 16, marginBottom: 6 }}
              >
                만족해요{" "}
                <Text style={{ color: "red", fontSize: 13 }}>BEST</Text>
              </Text>
              <Text style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                감튀조아 🌟 Yellow · 2025.05.14
              </Text>
              <Text
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#f1f1f1",
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  fontSize: 12,
                  marginBottom: 10,
                }}
              >
                다음날 발송되었어요 📦
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3, 4].map((_, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#ddd",
                      borderRadius: 6,
                      marginRight: 10,
                    }}
                  />
                ))}
              </ScrollView>

              <View style={{ marginTop: 15 }}>
                <Text style={{ fontSize: 14, marginBottom: 4 }}>
                  <Text style={{ fontWeight: "600" }}>옵션</Text> ivory · black
                </Text>
                <Text style={{ fontSize: 14, marginBottom: 4 }}>
                  <Text style={{ fontWeight: "600" }}>체형</Text> 164cm · 58kg
                </Text>
                <Text style={{ fontSize: 14, marginBottom: 4 }}>
                  <Text style={{ fontWeight: "600" }}>사이즈</Text> 잘 맞아요
                </Text>
                <Text style={{ fontSize: 14, marginBottom: 4 }}>
                  <Text style={{ fontWeight: "600" }}>색상</Text> 화면과 같아요
                </Text>
              </View>

              <Text style={{ marginTop: 12, fontSize: 14 }}>
                아직 신어보진 못했는데 신으면 귀여워질 거 같은 느낌입니다
              </Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.tabContent}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
              상품문의 ({mockQnA.length})
            </Text>

            {mockQnA.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (!item.secret) {
                    const updated = [...expandedItems];
                    updated[index] = !updated[index];
                    setExpandedItems(updated);
                  }
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomColor: "#eee",
                  borderBottomWidth: 1,
                }}
              >
                <Text style={{ color: "#666", fontSize: 12 }}>
                  {item.category}
                </Text>
                <Text style={{ fontWeight: "600", fontSize: 15 }}>
                  {item.secret ? "🔒 상품 관련 문의입니다." : item.title}
                </Text>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  {item.answered ? "답변완료" : "답변예정"} · {item.user} ·{" "}
                  {item.date}
                </Text>

                {expandedItems[index] && !item.secret && (
                  <View
                    style={{
                      marginTop: 12,
                      backgroundColor: "#f7f7f7",
                      padding: 12,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: "#444", fontSize: 14 }}>
                      {item.content}
                    </Text>

                    {item.answer && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                          답변. {item.answerUser}
                        </Text>
                        <Text style={{ color: "#444", fontSize: 14 }}>
                          {item.answer}
                        </Text>
                        <Text
                          style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}
                        >
                          {item.answerDate}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => router.push(`/qna?id=${id}`)}
              style={{
                marginTop: 20,
                borderWidth: 1,
                borderColor: "#ccc",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 16 }}>
                판매자에게 문의하기
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="chevron-back" size={29} color="black" />
          </TouchableOpacity>
        </Link>
        <View style={styles.headerIconsRight}>
          <Link href="/modal" asChild>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="search-outline" size={25} color="black" />
            </TouchableOpacity>
          </Link>
          <Link href="/cart" asChild>
            <TouchableOpacity>
              <Ionicons name="bag-outline" size={25} color="black" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.cardContainer}>
          <Image
            source={{
              uri: `${process.env.EXPO_PUBLIC_API_IMAGE_URL}/products/${product.name}/thumbnail.jpg`,
            }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.section}>
            <Text style={styles.brandText}>{product.category_sub}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.title}>{product.name.replace(/_/g, " ")}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              <Text style={{ color: "orange", fontSize: 20 }}>★</Text>
              <Text style={styles.smallText}>4.6</Text>
              <Text style={[styles.smallText, { marginLeft: 8 }]}>
                후기 320개
              </Text>
            </View>
            {product.discount_rate > 0 && (
              <Text style={styles.priceOriginal}>
                {product.price_whole.toLocaleString()}원
              </Text>
            )}
            <Text style={styles.priceDiscount}>
              {product.discount_rate > 0 && (
                <Text style={{ color: "#FF2D55" }}>
                  {product.discount_rate}%{" "}
                </Text>
              )}
              <Text style={{ color: "#000" }}>
                {product.price_sell.toLocaleString()}원
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.banner}>
            <Text>첫 구매 20% 쿠폰 받으러 가기 ➤</Text>
          </View>
          <View style={styles.earn}>
            <Text style={styles.sectionTitle}>적립</Text>
            <Text>후기 적립 2,500원</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>결제혜택</Text>
            <Text>무신사페이 x 무신사현대카드 1만원 할인</Text>
            <Text>카카오페이 x 페이머니 6천원 할인</Text>
            <Text style={{ marginTop: 15 }}>무이자 혜택 보기</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>배송</Text>
            <Text>5만원 이상 구매 시 무료배송</Text>
            <Text>06.26 도착 예정 · CJ대한통운</Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.tabBar}>
            {TABS.map((tab, index) => (
              <TouchableOpacity key={tab} onPress={() => setCurrentTab(index)}>
                <Text
                  style={[
                    styles.tabText,
                    currentTab === index && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {renderTabContent()}
        </View>
      </ScrollView>

      <View style={styles.fixedBuy}>
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={24} color="#FF2D55" />
          <Text style={styles.likeText}>1.3만</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.buyText}>구매하기</Text>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        swipeDirection="down"
        onSwipeComplete={() => setShowModal(false)}
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />
          <Text style={styles.sectionTitle}>옵션 선택</Text>

          <View>
            <TouchableOpacity
              style={[
                styles.dropdownBox,
                isOptionOpen && styles.dropdownBoxExpanded,
              ]}
              onPress={() => setIsOptionOpen(!isOptionOpen)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.dropdownText}>{selectedOption}</Text>
                <Text>
                  {isOptionOpen ? (
                    <Ionicons name="chevron-up" size={18} color="black" />
                  ) : (
                    <Ionicons name="chevron-down" size={18} color="black" />
                  )}
                </Text>
              </View>
            </TouchableOpacity>

            {isOptionOpen && (
              <View style={styles.optionScrollContainer}>
                <ScrollView>
                  {OPTIONS.map((opt, index) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.optionItem,
                        opt === selectedOption && styles.optionItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedOption(opt);
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>{opt}</Text>
                        {index === 0 && (
                          <Text style={{ color: "red", fontSize: 12 }}>
                            마지막 1개
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ ...styles.sectionTitle, marginBottom: 15 }}>
              수량 선택
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (pendingQty === 1) {
                    setQtyAlertVisible(true);
                    return;
                  }
                  setPendingQty((prev) => prev - 1);
                }}
                style={styles.qtyButton}
              >
                <Text style={{ fontSize: 20 }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18 }}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((prev) => prev + 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 2, marginLeft: 1 }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Modal
            isVisible={qtyAlertVisible}
            onBackdropPress={() => setQtyAlertVisible(false)}
          >
            <View style={styles.alertModalContent}>
              <Text style={styles.alertText}>
                더 이상 수량을 줄일 수 없습니다.
              </Text>
              <TouchableOpacity
                onPress={() => setQtyAlertVisible(false)}
                style={styles.alertButton}
              >
                <Text style={styles.alertButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => {
                setShowModal(false);
                router.push({
                  pathname: "/cart",
                  params: {
                    product: JSON.stringify({
                      id: product.id,
                      name: product.name,
                      category_sub: product.category_sub,
                      price_sell: product.price_sell,
                      price_whole: product.price_whole,
                      option: selectedOption,
                      quantity: quantity,
                    }),
                  },
                });
              }}
            >
              <Text style={{ ...styles.buyText, color: "#000" }}>장바구니</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.buyText}>구매하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  cardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  customHeader: {
    height: 110,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIcon: { padding: 4 },
  headerIconsRight: { flexDirection: "row", alignItems: "center" },
  productImage: { width: "100%", height: 450 },
  brandText: { fontSize: 16, fontWeight: "600" },
  smallText: { fontSize: 14 },
  productInfo: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 15 },
  title: { fontSize: 22, fontWeight: "600", marginVertical: 5 },
  priceOriginal: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  priceDiscount: {
    fontSize: 20,
    fontWeight: "700",
    paddingTop: 3,
    paddingBottom: 15,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  tabText: { fontSize: 15, color: "#999" },
  tabTextActive: { color: "#000", fontWeight: "700" },
  tabContent: { padding: 20 },
  fixedBuy: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    paddingBottom: 30,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderTopColor: "#eee",
    borderTopWidth: 1,
  },
  likeButton: { flexDirection: "row", alignItems: "center" },
  likeText: {
    marginLeft: 4,
    marginRight: 15,
    fontSize: 16,
    color: "#FF2D55",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 20,
  },
  buyButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 8,
  },
  cartButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buyText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  banner: {
    backgroundColor: "#eee",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  earn: {
    padding: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: Dimensions.get("window").height * 0.85,
    paddingBottom: 90,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 10,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 12,
    overflow: "hidden",
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
  },
  optionScrollContainer: {
    maxHeight: 250,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionItem: {
    padding: 12,
    backgroundColor: "#fff",
  },
  optionText: {
    fontSize: 16,
  },
  dropdownBoxExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  optionItemSelected: {
    backgroundColor: "#f9f9f9",
  },
  buttonRowFixed: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  optionListWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastOneText: {
    fontSize: 12,
    color: "red",
  },
  alertModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  alertText: {
    fontSize: 16,
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
});
