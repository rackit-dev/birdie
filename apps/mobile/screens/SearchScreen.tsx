import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text, View } from "@/components/Themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomHeader from "../components/CustomHeader";

export default function SearchScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton
        onPressBack={() => navigation.goBack()}
        customLeftComponent={
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="지금이 기회! 배드민턴 용품 세일"
                placeholderTextColor="#888"
              />
              <Ionicons
                name="search-outline"
                size={22}
                color="#000"
                style={styles.searchIcon}
              />
            </View>
          </View>
        }
      />
      <View style={styles.textContainer}>
        <Text style={styles.font}>최근 검색어</Text>
        <View
          style={{
            marginTop: 30,
            marginBottom: 30,
            width: "110%",
            height: 0.7,
            backgroundColor: "#ededed",
            alignSelf: "center",
          }}
        ></View>
        <Text style={{ ...styles.font, marginBottom: 30 }}>
          지금 많이 찾는 의류 브랜드
        </Text>
        <View>
          <Text style={{ height: 150, justifyContent: "space-between" }}>
            1 2 3 4 5 6
          </Text>
        </View>
        <Text style={{ ...styles.font, marginBottom: 30 }}>
          지금 많이 찾는 신발 브랜드
        </Text>
        <View>
          <Text style={{ height: 150 }}>1 2 3 4 5 6</Text>
        </View>
        <Text style={{ ...styles.font, marginBottom: 30 }}>
          지금 많이 찾는 신발 브랜드
        </Text>
        <View>
          <Text style={{ height: 150 }}>1 2 3 4 5 6</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    flex: 1,
    marginLeft: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "P-500",
    color: "#000",
  },
  searchIcon: {
    marginLeft: 8,
  },
  textContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 15,
    marginLeft: 20,
  },
  font: { fontFamily: "P-600", fontSize: 18 },
});
