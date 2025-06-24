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
import { useLocalSearchParams, Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";

const TABS = ["정보", "추천", "후기", "문의"];
const OPTIONS = ["230mm", "240mm", "250mm", "260mm", "270mm", "280mm"];

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [currentTab, setCurrentTab] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(OPTIONS[0]);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;

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
            <Text>후기</Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.tabContent}>
            <Text>문의</Text>
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
            source={require("@/assets/images/items/shoes1.jpg")}
            style={styles.productImage}
            resizeMode="cover"
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

          <View style={{ marginTop: 10 }}>
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

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => setShowModal(true)}
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
    borderColor: "#eee",
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
});
