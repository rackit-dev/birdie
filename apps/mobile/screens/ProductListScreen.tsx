import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Product = {
  id: string;
  name: string;
  image: any;
  price: number;
};

export default function ProductListScreen() {
  const route = useRoute<any>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { category, brand } = route.params || {};
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // TODO: category, brand 기준으로 API 호출할 예정
    const dummy = [
      {
        id: "1",
        name: `${brand} 초경량 슈즈`,
        price: 59000,
        image: require("../assets/images/items/shoes1.jpg"),
      },
      {
        id: "2",
        name: `${brand} 파워쿠션 2024`,
        price: 72000,
        image: require("../assets/images/items/shoes1.jpg"),
      },
      {
        id: "3",
        name: `${brand} 런닝화`,
        price: 49000,
        image: require("../assets/images/items/shoes1.jpg"),
      },
    ];
    setProducts(dummy);
  }, [category, brand]);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
    >
      <Image source={item.image} style={styles.image} />
      <Text style={styles.nameText} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.priceText}>{item.price.toLocaleString()}원</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {category} - {brand}
      </Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
      />
    </View>
  );
}

const cardWidth = (Dimensions.get("window").width - 40) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerText: {
    fontSize: 20,
    fontFamily: "P-Bold",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listContainer: {
    paddingHorizontal: 10,
    gap: 10,
  },
  card: {
    width: cardWidth,
    margin: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 6,
    marginBottom: 6,
  },
  nameText: {
    fontSize: 14,
    fontFamily: "P-Medium",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontFamily: "P-Bold",
  },
});
