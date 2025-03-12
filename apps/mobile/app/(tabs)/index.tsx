import { StyleSheet, FlatList, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import { useState, useEffect } from "react";

type Product = {
  image: number;
  brand: string;
  name: string;
  price: string;
};

const itemData: Product[] = [
  {
    image: require("../../assets/images/items/shoes1.jpg"),
    brand: "나이키",
    name: "에어 맥스 90",
    price: "150,000원",
  },
  {
    image: require("../../assets/images/items/shoes2.jpg"),
    brand: "아디다스",
    name: "울트라부스트",
    price: "180,000원",
  },
  {
    image: require("../../assets/images/items/shoes3.jpg"),
    brand: "푸마",
    name: "RS-X",
    price: "130,000원",
  },
  {
    image: require("../../assets/images/items/shoes4.jpg"),
    brand: "뉴발란스",
    name: "574",
    price: "140,000원",
  },
  {
    image: require("../../assets/images/items/shoes5.jpg"),
    brand: "리복",
    name: "클럽 C",
    price: "120,000원",
  },
  {
    image: require("../../assets/images/items/shoes6.jpg"),
    brand: "반스",
    name: "올드스쿨",
    price: "110,000원",
  },
  {
    image: require("../../assets/images/items/shorts1.jpg"),
    brand: "나이키",
    name: "스포츠 반바지",
    price: "50,000원",
  },
  {
    image: require("../../assets/images/items/shorts2.jpg"),
    brand: "아디다스",
    name: "트레이닝 반바지",
    price: "55,000원",
  },
  {
    image: require("../../assets/images/items/shirt1.jpg"),
    brand: "푸마",
    name: "운동용 티셔츠",
    price: "45,000원",
  },
  {
    image: require("../../assets/images/items/shirt2.jpg"),
    brand: "뉴발란스",
    name: "러닝 티셔츠",
    price: "60,000원",
  },
  {
    image: require("../../assets/images/items/bag1.jpg"),
    brand: "나이키",
    name: "체육관 가방",
    price: "80,000원",
  },
  {
    image: require("../../assets/images/items/outer1.jpg"),
    brand: "아디다스",
    name: "윈드브레이커",
    price: "200,000원",
  },
  {
    image: require("../../assets/images/items/racket1.jpg"),
    brand: "요넥스",
    name: "배드민턴 라켓",
    price: "250,000원",
  },
  {
    image: require("../../assets/images/items/racket2.jpg"),
    brand: "윌슨",
    name: "테니스 라켓",
    price: "270,000원",
  },
  {
    image: require("../../assets/images/items/racket3.jpg"),
    brand: "헤드",
    name: "테니스 라켓",
    price: "260,000원",
  },
  {
    image: require("../../assets/images/items/racket4.jpg"),
    brand: "바볼랏",
    name: "테니스 라켓",
    price: "280,000원",
  },
];

const shuffleArray = (array: Product[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export default function TabOneScreen() {
  const [shuffledImages1, setShuffledImages1] = useState<Product[]>([]);
  const [shuffledImages2, setShuffledImages2] = useState<Product[]>([]);

  useEffect(() => {
    setShuffledImages1(shuffleArray([...itemData]));
    setShuffledImages2(shuffleArray([...itemData]));
  }, []);

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
                <View style={styles.productContainer}>
                  <Image
                    source={item.image}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemTextBox}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>
                </View>
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
                <View style={styles.productContainer}>
                  <Image
                    source={item.image}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={{ alignItems: "flex-start" }}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>
                </View>
              )}
            />

            <View
              style={{ width: "100%", height: 550, backgroundColor: "#f9f9f9" }}
            >
              <Text
                style={{
                  marginTop: 30,
                  marginLeft: 17,
                  fontFamily: "P-Bold",
                  fontSize: 16,
                }}
              >
                고객센터 1588-1588
              </Text>
              <Text
                style={{
                  marginTop: 15,
                  marginLeft: 17,
                  fontFamily: "P-Medium",
                  fontSize: 14,
                  color: "#B0B0B0",
                }}
              >
                운영시간 평일 10:00 - 18:00 (토-일, 공휴일 휴무)
              </Text>
              <Text
                style={{
                  marginLeft: 17,
                  fontFamily: "P-Medium",
                  fontSize: 14,
                  color: "#B0B0B0",
                }}
              >
                점심시간 평일 13:00 - 14:00
              </Text>
              <Text
                style={{
                  marginTop: 15,
                  marginLeft: 17,
                  fontFamily: "P-Medium",
                  fontSize: 14,
                }}
              >
                자주 묻는 질문
              </Text>
              <Text
                style={{
                  marginTop: 15,
                  marginLeft: 17,
                  fontFamily: "P-Medium",
                  fontSize: 14,
                }}
              >
                1:1 문의
              </Text>
              <View
                style={{
                  marginTop: 30,
                  marginBottom: 30,
                  width: "92%",
                  height: 0.7,
                  backgroundColor: "#BCBCBC",
                  alignSelf: "center",
                }}
              />
              <Text
                style={{
                  marginLeft: 17,
                  fontFamily: "P-Bold",
                  fontSize: 14,
                  color: "grey",
                }}
              >
                사업자 정보
              </Text>
              <Text
                style={{
                  marginTop: 25,
                  marginLeft: 17,
                  fontFamily: "P-Bold",
                  fontSize: 14,
                  color: "grey",
                }}
              >
                법적 고지사항
              </Text>
              <View
                style={{
                  marginTop: 30,
                  marginBottom: 30,
                  width: "92%",
                  height: 0.7,
                  backgroundColor: "#BCBCBC",
                  alignSelf: "center",
                }}
              />
              <Text
                style={{
                  marginLeft: 17,
                  fontFamily: "P-Medium",
                  fontSize: 14,
                  color: "grey",
                }}
              >
                이용약관
              </Text>
              <Text
                style={{
                  marginTop: 20,
                  marginLeft: 17,
                  fontFamily: "P-Bold",
                  fontSize: 14,
                }}
              >
                개인정보처리방침
              </Text>
              <Text
                style={{
                  marginTop: 20,
                  marginLeft: 17,
                  marginRight: 20,
                  fontFamily: "P-Medium",
                  fontSize: 14,
                  color: "grey",
                }}
              >
                일부 상품의 경우 주식회사 ----는 통신판매의 당사자가 아닌
                통신판매중개자로서 상품, 상품정보, 거래에 대한 책임이 제한될 수
                있으므로, 각 상품 페이지에서 구체적인 내용을 확인하시기
                바랍니다. 일부 상품의 경우 주식회사 ----는 통신판매의 당사자가
                아닌 통신판매중개자로서 상품, 상품정보, 거래에 대한 책임이
                제한될 수 있으므로, 각 상품 페이지에서 구체적인 내용을
                확인하시기 바랍니다. 어쩌구
              </Text>
            </View>
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
    width: "95%",
    aspectRatio: 5 / 5,
    marginBottom: 35,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  textContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginLeft: 15,
  },
  font: {
    fontFamily: "P-Extra-Bold",
    fontSize: 24,
    marginBottom: 10,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginBottom: 50,
    width: 1070,
  },
  productContainer: {
    width: 120,
    height: 200,
    alignItems: "flex-start",
    marginHorizontal: 5,
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 5,
  },
  itemTextBox: {
    marginLeft: 5,
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
    marginBottom: 7,
  },
  priceText: {
    fontFamily: "P-Black",
    fontSize: 14,
  },
});
