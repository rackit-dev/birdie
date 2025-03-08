import { StyleSheet, FlatList, Image } from "react-native";
import { Text, View } from "@/components/Themed";

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

export default function TabOneScreen() {
  const itemImages = [
    require("../../assets/images/items/shoes1.jpg"),
    require("../../assets/images/items/shoes2.jpg"),
    require("../../assets/images/items/shoes3.jpg"),
    require("../../assets/images/items/shoes4.jpg"),
    require("../../assets/images/items/shoes5.jpg"),
    require("../../assets/images/items/shoes6.jpg"),
    require("../../assets/images/items/shorts1.jpg"),
    require("../../assets/images/items/shorts2.jpg"),
    require("../../assets/images/items/shirt1.jpg"),
    require("../../assets/images/items/shirt2.jpg"),
    require("../../assets/images/items/bag1.jpg"),
    require("../../assets/images/items/outer1.jpg"),
    require("../../assets/images/items/racket1.jpg"),
    require("../../assets/images/items/racket2.jpg"),
    require("../../assets/images/items/racket3.jpg"),
    require("../../assets/images/items/racket4.jpg"),
  ];

  const shuffledImages1 = shuffleArray([...itemImages]);
  const shuffledImages2 = shuffleArray([...itemImages]);

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/images/image2.png")}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.font}>당신을 위한 추천 상품</Text>
            </View>

            <FlatList
              data={shuffledImages1}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageGrid}
              renderItem={({ item }) => (
                <Image source={item} style={styles.itemImage} />
              )}
            />
          </>
        }
        ListFooterComponent={
          <>
            <View style={styles.textContainer}>
              <Text style={styles.font}>베스트</Text>
            </View>

            <FlatList
              data={shuffledImages2}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageGrid}
              renderItem={({ item }) => (
                <Image source={item} style={styles.itemImage} />
              )}
            />
          </>
        }
        data={[]}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 5 / 5,
    backgroundColor: "#ddd",
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginLeft: 15,
  },
  font: {
    fontFamily: "P-Extra-Bold",
    fontSize: 24,
    marginBottom: 5,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 1100,
    paddingHorizontal: 10,
    marginBottom: 50,
  },
  itemImage: {
    width: 120,
    aspectRatio: 1,
    borderRadius: 8,
    margin: 5,
  },
});
