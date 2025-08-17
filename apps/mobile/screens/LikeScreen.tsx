import { StyleSheet, FlatList, View } from "react-native";
import { Text } from "@/components/Themed";
import useLikeStore from "@/store/useLikeStore";
import ItemCard from "@/components/ItemCard";
import CustomHeader from "../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

export default function LikeScreen() {
  const { likedItems, toggleLike } = useLikeStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <CustomHeader title="좋아요" />

      {likedItems.length > 0 ? (
        <FlatList
          data={likedItems}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          extraData={likedItems}
          renderItem={({ item }) => {
            const isLiked = likedItems.some((liked) => liked.id === item.id);
            return (
              <View style={styles.itemWrapper}>
                <ItemCard
                  item={item}
                  isLiked={isLiked}
                  toggleLike={toggleLike}
                  size="large"
                  onPress={() =>
                    navigation.navigate("ProductDetail", { id: item.id })
                  }
                />
              </View>
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
  itemWrapper: {
    width: "33.333%",
    alignItems: "center",
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
