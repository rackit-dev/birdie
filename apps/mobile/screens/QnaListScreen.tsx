import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";
import CustomHeader from "../components/CustomHeader";

export default function QnaListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, name, price, image } = route.params as {
    id: string;
    name: string;
    price: number;
    image: string;
  };

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<boolean[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const IMAGE_URL = process.env.EXPO_PUBLIC_API_IMAGE_URL;

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/inquiry/by_product`, {
          params: { product_id: id },
        });
        const list = res.data.inquiries || [];

        // 이미지 탐색 (리뷰와 같은 방식)
        const withImages = await Promise.all(
          list.map(async (inq: any) => {
            const imgs: string[] = [];
            for (let idx = 1; idx <= 5; idx++) {
              const url = `${IMAGE_URL}/inquiries/${inq.id}/img_${idx}.png`;
              try {
                const head = await axios.head(url);
                if (head.status === 200) {
                  imgs.push(url);
                } else break;
              } catch {
                break;
              }
            }
            return { ...inq, images: imgs };
          })
        );

        setInquiries(withImages);
      } catch (err) {
        console.error("문의 불러오기 실패:", err);
      }
    };
    fetchInquiries();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="상품 문의"
        showBackButton
        onPressBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll}>
        <Text style={styles.totalText}>총 {inquiries.length}개</Text>

        {inquiries.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              const updated = [...expandedItems];
              updated[index] = !expandedItems[index];
              setExpandedItems(updated);
            }}
            style={styles.inquiryItem}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {/* 왼쪽 */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.typeText}>{item.type}</Text>
                <Text style={styles.contentPreview} numberOfLines={1}>
                  {item.content}
                </Text>
                <Text style={styles.metaText}>
                  {item.answer ? "답변 완료" : "답변 대기"} · {item.user_name} ·{" "}
                  {formatDate(item.created_at)}
                </Text>
              </View>

              {/* 오른쪽 미리보기 */}
              {item.images && item.images.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImages(item.images);
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
              <View style={styles.answerBox}>
                <Text style={styles.fullContent}>{item.content}</Text>

                {item.answer && (
                  <>
                    <View style={styles.divider} />
                    <View>
                      <Text style={styles.answerTitle}>답변</Text>
                      <Text style={styles.answerText}>{item.answer}</Text>
                      <Text style={styles.answerDate}>
                        {formatDate(item.updated_at)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={() => navigation.navigate("Qna", { id, name, price, image })}
          style={styles.askButton}
        >
          <Text style={styles.askButtonText}>판매자에게 문의하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 이미지 모달 */}
      <Modal
        isVisible={imageModalVisible}
        onBackdropPress={() => setImageModalVisible(false)}
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
            {selectedImages.map((imgUrl, i) => (
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
            <Text style={{ color: "white", fontSize: 14, fontFamily: "P-500" }}>
              {currentIndex + 1} / {selectedImages.length}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setImageModalVisible(false)}
            style={{ position: "absolute", top: 60, right: 20 }}
          >
            <Text style={{ fontSize: 30, fontFamily: "P-500", color: "white" }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1, padding: 16 },
  totalText: { fontSize: 18, fontFamily: "P-600", marginBottom: 16 },
  inquiryItem: {
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  typeText: {
    fontFamily: "P-500",
    color: "#666",
    fontSize: 13,
    marginBottom: 2,
  },
  contentPreview: {
    fontFamily: "P-600",
    fontSize: 16,
  },
  metaText: {
    fontFamily: "P-500",
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  answerBox: {
    marginTop: 12,
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 6,
  },
  fullContent: {
    fontFamily: "P-400",
    color: "#333",
    fontSize: 16,
    marginVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  answerTitle: {
    fontFamily: "P-600",
    fontSize: 16,
    marginBottom: 4,
  },
  answerText: {
    fontFamily: "P-400",
    color: "#444",
    fontSize: 16,
  },
  answerDate: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },
  askButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  askButtonText: { fontFamily: "P-600", fontSize: 16 },
});
