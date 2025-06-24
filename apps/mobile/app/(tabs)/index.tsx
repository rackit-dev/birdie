import { StyleSheet, FlatList, Image, Pressable } from "react-native";
import { Text, View } from "@/components/Themed";
import { useState, useEffect } from "react";
import useLikeStore from "@/store/useLikeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import axios from "axios";

type Product = {
  id: string;
  image: any;
  brand: string;
  name: string;
  priceSell: number;
  priceOriginal: number;
  discount: number;
};

const shuffleArray = (array: Product[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export default function TabOneScreen() {
  const [shuffledImages1, setShuffledImages1] = useState<Product[]>([]);
  const [shuffledImages2, setShuffledImages2] = useState<Product[]>([]);
  const { likedItems, toggleLike } = useLikeStore();
  const router = useRouter();
  const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/products?page=1&items_per_page=309`
        );
        if (response.data && Array.isArray(response.data.products)) {
          const fullData = response.data.products.map((item: any) => ({
            id: item.id,
            name: item.name,
            brand: item.category_sub,
            priceSell: item.price_sell,
            priceWhole: item.price_whole,
            priceOriginal: item.price_whole,
            discount: item.discount_rate,
            image: require("../../assets/images/items/shoes1.jpg"), // 임시
          }));

          const getRandomSample = (array: Product[], size: number) => {
            const shuffled = [...array].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, size);
          };

          const sampled = getRandomSample(fullData, 20);
          setShuffledImages1(sampled);
          setShuffledImages2(getRandomSample(fullData, 20));
        }
      } catch (err) {
        console.error("상품 API 호출 실패:", err);

        // 테스트용 더미 데이터
        const dummyData: Product[] = [
          {
            id: "dummy1",
            name: "테스트 스니커즈",
            brand: "DummyBrand",
            priceSell: 39000,
            priceOriginal: 49000,
            discount: 20,
            image: require("../../assets/images/items/shoes1.jpg"),
          },
          {
            id: "dummy2",
            name: "테스트 러닝화",
            brand: "TestBrand",
            priceSell: 69000,
            priceOriginal: 99000,
            discount: 30,
            image: require("../../assets/images/items/shoes1.jpg"),
          },
          {
            id: "dummy3",
            name: "데일리 샌들",
            brand: "SampleCo",
            priceSell: 29000,
            priceOriginal: 29000,
            discount: 0,
            image: require("../../assets/images/items/shoes1.jpg"),
          },
        ];

        const sampled = shuffleArray(dummyData);
        setShuffledImages1(sampled);
        setShuffledImages2(sampled);
      }
    };

    fetchProducts();
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
                <Pressable
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={styles.productContainer}
                >
                  <View style={{ position: "relative" }}>
                    <Image
                      source={item.image}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />

                    <Pressable
                      onPress={() => toggleLike(item)}
                      style={styles.heartIconContainer}
                    >
                      <Ionicons
                        name={
                          likedItems.some((liked) => liked.id === item.id)
                            ? "heart"
                            : "heart-outline"
                        }
                        size={20}
                        color="#FF2D55"
                      />
                    </Pressable>
                  </View>

                  <View style={{ alignItems: "flex-start" }}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                    <Text
                      style={styles.nameText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.name.replace(/_/g, " ")}
                    </Text>

                    {item.discount > 0 ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Text style={styles.discountText}>
                          {item.discount}%
                        </Text>
                        <Text style={styles.priceText}>
                          {item.priceSell.toLocaleString()}원
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.priceText}>
                        {item.priceSell.toLocaleString()}원
                      </Text>
                    )}
                  </View>
                </Pressable>
              )}
            />

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
                <Pressable
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={styles.productContainer}
                >
                  <View style={{ position: "relative" }}>
                    <Image
                      source={item.image}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />

                    <Pressable
                      onPress={() => toggleLike(item)}
                      style={styles.heartIconContainer}
                    >
                      <Ionicons
                        name={
                          likedItems.some((liked) => liked.id === item.id)
                            ? "heart"
                            : "heart-outline"
                        }
                        size={20}
                        color="#FF2D55"
                      />
                    </Pressable>
                  </View>
                  <View style={{ alignItems: "flex-start" }}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                    <Text
                      style={styles.nameText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.name.replace(/_/g, " ")}
                    </Text>

                    {item.discount > 0 ? (
                      <>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Text style={styles.discountText}>
                            {item.discount}%
                          </Text>
                          <Text style={styles.priceText}>
                            {item.priceSell.toLocaleString()}원
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.priceText}>
                        {item.priceSell.toLocaleString()}원
                      </Text>
                    )}
                  </View>
                </Pressable>
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
    width: 1320,
  },
  productContainer: {
    width: 120,
    height: 220,
    alignItems: "flex-start",
    marginHorizontal: 5,
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 5,
  },
  brandText: {
    fontFamily: "P-Bold",
    fontSize: 14,
    color: "#333",
    marginVertical: 3,
  },
  nameText: {
    fontFamily: "P-regular",
    fontSize: 14,
    marginBottom: 4,
  },
  priceText: {
    fontFamily: "P-Bold",
    fontSize: 14,
  },
  discountText: {
    fontFamily: "P-Bold",
    fontSize: 14,
    color: "#FF2D55",
  },
  heartIconContainer: {
    position: "absolute",
    bottom: 7,
    right: 4,
    borderRadius: 12,
    padding: 5,
    elevation: 3,
  },
});
