import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const categories = [
  { id: "1", name: "베스트" },
  { id: "2", name: "배트민턴화" },
  { id: "3", name: "배드민턴 라켓" },
  { id: "4", name: "배드민턴 의류" },
  { id: "5", name: "배드민턴 가방" },
  { id: "6", name: "악세서리" },
  { id: "7", name: "기타용품" },
];

const brands = {
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
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);

  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          height: 0.7,
          backgroundColor: "#BCBCBC",
        }}
      />
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={styles.listContainer}>
          {/* 왼쪽: 용품 종류 */}
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
          {/* 오른쪽: 브랜드 목록 */}
          <FlatList
            data={brands[selectedCategory]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.brandItem}>
                <Text style={styles.brandText}>{item}</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color="#000"
                />
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
