import { StyleSheet, FlatList, View } from "react-native";
import { Text } from "@/components/Themed";
import useLikeStore, { Product } from "@/store/useLikeStore";
import ItemCard from "@/components/ItemCard";
import CustomHeader from "../components/CustomHeader";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useCallback } from "react";
import axios from "axios";

export default function LikeScreen() {
  const { likedItems, fetchLikedItems } = useLikeStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const USER_ID = "test_user1";
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useFocusEffect(
    useCallback(() => {
      fetchLikedItems(USER_ID);
    }, [])
  );

  const handleDeleteLike = async (product: Product) => {
    try {
      if (!product.product_like_id) {
        console.warn("삭제할 product_like_id가 없습니다.");
        return;
      }
      await axios.delete(`${API_URL}/products/like`, {
        params: { product_like_id: product.product_like_id },
      });
      fetchLikedItems(USER_ID);
    } catch (err) {
      console.error("좋아요 삭제 실패:", err);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="좋아요" />

      {likedItems.length > 0 ? (
        <FlatList
          data={likedItems}
          keyExtractor={(item) => item.id}
          numColumns={3}
          extraData={likedItems}
          renderItem={({ item }) => {
            const isLiked = true;
            return (
              <View style={styles.itemWrapper}>
                <ItemCard
                  item={item}
                  isLiked={isLiked}
                  toggleLike={(_, product) => handleDeleteLike(product)}
                  userId={USER_ID}
                  size="large"
                  onPress={() =>
                    navigation.navigate("ProductDetail", { id: item.id })
                  }
                />
              </View>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          columnWrapperStyle={{ flex: 1 }}
        />
      ) : (
        <Text style={styles.emptyText}>좋아요한 상품이 없습니다.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  itemWrapper: {
    width: "33.333%",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
