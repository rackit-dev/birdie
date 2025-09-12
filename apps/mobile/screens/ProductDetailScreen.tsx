import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import Modal from "react-native-modal";
import { useRoute, useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import CustomHeader from "../components/CustomHeader";
import useLikeStore, { Product } from "@/store/useLikeStore";
import { useCartStore } from "../store/useCartStore";
import { useUserIdStore } from "../store/useUserIdStore";

const TABS = ["정보", "추천", "후기", "문의"];

export default function ProductDetail() {
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { id } = route.params as { id: string };
  const [currentTab, setCurrentTab] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [optionTypes, setOptionTypes] = useState<any[]>([]);
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<boolean[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [qtyAlertVisible, setQtyAlertVisible] = useState(false);
  const [pendingQty, setPendingQty] = useState<number>(1);
  const [alreadyInCartAlert, setAlreadyInCartAlert] = useState(false);
  const [cartSuccessVisible, setCartSuccessVisible] = useState(false);
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const { width: screenWidth } = useWindowDimensions();
  const [imageHeights, setImageHeights] = useState<number[]>([]);
  const { likedItems, toggleLike, fetchLikedItems } = useLikeStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewImages, setReviewImages] = useState<Record<string, string[]>>(
    {}
  );
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedReviewImages, setSelectedReviewImages] = useState<string[]>(
    []
  );
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchCartCount = useCartStore((s) => s.fetchCount);
  const invalidateCart = useCartStore((s) => s.invalidate);

  const userId = useUserIdStore((s) => s.id);
  // const name = useUserIdStore((s) => s.name);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const IMAGE_URL = process.env.EXPO_PUBLIC_API_IMAGE_URL;

  /* 테스트용
  useEffect(() => {
    if (!product || !userId) return;

    console.log("리뷰 POST에 필요한 값 확인");
    console.log("user_id:", userId);
    console.log("user_name:", name);
    console.log("product_id:", product.id);
  }, [product, userId]); */

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  const buildOptionPayload = () => {
    const payload: any = {};
    optionTypes.forEach((t, idx) => {
      payload[`option_${idx + 1}_type`] = t.option_type;
      payload[`option_${idx + 1}_value`] = selected[t.option_type] ?? null;
    });
    return payload;
  };

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: "none" } });

    return () => {
      parent?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchCartCount();
        fetchLikedItems();
      }
    }, [fetchLikedItems, fetchCartCount])
  );

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/reviews/by_product`, {
          params: { product_id: id },
        });
        const list = res.data.product_reviews || [];

        setReviews(list);

        const imagesMap: Record<string, string[]> = {};

        for (const rev of list) {
          const imgs: string[] = [];

          for (let idx = 1; idx <= 5; idx++) {
            const url = `${IMAGE_URL}/reviews/${rev.id}/img_${idx}.png`;
            try {
              const head = await axios.head(url);

              if (head.status === 200) {
                imgs.push(url);
              } else {
                break;
              }
            } catch (err: any) {
              console.log("요청 실패:", url, err.message);
              break;
            }
          }

          imagesMap[rev.id] = imgs;
        }
        setReviewImages(imagesMap);
      } catch (err) {
        console.error("리뷰 불러오기 실패:", err);
      }
    };
    fetchReviews();
  }, [id]);

  // 이름 마스킹 함수
  const maskName = (name: string) => {
    if (!name) return "";
    return name[0] + "**";
  };

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/inquiry/by_product`, {
          params: { product_id: id },
        });
        const list = res.data.inquiries || [];

        // 이미지 존재 여부 확인 후 배열 붙이기
        const imagesMap: Record<string, string[]> = {};
        for (const inq of list) {
          const imgs: string[] = [];
          for (let idx = 1; idx <= 5; idx++) {
            const url = `${IMAGE_URL}/inquiries/${inq.id}/img_${idx}.png`;
            try {
              const head = await axios.head(url);
              if (head.status === 200) {
                imgs.push(url);
              } else {
                break;
              }
            } catch {
              break;
            }
          }
          imagesMap[inq.id] = imgs;
        }

        // inquiries에 images 붙이기
        const withImages = list.map((inq: any) => ({
          ...inq,
          images: imagesMap[inq.id] || [],
        }));

        setInquiries(withImages);
        setInquiryCount(res.data.total_count || 0);
      } catch (err) {
        console.error("문의 불러오기 실패:", err);
      }
    };

    if (currentTab === 3) {
      fetchInquiries();
    }
  }, [id, currentTab]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/option_types`, {
          params: { product_id: id },
        });
        const types = res.data.product_option_types;
        setOptionTypes(types);

        const optionValues: Record<string, string[]> = {};
        for (const t of types) {
          const optRes = await axios.get(`${API_URL}/products/options`, {
            params: { product_id: id, product_option_type_id: t.id },
          });
          optionValues[t.option_type] = optRes.data.product_options;

          console.log(
            `옵션값 for ${t.option_type}:`,
            optRes.data.product_options
          );
        }

        setOptions(optionValues);
      } catch (err) {
        console.error("옵션 불러오기 실패", err);
      }
    };
    fetchOptions();
  }, [id]);

  const handleDeleteLike = async (product: Product) => {
    try {
      if (!product.product_like_id) {
        console.warn("삭제할 product_like_id가 없습니다.");
        return;
      }
      await axios.delete(`${API_URL}/products/like`, {
        params: { product_like_id: product.product_like_id },
      });
      if (userId) {
        fetchLikedItems();
      }
    } catch (err) {
      console.error("좋아요 삭제 실패:", err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/products?page=1&items_per_page=309`
        );
        const found = response.data.products.find(
          (item: any) => item.id === id
        );
        setProduct(found);
      } catch (error) {
        console.error("상품 가져오기 실패", error);

        // 테스트용 더미 데이터
        setProduct({
          id: "dummy-001",
          name: "더미 상품명",
          category_main: "신발",
          category_sub: "브랜드",
          product_number: "MS123456",
          created_at: new Date().toISOString(),
          price_sell: 89000,
          price_whole: 129000,
          discount_rate: 31,
        });
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (currentTab !== 0 || !product) return;

    let isMounted = true;
    const loadDetailImages = async () => {
      const imgs: string[] = [];
      imgs.push(`${IMAGE_URL}/products/defaults/begin.jpg`);

      let idx = 1;
      while (true) {
        const url = `${IMAGE_URL}/products/${product.name}/detail_${idx}.jpg`;
        try {
          const res = await axios.head(url);
          if (res.status === 200) {
            imgs.push(url);
            idx++;
          } else {
            break;
          }
        } catch {
          break;
        }
      }

      imgs.push(`${IMAGE_URL}/products/defaults/end.jpg`);
      if (isMounted) setDetailImages(imgs);

      const heights: number[] = [];
      await Promise.all(
        imgs.map(
          (img, i) =>
            new Promise<void>((resolve) => {
              Image.getSize(
                img,
                (w, h) => {
                  heights[i] = (screenWidth * h) / w;
                  resolve();
                },
                () => {
                  heights[i] = 300;
                  resolve();
                }
              );
            })
        )
      );
      if (isMounted) setImageHeights(heights);
    };

    loadDetailImages();
    return () => {
      isMounted = false;
    };
  }, [currentTab, product, IMAGE_URL, screenWidth]);

  if (!product) return <Text>Loading...</Text>;

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return (
          <View style={{ paddingTop: 50 }}>
            <ScrollView
              style={{ marginBottom: 20 }}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {detailImages.map((img, i) => (
                <View key={img} style={{ width: "100%", alignItems: "center" }}>
                  <Image
                    source={{ uri: img }}
                    style={{
                      width: screenWidth - 25,
                      height: imageHeights[i] || 300,
                    }}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        );
      case 1:
        return (
          <View style={styles.tabContent}>
            <Text>추천 상품</Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.tabContent}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10, marginBottom: 20 }}
            >
              {reviews
                .flatMap((rev) => reviewImages[rev.id] || [])
                .slice(0, 6) // 최대 6장까지만
                .map((imgUrl, i) => (
                  <Image
                    key={i}
                    source={{ uri: imgUrl }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 6,
                      marginRight: 10,
                    }}
                  />
                ))}
            </ScrollView>

            {reviews.length === 0 ? (
              <Text
                style={{
                  color: "#666",
                  textAlign: "center",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                아직 등록된 후기가 없습니다.
              </Text>
            ) : (
              reviews.map((rev) => (
                <View
                  key={rev.id}
                  style={{
                    marginBottom: 20,
                    borderBottomColor: "#eee",
                    borderBottomWidth: 1,
                    paddingBottom: 15,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={{ fontWeight: "700", marginRight: 8 }}>
                        {maskName(rev.user_name)}
                      </Text>
                      {[...Array(5)].map((_, i) => (
                        <FontAwesome
                          key={i}
                          name={i < rev.rating ? "star" : "star-o"}
                          size={14}
                          color="#FFD700"
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>

                    <Text style={{ marginTop: 8, fontSize: 14, color: "#333" }}>
                      {rev.content}
                    </Text>
                  </View>

                  {reviewImages[rev.id]?.[0] && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedReviewImages(reviewImages[rev.id] || []);
                        setImageModalVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: reviewImages[rev.id][0] }}
                        style={{ width: 80, height: 80, borderRadius: 6 }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.tabContent}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "600" }}>
                상품문의 ({inquiryCount})
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("QnaList", {
                    id: product.id,
                    name: product.name,
                    price: product.price_sell,
                    image: `${IMAGE_URL}/products/${product.name}/thumbnail.jpg`,
                  })
                }
              >
                <Text
                  style={{
                    fontFamily: "P-400",
                    fontSize: 14,
                    color: "#666",
                    textDecorationLine: "underline",
                  }}
                >
                  더보기
                </Text>
              </TouchableOpacity>
            </View>

            {inquiries.length === 0 ? (
              <Text
                style={{ color: "#666", textAlign: "center", marginTop: 20 }}
              >
                아직 등록된 문의가 없습니다.
              </Text>
            ) : (
              inquiries.slice(0, 3).map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    const updated = [...expandedItems];
                    updated[index] = !updated[index];
                    setExpandedItems(updated);
                  }}
                  style={styles.inquiryItem}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text
                        style={{
                          fontFamily: "P-500",
                          color: "#666",
                          fontSize: 13,
                          marginBottom: 2,
                        }}
                      >
                        {item.type}
                      </Text>
                      <Text
                        style={{ fontFamily: "P-600", fontSize: 16 }}
                        numberOfLines={1}
                      >
                        {item.content}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "P-500",
                          fontSize: 13,
                          color: "#999",
                          marginTop: 4,
                        }}
                      >
                        {item.status === "PENDING" ? "답변 대기" : "답변 완료"}{" "}
                        · {formatDate(item.created_at)}
                      </Text>
                    </View>

                    {item.images && item.images.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedReviewImages(item.images); // 전체 배열 넣어줌
                          setImageModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: item.images[0] }}
                          style={{ width: 80, height: 80, borderRadius: 6 }}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {expandedItems[index] && (
                    <View
                      style={{
                        marginTop: 12,
                        backgroundColor: "#f7f7f7",
                        padding: 12,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "P-400",
                          color: "#333",
                          fontSize: 16,
                          marginTop: 8,
                          marginBottom: 8,
                        }}
                      >
                        {item.content}
                      </Text>

                      {item.answer && (
                        <>
                          <View
                            style={{
                              height: 1,
                              backgroundColor: "#eee",
                              marginVertical: 10,
                            }}
                          />
                          <View>
                            <Text
                              style={{
                                fontFamily: "P-600",
                                fontSize: 16,
                                marginTop: 8,
                                marginBottom: 4,
                              }}
                            >
                              답변
                            </Text>
                            <Text
                              style={{
                                fontFamily: "P-400",
                                color: "#444",
                                fontSize: 16,
                              }}
                            >
                              {item.answer}
                            </Text>
                            <Text
                              style={{
                                color: "#aaa",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              {formatDate(item.updated_at)}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Qna", {
                  id: product.id,
                  name: product.name,
                  price: product.price_sell,
                  image: `${IMAGE_URL}/products/${product.name}/thumbnail.jpg`,
                })
              }
              style={{
                marginTop: 20,
                borderWidth: 1,
                borderColor: "#ccc",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 16 }}>
                판매자에게 문의하기
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {cartSuccessVisible && (
        <View
          style={{
            position: "absolute",
            bottom: 90,
            left: 20,
            right: 20,
            backgroundColor: "black",
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 10,
            zIndex: 999,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
            장바구니에 담겼습니다.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
            <Text
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 14,
                textDecorationLine: "underline",
              }}
            >
              바로가기
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <CustomHeader
        showBackButton
        onPressBack={() => navigation.goBack()}
        onPressSearch={() => navigation.navigate("Search")}
        onPressCart={() => navigation.navigate("Cart")}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.cardContainer}>
          <Image
            source={{
              uri: `${IMAGE_URL}/products/${product.name}/thumbnail.jpg`,
            }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.section}>
            <Text style={styles.brandText}>{product.category_sub}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.title}>{product.name.replace(/_/g, " ")}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingBottom: 10,
              }}
            >
              <Text style={{ color: "orange", fontSize: 20 }}>★</Text>
              <Text style={styles.smallText}>
                {reviews.length > 0
                  ? (
                      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                      reviews.length
                    ).toFixed(1)
                  : "0.0"}
              </Text>
              <Text style={[styles.smallText, { marginLeft: 8 }]}>
                후기 {reviews.length}개
              </Text>
            </View>
            {product.discount_rate > 0 && (
              <Text style={styles.priceOriginal}>
                {product.price_whole.toLocaleString()}원
              </Text>
            )}
            <Text style={styles.priceDiscount}>
              {product.discount_rate > 0 && (
                <Text style={{ color: "#FF2D55" }}>
                  {product.discount_rate}%{" "}
                </Text>
              )}
              <Text style={{ color: "#000" }}>
                {product.price_sell.toLocaleString()}원
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.banner}>
            <Text>첫 구매 20% 쿠폰 받으러 가기 ➤</Text>
          </View>
          <View style={styles.earn}>
            <Text style={styles.sectionTitle}>적립</Text>
            <Text>후기 적립 2,500원</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>결제혜택</Text>
            <Text>카카오페이 x 페이머니 6천원 할인</Text>
            <Text style={{ marginTop: 15 }}>무이자 혜택 보기</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>배송</Text>
            <Text>5만원 이상 구매 시 무료배송</Text>
            <Text>06.26 도착 예정 · CJ대한통운</Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.tabBar}>
            {TABS.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setCurrentTab(index)}
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabText,
                    currentTab === index && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {renderTabContent()}
        </View>
      </ScrollView>

      <View style={styles.fixedBuy}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => {
            if (userId) toggleLike(product);
          }}
        >
          {!likedItems.some((liked) => liked.id === product.id) ? (
            <>
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={[styles.likeText, { color: "#000" }]}></Text>
            </>
          ) : (
            <>
              <Ionicons name="heart" size={24} color="#FF2D55" />
              <Text style={[styles.likeText, { color: "#FF2D55" }]}></Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => {
            setShowModal(true);
          }}
        >
          <Text style={styles.buyText}>구매하기</Text>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        swipeDirection="down"
        onSwipeComplete={() => setShowModal(false)}
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />
          <Text style={styles.sectionTitle}>옵션 선택</Text>

          <View>
            <TouchableOpacity
              style={[
                styles.dropdownBox,
                isOptionOpen && styles.dropdownBoxExpanded,
              ]}
              onPress={() => setIsOptionOpen(!isOptionOpen)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.dropdownText}>
                  {Object.values(selected).join(", ") || "옵션을 선택하세요"}
                </Text>
                <Ionicons
                  name={isOptionOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="black"
                />
              </View>
            </TouchableOpacity>

            {isOptionOpen && (
              <View style={styles.optionScrollContainer}>
                <ScrollView>
                  {optionTypes.map((t) => (
                    <View key={t.id} style={{ marginTop: 15 }}>
                      <Text style={styles.sectionTitle}>
                        {t.option_type} 선택
                      </Text>
                      <ScrollView horizontal>
                        {options[t.option_type]?.map((val) => (
                          <TouchableOpacity
                            key={val}
                            style={[
                              styles.optionItem,
                              selected[t.option_type] === val &&
                                styles.optionItemSelected,
                            ]}
                            onPress={() =>
                              setSelected((prev) => ({
                                ...prev,
                                [t.option_type]: val,
                              }))
                            }
                          >
                            <Text>{val}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ ...styles.sectionTitle, marginBottom: 15 }}>
              수량 선택
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (pendingQty === 1) {
                    setQtyAlertVisible(true);
                    return;
                  }
                  setPendingQty((prev) => prev - 1);
                }}
                style={styles.qtyButton}
              >
                <Text style={{ fontSize: 20 }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18 }}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((prev) => prev + 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 2, marginLeft: 1 }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Modal
            isVisible={qtyAlertVisible}
            onBackdropPress={() => setQtyAlertVisible(false)}
          >
            <View style={styles.alertModalContent}>
              <Text style={styles.alertText}>
                더 이상 수량을 줄일 수 없습니다.
              </Text>
              <TouchableOpacity
                onPress={() => setQtyAlertVisible(false)}
                style={styles.alertButton}
              >
                <Text style={styles.alertButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal
            isVisible={alreadyInCartAlert}
            onBackdropPress={() => setAlreadyInCartAlert(false)}
          >
            <View style={styles.alertModalContent}>
              <Text style={styles.alertText}>
                이미 장바구니에 있는 상품입니다.
              </Text>
              <TouchableOpacity
                onPress={() => setAlreadyInCartAlert(false)}
                style={styles.alertButton}
              >
                <Text style={styles.alertButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={async () => {
                try {
                  await axios.post(`${API_URL}/cartitems`, {
                    user_id: userId,
                    product_id: product.id,
                    quantity,
                    ...buildOptionPayload(),
                  });

                  setCartSuccessVisible(true);
                  setTimeout(() => setCartSuccessVisible(false), 2000);
                  setShowModal(false);

                  if (!userId) return;

                  if (invalidateCart) {
                    await invalidateCart();
                  } else {
                    await fetchCartCount();
                  }
                } catch (error: any) {
                  if (error?.response?.status === 422) {
                    setAlreadyInCartAlert(true);
                  } else {
                    alert("장바구니 추가 중 오류가 발생했습니다.");
                  }
                }
              }}
            >
              <Text style={{ ...styles.buyText, color: "#000" }}>장바구니</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => {
                setShowModal(false);
                navigation.navigate("Purchase", {
                  fromCart: false,
                  products: [
                    {
                      id: product.id,
                      brand: product.category_sub,
                      image: `${IMAGE_URL}/products/${product.name}/thumbnail.jpg`,
                      name: product.name.replace(/_/g, " "),
                      quantity,
                      price: product.price_sell * quantity,
                      ...buildOptionPayload(),
                    },
                  ],
                });
              }}
            >
              <Text style={styles.buyText}>구매하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={imageModalVisible}
        onBackdropPress={() => setImageModalVisible(false)}
        onBackButtonPress={() => setImageModalVisible(false)}
        style={{ margin: 0 }}
      >
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / Dimensions.get("window").width
              );
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{
              alignItems: "center",
              paddingVertical: 40,
            }}
          >
            {selectedReviewImages.map((imgUrl, i) => (
              <Image
                key={i}
                source={{ uri: imgUrl }}
                style={{
                  width: Dimensions.get("window").width,
                  height: Dimensions.get("window").height * 0.6,
                }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>

          <View
            style={{
              position: "absolute",
              bottom: 40,
              alignSelf: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
              {currentIndex + 1} / {selectedReviewImages.length}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setImageModalVisible(false)}
            style={{ position: "absolute", top: 60, right: 20 }}
          >
            <Text style={{ fontFamily: "P-600", color: "white", fontSize: 30 }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  cardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  customHeader: {
    height: 110,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIcon: { padding: 4 },
  headerIconsRight: { flexDirection: "row", alignItems: "center" },
  productImage: { width: "100%", height: 450 },
  brandText: {
    fontSize: 16,
    fontWeight: "600",
  },
  smallText: {
    fontSize: 14,
  },
  productInfo: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 5,
  },
  priceOriginal: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  priceDiscount: {
    fontSize: 20,
    fontWeight: "700",
    paddingTop: 3,
    paddingBottom: 15,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 15,
    color: "#999",
  },
  tabTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  tabContent: {
    padding: 20,
  },
  fixedBuy: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    paddingBottom: 30,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderTopColor: "#eee",
    borderTopWidth: 1,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeText: {
    marginLeft: 4,
    marginRight: 4,
    fontSize: 16,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 20,
  },
  buyButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 8,
  },
  cartButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buyText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  banner: {
    backgroundColor: "#eee",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  earn: {
    padding: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: Dimensions.get("window").height * 0.85,
    paddingBottom: 90,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 10,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 12,
    overflow: "hidden",
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
  },
  optionScrollContainer: {
    maxHeight: 250,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionItem: {
    padding: 12,
    backgroundColor: "#fff",
  },
  optionText: {
    fontSize: 16,
  },
  dropdownBoxExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  optionItemSelected: {
    backgroundColor: "#f9f9f9",
  },
  buttonRowFixed: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  optionListWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastOneText: {
    fontSize: 12,
    color: "red",
  },
  alertModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  alertText: {
    fontSize: 16,
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  inquiryItem: {
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});
