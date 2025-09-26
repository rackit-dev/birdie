import { StyleSheet, FlatList, Image, Pressable, Platform } from "react-native";
import { Text, View } from "@/components/Themed";
import { useState, useEffect, useCallback } from "react";
import useLikeStore, { Product } from "@/store/useLikeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import CustomHeader from "../components/CustomHeader";
import LinearGradient from "react-native-linear-gradient";
import { useCartStore } from "../store/useCartStore";
import { useUserIdStore } from "../store/useUserIdStore";
import { API_URL, IMAGE_URL } from "@env";

const shuffleArray = (array: Product[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export default function HomeScreen() {
  const [bannerImage, setBannerImage] = useState(
    require("../assets/images/image2.png")
  );
  const [shuffledImages1, setShuffledImages1] = useState<Product[]>([]);
  const [shuffledImages2, setShuffledImages2] = useState<Product[]>([]);
  const { likedItems, toggleLike, fetchLikedItems } = useLikeStore();
  const [randomSlogan, setRandomSlogan] = useState("");
  const fetchCount = useCartStore((s) => s.fetchCount);

  type Navigation = NativeStackNavigationProp<RootStackParamList, "Main">;
  const navigation = useNavigation<Navigation>();
  const userId = useUserIdStore((s) => s.id);

  const wrapName = (raw: string) => {
    let s = raw.replace(/_/g, " ");

    // -, /, . 뒤에는 줄바꿈 허용
    s = s.replace(/([\-\/\.])/g, "$1\u200B");

    // 영문↔숫자 경계
    s = s
      .replace(/([A-Za-z])(\d)/g, "$1\u200B$2")
      .replace(/(\d)([A-Za-z])/g, "$1\u200B$2");

    // 긴 영숫자 연속(8자 이상)은 4자마다 포인트
    s = s.replace(/[A-Za-z0-9]{8,}/g, (m) => m.replace(/(.{4})/g, "$1\u200B"));

    return s;
  };

  const slogans = [
    "매일의 플레이를 특별하게,\n영스배드민턴",
    "당신만의 배드민턴\n라이프를 시작하세요",
    "초보부터 고수까지,\n모두의 배드민턴 스토어",
    "스포츠를 즐기는 가장 빠른 방법,\n영스 배드민턴",
  ];

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchCount();
        fetchLikedItems();
      }
    }, [fetchCount, fetchLikedItems, userId])
  );

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * slogans.length);
    setRandomSlogan(slogans[randomIndex]);
  }, []);

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
            priceOriginal: item.price_whole,
            discount: item.discount_rate,
            image: {
              uri: `${IMAGE_URL}/products/${item.name}/thumbnail.jpg`,
            },
            isActive: item.is_active,
          }));

          const getRandomSample = (array: Product[], size: number) => {
            const shuffled = [...array].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, size);
          };

          const sampled = getRandomSample(fullData, 20);
          setShuffledImages1(sampled);
          setShuffledImages2(getRandomSample(fullData, 20));

          const randomBanner =
            fullData[Math.floor(Math.random() * fullData.length)];
          if (randomBanner?.image) {
            setBannerImage(randomBanner.image);
          }
        }
      } catch (err) {
        console.error("상품 API 호출 실패:", err);

        const dummyData: Product[] = [
          {
            id: "dummy1",
            name: "테스트 스니커즈",
            brand: "DummyBrand",
            priceSell: 39000,
            priceOriginal: 49000,
            discount: 20,
            image: require("../assets/images/items/shoes1.jpg"),
            isActive: true,
          },
          {
            id: "dummy2",
            name: "테스트 러닝화",
            brand: "TestBrand",
            priceSell: 69000,
            priceOriginal: 99000,
            discount: 30,
            image: require("../assets/images/items/shoes1.jpg"),
            isActive: true,
          },
          {
            id: "dummy3",
            name: "데일리 샌들",
            brand: "SampleCo",
            priceSell: 29000,
            priceOriginal: 29000,
            discount: 0,
            image: require("../assets/images/items/shoes1.jpg"),
            isActive: true,
          },
        ];

        const sampled = shuffleArray(dummyData);
        setShuffledImages1(sampled);
        setShuffledImages2(sampled);
        setBannerImage(dummyData[0].image);
      }
    };

    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader
        logo
        onPressSearch={() => navigation.navigate("Search")}
        onPressCart={() => navigation.navigate("Cart")}
      />
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.bannerWrapper}>
              <Image
                source={bannerImage}
                style={styles.image}
                resizeMode="cover"
                onError={() =>
                  setBannerImage(require("../assets/images/image2.png"))
                }
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent"]}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                style={styles.gradientOverlay}
              />
              <View style={styles.overlay}>
                <Text style={styles.sloganText}>{randomSlogan}</Text>
              </View>
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
                  onPress={() => {
                    navigation.navigate("ProductDetail", { id: item.id });
                  }}
                  style={styles.productContainer}
                >
                  <View style={{ position: "relative" }}>
                    <Image
                      source={item.image}
                      style={styles.itemImage}
                      resizeMode="cover"
                      onError={(e) => {
                        console.warn(
                          "이미지 로딩 실패:",
                          item.name,
                          e.nativeEvent
                        );
                      }}
                    />

                    {!item.isActive && (
                      <View
                        style={{
                          position: "absolute",
                          top: 5,
                          left: 5,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontFamily: "P-500",
                          }}
                        >
                          품절
                        </Text>
                      </View>
                    )}

                    {!item.isActive && (
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(255,255,255,0.5)",
                          borderRadius: 8,
                        }}
                      />
                    )}

                    <Pressable
                      onPress={() => toggleLike(item)}
                      style={styles.heartWrapper}
                    >
                      {!likedItems.some((liked) => liked.id === item.id) ? (
                        <>
                          <Ionicons
                            name="heart"
                            size={18}
                            color="rgba(128,128,128,0.4)"
                            style={styles.absoluteIcon}
                          />
                          <Ionicons
                            name="heart-outline"
                            size={18}
                            color="#ffffff"
                          />
                        </>
                      ) : (
                        <Ionicons name="heart" size={17} color="#FF2D55" />
                      )}
                    </Pressable>
                  </View>

                  <View style={{ alignItems: "flex-start" }}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                    <Text
                      style={styles.nameText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      {...(Platform.OS === "ios"
                        ? { lineBreakStrategyIOS: "none" as const }
                        : { textBreakStrategy: "balanced" as const })}
                    >
                      {wrapName(item.name)}
                    </Text>
                    {(item.discount ?? 0) > 0 ? (
                      <View style={{ flexDirection: "row", gap: 3 }}>
                        <Text style={styles.discountText}>
                          {item.discount}%
                        </Text>
                        <Text style={styles.priceText}>
                          {item.priceSell?.toLocaleString()}원
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.priceText}>
                        {item.priceSell?.toLocaleString()}원
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
                  onPress={() =>
                    navigation.navigate("ProductDetail", { id: item.id })
                  }
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
                      style={styles.heartWrapper}
                    >
                      {!likedItems.some((liked) => liked.id === item.id) ? (
                        <>
                          <Ionicons
                            name="heart"
                            size={18}
                            color="rgba(128,128,128,0.4)"
                            style={styles.absoluteIcon}
                          />
                          <Ionicons
                            name="heart-outline"
                            size={18}
                            color="#ffffff"
                          />
                        </>
                      ) : (
                        <Ionicons name="heart" size={17} color="#FF2D55" />
                      )}
                    </Pressable>
                  </View>

                  <View style={{ alignItems: "flex-start" }}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                    <Text
                      style={styles.nameText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      {...(Platform.OS === "ios"
                        ? { lineBreakStrategyIOS: "none" as const }
                        : { textBreakStrategy: "balanced" as const })}
                    >
                      {wrapName(item.name)}
                    </Text>
                    {(item.discount ?? 0) > 0 ? (
                      <View style={{ flexDirection: "row", gap: 3 }}>
                        <Text style={styles.discountText}>
                          {item.discount}%
                        </Text>
                        <Text style={styles.priceText}>
                          {item.priceSell?.toLocaleString()}원
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.priceText}>
                        {item.priceSell?.toLocaleString()}원
                      </Text>
                    )}
                  </View>
                </Pressable>
              )}
            />
          </>
        }
        ListFooterComponent={
          <View
            style={{
              width: "100%",
              backgroundColor: "#f9f9f9",
              paddingVertical: 32,
              paddingHorizontal: 17,
              marginTop: 10,
            }}
          >
            <Text style={{ marginTop: 10, fontFamily: "P-500", fontSize: 16 }}>
              고객센터 010-4089-1315
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
                fontFamily: "P-700",
                fontSize: 14,
                color: "grey",
              }}
            >
              사업자 정보
            </Text>
            <Text
              style={{
                marginTop: 15,
                fontFamily: "P-700",
                fontSize: 14,
                color: "grey",
              }}
            >
              메일{" "}
              <Text style={{ fontFamily: "P-500", color: "#B0B0B0" }}>
                rackit.biz@gmail.com
              </Text>
            </Text>

            <Text
              style={{
                marginTop: 10,
                fontFamily: "P-700",
                fontSize: 14,
                color: "grey",
              }}
            >
              상호명{" "}
              <Text style={{ fontFamily: "P-500", color: "#B0B0B0" }}>
                배드민턴창고 지족점
              </Text>
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: "P-700",
                fontSize: 14,
                color: "grey",
              }}
            >
              대표자{" "}
              <Text style={{ fontFamily: "P-500", color: "#B0B0B0" }}>
                정호영
              </Text>
            </Text>

            <Text
              style={{
                marginTop: 10,
                fontFamily: "P-700",
                fontSize: 14,
                color: "grey",
              }}
            >
              사업자등록번호{" "}
              <Text style={{ fontFamily: "P-500", color: "#B0B0B0" }}>
                5893500524
              </Text>
            </Text>

            <Text
              style={{
                marginTop: 10,
                fontFamily: "P-700",
                fontSize: 14,
                color: "grey",
              }}
            >
              사업장 소재지{" "}
              <Text style={{ fontFamily: "P-500", color: "#B0B0B0" }}>
                대전광역시 유성구 북유성대로 147 4층 (우 : 34078)
              </Text>
            </Text>

            <Text
              style={{
                marginTop: 10,
                fontFamily: "P-700",
                fontSize: 14,
                color: "grey",
              }}
            >
              통신판매업번호{" "}
              <Text style={{ fontFamily: "P-500", color: "#B0B0B0" }}>
                2024-대전유성-1546
              </Text>
            </Text>
          </View>
        }
        data={null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerWrapper: {
    width: "95%",
    aspectRatio: 4.5 / 5,
    marginBottom: 27,
    alignSelf: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    borderRadius: 10,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingLeft: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
    borderRadius: 10,
    pointerEvents: "none",
  },
  sloganText: {
    fontFamily: "P-600",
    fontSize: 30,
    color: "#fff",
    textAlign: "left",
    textShadowColor: "rgba(45, 45, 45, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  textContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginLeft: 15,
  },
  font: {
    fontFamily: "P-700",
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
    fontFamily: "P-600",
    fontSize: 14,
    marginVertical: 3,
  },
  nameText: {
    fontFamily: "P-500",
    fontSize: 14,
    marginBottom: 4,
  },
  priceText: {
    fontFamily: "P-600",
    fontSize: 14,
  },
  discountText: {
    fontFamily: "P-700",
    fontSize: 14,
    color: "#FF2D55",
  },
  heartIconContainer: {
    position: "absolute",
    bottom: 7,
    right: 4,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    zIndex: 2,
  },
  heartWrapper: {
    position: "absolute",
    bottom: 7,
    right: 4,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  absoluteIcon: {
    position: "absolute",
  },
});
