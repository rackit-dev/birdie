import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import CustomHeader from "../components/CustomHeader";
import axios from "axios";

const categories = [
  { id: "1", name: "베스트" },
  { id: "2", name: "배드민턴화" },
  { id: "3", name: "배드민턴 라켓" },
  { id: "4", name: "배드민턴 의류" },
  { id: "5", name: "배드민턴 가방" },
  { id: "6", name: "악세서리" },
  { id: "7", name: "기타용품" },
];

const brands: { [key: string]: string[] } = {
  "1": ["미즈노", "요넥스", "테크니스트", "라이더", "플로먼트"],
  "2": [
    "트라이온",
    "미즈노",
    "테크니스트",
    "컨트롤마스터",
    "스펙트럼",
    "슈퍼릴라",
  ],
  "3": [
    "테크니스트",
    "라이더",
    "트라이온",
    "핏섬",
    "컨트롤마스터",
    "미즈노",
    "스펙트럼",
    "포윈",
    "스포츠베어",
  ],
  "4": [
    "라이더",
    "테크니스트",
    "미즈노",
    "트라이온",
    "컨트롤마스터",
    "핏섬",
    "스포츠베어",
    "요넥스",
    "스펙트럼",
    "인투스",
  ],
  "5": ["Yonex", "Victor", "Li-Ning", "Babolat"],
  "6": ["Yonex", "Victor", "Li-Ning", "Adidas"],
};

export default function CategoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [cartCount, setCartCount] = useState(0);

  const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;

  useFocusEffect(
    useCallback(() => {
      const fetchCartCount = async () => {
        try {
          const res = await axios.get(`${API_URL}/cartitems`, {
            params: { user_id: "test_user" },
          });
          setCartCount(res.data.total_count);
        } catch (err) {
          console.error("장바구니 개수 불러오기 실패:", err);
        }
      };

      fetchCartCount();
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        cartCount={cartCount}
        onPressCart={() => console.log("장바구니")}
        customLeftComponent={
          <Pressable
            onPress={() => navigation.navigate("Search")}
            style={styles.searchBox}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="지금이 기회! 배드민턴 용품 세일"
              placeholderTextColor="#888"
              editable={false}
              pointerEvents="none"
            />
            <Ionicons
              name="search-outline"
              size={25}
              color="#000"
              style={styles.searchIcon}
            />
          </Pressable>
        }
      />

      <View style={styles.divider} />

      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={styles.listContainer}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                style={styles.categoryItem}
              >
                <Text
                  style={
                    selectedCategory === item.id
                      ? styles.selectedText
                      : styles.categoryText
                  }
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.brandContainer}>
          <FlatList
            data={brands[selectedCategory]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductList", {
                    category:
                      categories.find((c) => c.id === selectedCategory)?.name ??
                      "",
                    brand: item,
                  })
                }
                style={styles.brandItem}
              >
                <Text style={styles.brandText}>{item}</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color="#000"
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  searchIcon: {
    marginLeft: 8,
  },
  divider: {
    width: "100%",
    height: 0.7,
    backgroundColor: "#ededed",
  },
  listContainer: {
    flex: 0.7,
    backgroundColor: "#f5f5f5",
    paddingTop: 15,
  },
  brandContainer: {
    flex: 1.3,
    backgroundColor: "#fff",
    paddingTop: 18,
  },
  categoryItem: {
    padding: 22,
    marginLeft: -2,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: "P-Medium",
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "P-Medium",
  },
  brandItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: "#fff",
  },
  brandText: {
    fontSize: 16,
    fontFamily: "P-Bold",
  },
});
