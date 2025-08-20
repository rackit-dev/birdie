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
      <View style={[styles.left, customLeftComponent ? { flex: 1 } : null]}>
        {customLeftComponent ? (
          customLeftComponent
        ) : logo ? (
          <Image
            source={require("../assets/images/logos/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : showBackButton && title ? (
          <View style={styles.backWithTitle}>
            <TouchableOpacity
              onPress={onPressBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
          </View>
        ) : showBackButton ? (
          <TouchableOpacity
            onPress={onPressBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
        ) : title ? (
          <Text style={styles.title}>{title}</Text>
        ) : null}
      </View>

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
    justifyContent: "flex-start",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: -5,
    marginRight: 5,
  },
  title: {
    fontSize: 22,
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
  backWithTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
  },
});
