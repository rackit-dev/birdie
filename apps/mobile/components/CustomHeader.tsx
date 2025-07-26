import React from "react";
import { View, StyleSheet, TouchableOpacity, Image, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title?: string;
  logo?: boolean;
  showBackButton?: boolean;
  customLeftComponent?: React.ReactNode;
  onPressBack?: () => void;
  onPressSearch?: () => void;
  onPressCart?: () => void;
  cartCount?: number;
};

const CustomHeader: React.FC<Props> = ({
  title,
  logo,
  showBackButton,
  customLeftComponent,
  onPressBack,
  onPressSearch,
  onPressCart,
  cartCount = 0,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.left}>
        {customLeftComponent ? (
          customLeftComponent
        ) : logo ? (
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : showBackButton ? (
          <TouchableOpacity onPress={onPressBack}>
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
        ) : null}
      </View>

      {title && !logo && !customLeftComponent && (
        <View style={[styles.centerAbsolute, { top: insets.top + 45 }]}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}

      <View style={styles.right}>
        {onPressSearch && (
          <TouchableOpacity onPress={onPressSearch} style={styles.iconWrapper}>
            <Ionicons name="search-outline" size={25} color="black" />
          </TouchableOpacity>
        )}
        {onPressCart && (
          <TouchableOpacity onPress={onPressCart} style={styles.iconWrapper}>
            <Ionicons name="bag-outline" size={25} color="black" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 120,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    position: "relative",
  },
  left: {
    flex: 1,
    justifyContent: "flex-start",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: -5,
    marginRight: 5,
  },
  centerAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    transform: [{ translateY: -26 }],
    alignItems: "center",
    pointerEvents: "none",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  logo: {
    width: 100,
    height: 40,
  },
  iconWrapper: {
    marginLeft: 15,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "red",
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
