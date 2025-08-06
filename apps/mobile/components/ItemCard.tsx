import { View, Image, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import Ionicons from "@expo/vector-icons/Ionicons";

type ItemCardProps = {
  item: {
    id: string;
    image: any;
    brand: string;
    name: string;
    price: string;
    priceSell?: number;
    priceOriginal?: number;
    discount?: number;
  };
  isLiked: boolean;
  toggleLike: (item: ItemCardProps["item"]) => void;
  size?: "small" | "large";
  onPress?: () => void;
};

export default function ItemCard({
  item,
  isLiked,
  toggleLike,
  size = "small",
  onPress,
}: ItemCardProps) {
  return (
    <Pressable
      onPress={onPress}
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
        <Pressable onPress={() => toggleLike(item)} style={styles.heartWrapper}>
          {!isLiked ? (
            <>
              <Ionicons
                name="heart"
                size={18}
                color="rgba(128,128,128,0.4)"
                style={styles.absoluteIcon}
              />
              <Ionicons name="heart-outline" size={18} color="#ffffff" />
            </>
          ) : (
            <Ionicons name="heart" size={17} color="#FF2D55" />
          )}
        </Pressable>
      </View>

      <View
        style={size === "large" ? styles.itemTextBoxLarge : styles.itemTextBox}
      >
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.nameText} numberOfLines={2}>
          {item.name.replace(/_/g, " ")}
        </Text>

        {item.discount && item.discount > 0 && item.priceSell ? (
          <View style={{ flexDirection: "row", gap: 3 }}>
            <Text style={styles.discountText}>{item.discount}%</Text>
            <Text style={styles.priceText}>
              {item.priceSell.toLocaleString()}원
            </Text>
          </View>
        ) : item.priceSell ? (
          <Text style={styles.priceText}>
            {item.priceSell.toLocaleString()}원
          </Text>
        ) : (
          <Text style={styles.priceText}>{item.price}</Text>
        )}
      </View>
    </Pressable>
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
    marginBottom: 4,
  },
  priceText: {
    fontFamily: "P-Black",
    fontSize: 14,
  },
  discountText: {
    fontFamily: "P-Bold",
    fontSize: 14,
    color: "#FF2D55",
  },
  heartWrapper: {
    position: "absolute",
    bottom: 7,
    right: 4,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  absoluteIcon: {
    position: "absolute",
  },
});
