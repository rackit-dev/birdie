import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
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
  const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/products`;

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
            <Ionicons name="chevron-back-outline" size={29} color="black" />
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
    paddingBottom: 20,
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
    fontSize: 16,
    color: "#FF2D55",
    fontWeight: "500",
  },
  buyButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 110,
    borderRadius: 8,
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
});
