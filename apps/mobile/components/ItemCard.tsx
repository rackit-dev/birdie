import { View, Image, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import useLikeStore from "@/store/useLikeStore";

type ItemCardProps = {
  item: {
    id: string;
    image: number;
    brand: string;
    name: string;
    price: string;
  };
  isLiked: boolean;
  toggleLike: (item: ItemCardProps["item"]) => void;
  size?: "small" | "large";
};

export default function ItemCard({
  item,
  isLiked,
  toggleLike,
  size = "small",
}: ItemCardProps) {
  return (
    <View
      style={
        size === "large"
          ? styles.productContainerLarge
          : styles.productContainer
      }
    >
      <View style={styles.imageWrapper}>
        <Image
          source={item.image}
          style={size === "large" ? styles.itemImageLarge : styles.itemImage}
          resizeMode="cover"
        />
        <Pressable
          onPress={() => toggleLike(item)}
          style={
            size === "large" ? styles.heartButtonLarge : styles.heartButton
          }
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={size === "large" ? 22 : 22}
            color={isLiked ? "red" : "grey"}
          />
        </Pressable>
      </View>
      <View
        style={size === "large" ? styles.itemTextBoxLarge : styles.itemTextBox}
      >
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productContainer: {
    width: 120,
    height: 200,
    alignItems: "flex-start",
    marginHorizontal: 5,
  },
  productContainerLarge: {
    width: "33.33%",
    height: 270,
    alignItems: "flex-start",
  },
  imageWrapper: {
    position: "relative",
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 5,
  },
  itemImageLarge: {
    width: "100%",
    height: "auto",
    aspectRatio: 0.85,
    marginBottom: 8,
  },
  heartButton: {
    position: "absolute",
    bottom: 4,
    right: 1,
    backgroundColor: "rgba(255, 255, 255, 0)",
    borderRadius: 12,
    padding: 5,
  },
  heartButtonLarge: {
    position: "absolute",
    bottom: 7,
    right: 1,
    backgroundColor: "rgba(255, 255, 255, 0)",
    borderRadius: 12,
    padding: 5,
  },
  itemTextBox: {
    marginLeft: 5,
  },
  itemTextBoxLarge: {
    alignItems: "flex-start",
    marginLeft: 10,
  },
  brandText: {
    fontFamily: "P-Bold",
    fontSize: 14,
    color: "#333",
    marginVertical: 3,
  },
  nameText: {
    fontFamily: "P-Medium",
    fontSize: 14,
    marginBottom: 7,
  },
  priceText: {
    fontFamily: "P-Black",
    fontSize: 14,
  },
});
