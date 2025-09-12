import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import CustomHeader from "../components/CustomHeader";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useUserIdStore } from "../store/useUserIdStore";
import axios from "axios";
import Modal from "react-native-modal";
import { launchImageLibrary } from "react-native-image-picker";

export default function QnaPage() {
  const route = useRoute();
  const { id, name, price, image } = route.params as {
    id: string;
    name: string;
    price: number;
    image: string;
  };

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const userId = useUserIdStore((s) => s.id);

  const [inquiryType, setInquiryType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const inquiryOptions = ["사이즈", "배송", "재입고", "상품상세문의"];

  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const handleSubmit = async () => {
    if (!inquiryType || !content) {
      Alert.alert("알림", "문의 유형, 내용을 모두 입력해주세요.");
      return;
    }

    if (!userId) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("type", inquiryType);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("product_id", id);

    // order_id optional → 값이 있을 때만 append
    // if (orderId) formData.append("order_id", orderId);

    images.forEach((uri, index) => {
      const extension = uri.split(".").pop() || "jpg";
      formData.append("images", {
        uri,
        type: extension === "png" ? "image/png" : "image/jpeg",
        name: `image_${index}.${extension}`,
      } as any);
    });

    for (const pair of (formData as any)._parts) {
      console.log("📤", pair[0], ":", pair[1]);
    }

    try {
      const res = await axios.post(`${API_URL}/users/inquiry`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("문의 등록 성공:", res.data);
      Alert.alert("알림", "문의가 등록되었습니다.", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("문의 등록 실패:", err);
      Alert.alert("오류", "등록 중 문제가 발생했습니다.");
    }
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 5,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.error("ImagePicker Error: ", response.errorMessage);
          return;
        }

        if (response.assets) {
          // 여러 장 선택된 경우 전부 map
          const uris = response.assets
            .map((asset) => asset.uri!)
            .filter(Boolean);

          setImages((prev) => {
            const newList = [...prev, ...uris];
            return newList.slice(0, 5); // 최대 5개만 유지
          });
        }
      }
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <CustomHeader
          title="문의 하기"
          showBackButton
          onPressBack={() => navigation.goBack()}
        />
        <KeyboardAwareScrollView
          style={{ flex: 1, backgroundColor: "#fff" }}
          contentContainerStyle={styles.container}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1 }}>
            <View style={styles.productBox}>
              <Image source={{ uri: image }} style={styles.productImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={styles.productTitle}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {name.replace(/_/g, " ")}
                </Text>
                <Text style={styles.productPrice}>
                  {price ? Number(price).toLocaleString() : "-"}원
                </Text>
              </View>
            </View>
            <View style={styles.formSection}>
              <Text style={styles.label}>문의 유형 (필수)</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setTypeModalVisible(true)}
              >
                <Text style={styles.selectText}>
                  {inquiryType || "문의유형을 선택해 주세요"}
                </Text>
              </TouchableOpacity>
            </View>
            <Modal
              isVisible={typeModalVisible}
              onBackdropPress={() => setTypeModalVisible(false)}
              swipeDirection="down"
              onSwipeComplete={() => setTypeModalVisible(false)}
              backdropTransitionOutTiming={0}
              style={styles.modal}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={{ fontSize: 18, fontWeight: "600" }}>
                    문의 유형
                  </Text>
                  <TouchableOpacity onPress={() => setTypeModalVisible(false)}>
                    <Text style={{ fontSize: 22 }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={inquiryOptions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => {
                        setInquiryType(item);
                        setTypeModalVisible(false);
                      }}
                    >
                      <Text style={{ fontSize: 16, color: "#333" }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Modal>
            <View style={styles.formSection}>
              <Text style={styles.label}>내용 (필수)</Text>
              <TextInput
                style={styles.textarea}
                placeholder="문의할 내용을 입력해주세요."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={content}
                onChangeText={setContent}
              />
            </View>
            <View style={styles.formSection}>
              <Text style={styles.label}>사진 첨부</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {images.map((uri, index) => (
                  <View key={index} style={{ position: "relative" }}>
                    <Image source={{ uri }} style={styles.uploadImage} />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={styles.removeButton}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {images.length < 5 && (
                  <TouchableOpacity
                    style={styles.uploadBox}
                    onPress={pickImage}
                  >
                    <Text style={{ color: "#8f8f8fff", fontSize: 24 }}>+</Text>
                    <Text style={{ color: "#6f6f6fff" }}>
                      {images.length}/5
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text
                style={{ color: "#848484ff", marginBottom: 7, marginTop: 8 }}
              >
                용량이 5MB 이하인 사진을 첨부할 수 있습니다. (최대 5장)
              </Text>
            </View>
            <View style={styles.formSection}>
              <Text style={styles.label}>유의 사항</Text>
              <Text style={{ color: "#5b5b5bff", marginBottom: 7 }}>
                • 상품 문의는 재입고, 사이즈, 배송 등 상품에 대하여 판매자에게
                문의하는 게시판입니다.
              </Text>

              <Text style={{ color: "#5b5b5bff", marginBottom: 7 }}>
                • 욕설, 비방, 거래 글, 분쟁 유발, 명예훼손, 허위 사실 유포, 타
                쇼핑몰 언급, 광고성 등의 부적절한 게시글은 금지합니다.
              </Text>

              <Text style={{ color: "#5b5b5bff", marginBottom: 7 }}>
                • 주문번호, 연락처, 계좌번호 등의 개인 정보 관련 내용은 공개되지
                않도록 주의하여 주시기 바랍니다. 개인 정보 노출로 인한 피해는
                영스배드민턴이 책임지지 않습니다.
              </Text>
            </View>
            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 18,
    paddingTop: 5,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  close: { fontSize: 20 },
  productBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 24,
  },
  productImage: { width: 70, height: 70, borderRadius: 8 },
  productTitle: { fontSize: 16, fontWeight: "bold", flexWrap: "wrap" },
  productPrice: { marginTop: 4, fontSize: 15, color: "#555" },
  formSection: { marginBottom: 30 },
  formSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: { fontSize: 15, marginBottom: 6, fontWeight: "600" },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
  },
  selectText: { color: "#999", fontSize: 15 },
  note: { color: "#999", fontSize: 13, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    fontSize: 15,
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    height: 120,
    borderRadius: 6,
    textAlignVertical: "top",
    fontSize: 15,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 8,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#333" },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#000",
    alignItems: "center",
  },
  submitText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: { justifyContent: "flex-end", margin: 0 },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 18,
    minHeight: "32%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },
  optionItem: {
    paddingVertical: 13,
    borderBottomColor: "#eee",
  },
  uploadBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadImage: {
    width: 100,
    height: 100,
    borderRadius: 6,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
