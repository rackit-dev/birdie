import { StyleSheet, FlatList, View } from "react-native";
import { Text } from "@/components/Themed";
import useLikeStore from "@/store/useLikeStore";
import ItemCard from "@/components/ItemCard";

export default function LikeScreen() {
  const { likedItems, toggleLike } = useLikeStore();

  return (
    <View style={styles.container}>
      {likedItems.length > 0 ? (
        <FlatList
          data={likedItems}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          extraData={likedItems}
          renderItem={({ item }) => {
            const isLiked = likedItems.some((liked) => liked.id === item.id);
            return (
              <ItemCard
                item={item}
                isLiked={isLiked}
                toggleLike={toggleLike}
                size="large"
              />
            );
          }}
          contentContainerStyle={{
            paddingHorizontal: 0,
          }}
          columnWrapperStyle={{
            flex: 1,
          }}
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
  title: {
    fontSize: 20,
    fontFamily: "P-Bold",
    marginBottom: 16,
  },
  list: {
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
