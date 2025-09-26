import { View, Image, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Product } from "@/store/useLikeStore";

type ItemCardProps = {
  item: Product;
  isLiked: boolean;
  toggleLike: (item: Product) => void;
  userId: string;
  size?: "small" | "large";
  onPress?: () => void;
};

export default function ItemCard({
  item,
  isLiked,
  toggleLike,
  userId,
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

        <Pressable
          onPress={() => toggleLike(item)}
          style={[styles.heartWrapper, { zIndex: 2 }]}
        >
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
        {item.isActive === false && (
          <>
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(255,255,255,0.5)",
                borderRadius: 8,
                zIndex: 1,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 5,
                left: 5,
                backgroundColor: "rgba(0,0,0,0.6)",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                zIndex: 2,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontFamily: "P-500",
                }}
              >
                품절
              </Text>
            </View>
          </>
        )}
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
          <Text style={styles.priceText}>-</Text>
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
    flex: 1,
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
    fontFamily: "P-600",
    fontSize: 14,
    marginVertical: 3,
  },
  nameText: { fontFamily: "P-500", fontSize: 14, marginBottom: 4 },
  priceText: { fontFamily: "P-600", fontSize: 14 },
  discountText: { fontFamily: "P-600", fontSize: 14, color: "#FF2D55" },
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
