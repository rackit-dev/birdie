import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
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
  },
  textContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 15,
    marginLeft: 20,
  },
  font: {
    fontFamily: "P-Bold",
    fontSize: 18,
    fontWeight: "bold",
  },
});
