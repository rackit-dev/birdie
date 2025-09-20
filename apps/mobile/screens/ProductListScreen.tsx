import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import axios from "axios";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import CustomHeader from "../components/CustomHeader";
import ItemCard from "@/components/ItemCard";
import useLikeStore, { Product } from "@/store/useLikeStore";
import { useUserIdStore } from "../store/useUserIdStore";

export default function ProductListScreen() {
  const route = useRoute<any>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { category, brand } = route.params || {};
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { likedItems, toggleLike, fetchLikedItems } = useLikeStore();
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const IMAGE_URL = process.env.EXPO_PUBLIC_API_IMAGE_URL;
  const userId = useUserIdStore((s) => s.id);

  const categoryMap: Record<string, string> = {
    배드민턴화: "신발",
    "배드민턴 라켓": "라켓",
    "배드민턴 의류": "배드민턴의류",
    "배드민턴 가방": "배드민턴가방",
    악세서리: "악세서리",
    기타용품: "기타용품",
  };

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      const fetchCartCount = async () => {
        try {
          const res = await axios.get(`${API_URL}/cartitems`, {
            params: { user_id: userId },
          });
          setCartCount(res.data.total_count);
        } catch (err) {
          console.error("장바구니 개수 불러오기 실패:", err);
        }
      };

      fetchCartCount();
      fetchLikedItems();
    }, [userId, fetchLikedItems])
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const mappedCategory = categoryMap[category] || category;

        const params = {
          category_main: mappedCategory,
          category_sub: brand,
          page: 1,
          items_per_page: 309,
        };

        const res = await axios.get(`${API_URL}/products/by_category`, {
          params,
        });

        const mapped = res.data.products.map((item: any) => ({
          id: item.id,
          name: item.name,
          brand: item.category_sub,
          priceSell: item.price_sell,
          priceOriginal: item.price_whole,
          discount: item.discount_rate,
          image: {
            uri: `${IMAGE_URL}/products/${item.name}/thumbnail.jpg`,
          },
          isActive: item.is_active,
        }));

        setProducts(mapped);
      } catch (err) {
        console.error("상품 불러오기 실패:", err);
      }
    };

    fetchProducts();
  }, [category, brand]);

  const renderItem = ({ item }: { item: Product }) => {
    const isLiked = likedItems.some((liked) => liked.id === item.id);
    return (
      <View style={styles.itemWrapper}>
        <ItemCard
          item={item}
          isLiked={isLiked}
          toggleLike={toggleLike}
          size="large"
          onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
          userId={userId ?? ""}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title={brand}
        showBackButton
        onPressBack={() => navigation.goBack()}
        onPressSearch={() => navigation.navigate("Search")}
        onPressCart={() => navigation.navigate("Cart")}
        cartCount={cartCount}
      />
      {products.length === 0 ? (
        <Text style={{ padding: 20 }}>해당 조건의 상품이 없습니다.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={{
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerText: {
    fontSize: 20,
    fontFamily: "P-600",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  itemWrapper: {
    width: "33.333%",
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 6,
    marginBottom: 6,
  },
  nameText: {
    fontSize: 14,
    fontFamily: "P-500",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontFamily: "P-600",
  },
});
