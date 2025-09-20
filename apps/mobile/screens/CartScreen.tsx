import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";
import axios from "axios";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import CustomHeader from "../components/CustomHeader";
import { useUserIdStore } from "../store/useUserIdStore";

const OPTIONS = ["230mm", "240mm", "250mm", "260mm", "270mm", "280mm"];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Cart">;

export default function CartScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [pendingOption, setPendingOption] = useState<string>("");
  const [pendingQty, setPendingQty] = useState<number>(1);
  const [pendingPrice, setPendingPrice] = useState<number>(0);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(OPTIONS[0]);
  const [qtyAlertVisible, setQtyAlertVisible] = useState(false);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<"single" | "multiple">("single");

  const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;
  const IMAGE_URL = `${process.env.EXPO_PUBLIC_API_IMAGE_URL}`;

  const userId = useUserIdStore((s) => s.id);

  useEffect(() => {
    const fetchCartItemsWithProducts = async () => {
      if (!userId) return;

      try {
        const cartRes = await axios.get(`${API_URL}/cartitems`, {
          params: { user_id: userId },
        });
        const cartItemsRaw = cartRes.data.cartitems;

        const productRes = await axios.get(
          `${API_URL}/products?page=1&items_per_page=309`
        );
        const allProducts = productRes.data.products;

        const mergedCartItems = cartItemsRaw.map((item: any) => {
          const product = allProducts.find(
            (p: any) => p.id === item.product_id
          );

          let optionLabel = "옵션 정보 없음";
          const options: string[] = [];

          if (item.option_type_1 && item.option_1) {
            options.push(`${item.option_type_1}: ${item.option_1}`);
          }
          if (item.option_type_2 && item.option_2) {
            options.push(`${item.option_type_2}: ${item.option_2}`);
          }
          if (item.option_type_3 && item.option_3) {
            options.push(`${item.option_type_3}: ${item.option_3}`);
          }

          if (options.length > 0) {
            optionLabel = options.join(" / ");
          }

          return {
            id: item.id,
            user_id: item.user_id,
            product_id: item.product_id,
            quantity: item.quantity,
            created_at: item.created_at,
            updated_at: item.updated_at,

            name: product?.name || "알 수 없음",
            brand: product?.category_sub || "기본브랜드",
            image: product
              ? { uri: `${IMAGE_URL}/products/${product.name}/thumbnail.jpg` }
              : null,
            option: { label: optionLabel },
            priceOriginal: product?.price_whole ?? 0,
            priceDiscounted: product?.price_sell ?? 0,
            isActive: product?.is_active ?? true,
          };
        });

        setCartItems(mergedCartItems);
      } catch (error) {
        console.error("장바구니 또는 상품 정보 불러오기 실패:", error);
      }
    };

    fetchCartItemsWithProducts();
  }, [userId]);

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectBrand = (brand: string) => {
    const brandItemIds = cartItems
      .filter((item) => item.brand === brand)
      .map((item) => item.id);
    const allSelected = brandItemIds.every((id) => selectedItems.includes(id));
    if (allSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !brandItemIds.includes(id))
      );
    } else {
      setSelectedItems((prev) =>
        Array.from(new Set([...prev, ...brandItemIds]))
      );
    }
  };

  const confirmDeleteItem = (id: string) => {
    setDeleteTargetId(id);
    setDeleteMode("single");
    setDeleteAlertVisible(true);
  };

  const confirmDeleteSelected = () => {
    setDeleteMode("multiple");
    setDeleteAlertVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteMode === "single" && deleteTargetId) {
        await axios.delete(
          `${API_URL}/cartitems?cartitem_id=${deleteTargetId}`
        );

        setCartItems((prev) =>
          prev.filter((item) => item.id !== deleteTargetId)
        );
        setSelectedItems((prev) =>
          prev.filter((itemId) => itemId !== deleteTargetId)
        );
      } else if (deleteMode === "multiple") {
        await Promise.all(
          selectedItems.map((id) =>
            axios.delete(`${API_URL}/cartitems?cartitem_id=${id}`)
          )
        );
        setCartItems((prev) =>
          prev.filter((item) => !selectedItems.includes(item.id))
        );
        setSelectedItems([]);
      }
    } catch (error) {
      console.log("삭제 요청 ID:", deleteTargetId);

      console.error("삭제 실패:", error);
      Alert.alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteAlertVisible(false);
      setDeleteTargetId(null);
    }
  };

  const openOptionModal = (id: string, options: string[]) => {
    const currentItem = cartItems.find((item) => item.id === id);
    if (!currentItem) return;
    setCurrentItemId(id);
    setCurrentOptions(options);
    setPendingOption(currentItem.option);
    setPendingQty(currentItem.quantity);
    setModalVisible(true);
    setPendingPrice(currentItem.priceDiscounted);
  };

  const getTotalPrice = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.priceDiscounted * item.quantity, 0);
  };

  const groupedItems = cartItems.reduce(
    (acc: { [key: string]: any[] }, item) => {
      if (!acc[item.brand]) acc[item.brand] = [];
      acc[item.brand].push(item);
      return acc;
    },
    {}
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="장바구니"
        showBackButton
        onPressBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollArea}>
        <View style={styles.selectAllBox}>
          <TouchableOpacity onPress={toggleSelectAll}>
            <Ionicons
              name={
                selectedItems.length === cartItems.length
                  ? "checkbox"
                  : "square-outline"
              }
              size={20}
              color={
                selectedItems.length === cartItems.length ? "#000" : "#ccc"
              }
            />
          </TouchableOpacity>
          <Text style={{ marginLeft: 6 }}>
            전체선택 ({selectedItems.length}/{cartItems.length})
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={confirmDeleteSelected}>
            <Text style={{ color: "#666", fontSize: 14 }}>선택 삭제</Text>
          </TouchableOpacity>
        </View>

        {Object.keys(groupedItems).map((brand, index, arr) => (
          <View key={brand}>
            <View style={styles.itemGroup}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <TouchableOpacity onPress={() => toggleSelectBrand(brand)}>
                  <Ionicons
                    name={
                      groupedItems[brand].every((item) =>
                        selectedItems.includes(item.id)
                      )
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={20}
                    color={
                      groupedItems[brand].every((item) =>
                        selectedItems.includes(item.id)
                      )
                        ? "#000"
                        : "#ccc"
                    }
                  />
                </TouchableOpacity>

                <Text style={styles.brandLabel}>{brand}</Text>
              </View>

              {groupedItems[brand].map((item, index, arr) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <View style={styles.itemRow}>
                    <TouchableOpacity onPress={() => toggleSelectItem(item.id)}>
                      <Ionicons
                        name={
                          selectedItems.includes(item.id)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={20}
                        color={
                          selectedItems.includes(item.id) ? "#000" : "#ccc"
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() =>
                        navigation.navigate("ProductDetail", {
                          id: item.product_id,
                        })
                      }
                    >
                      <View style={{ position: "relative" }}>
                        {item.image ? (
                          <Image
                            source={item.image}
                            style={styles.grayBox}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.grayBox} />
                        )}

                        {!item.isActive && (
                          <>
                            {/* 품절 배지 */}
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
                                  fontWeight: "600",
                                }}
                              >
                                품절
                              </Text>
                            </View>
                            <View
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(255,255,255,0.5)",
                                borderRadius: 4,
                              }}
                            />
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    <View style={styles.itemDetails}>
                      <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                          <TouchableOpacity
                            activeOpacity={1}
                            onPress={() =>
                              navigation.navigate("ProductDetail", {
                                id: item.product_id,
                              })
                            }
                          >
                            <Text style={styles.itemTitle} numberOfLines={2}>
                              {item.name.replace(/_/g, " ")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => confirmDeleteItem(item.id)}
                        >
                          <Ionicons name="close" size={20} color="#999" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.optionText}>
                        {item.option.label} / {item.quantity}개
                      </Text>
                      <View style={styles.priceRow}>
                        {item.priceOriginal > item.priceDiscounted && (
                          <Text style={styles.priceOld}>
                            {(
                              item.priceOriginal * item.quantity
                            ).toLocaleString()}
                            원
                          </Text>
                        )}
                        <Text style={styles.priceFinal}>
                          {(
                            item.priceDiscounted * item.quantity
                          ).toLocaleString()}
                          원
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.optionsButtonRow}>
                    <TouchableOpacity
                      style={styles.changeButton}
                      onPress={() => openOptionModal(item.id, item.options)}
                    >
                      <Text>옵션 변경</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {index !== arr.length - 1 && <View style={styles.brandDivider} />}
          </View>
        ))}

        <Modal
          isVisible={deleteAlertVisible}
          onBackdropPress={() => setDeleteAlertVisible(false)}
        >
          <View style={styles.alertModalContent}>
            <Text style={styles.alertText}>상품을 삭제하시겠습니까?</Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setDeleteAlertVisible(false)}
                style={styles.alertCancelButton}
              >
                <Text style={styles.alertCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={styles.alertConfirmButton}
              >
                <Text style={styles.alertConfirmText}>삭제하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>예상 결제금액</Text>
          <Text style={styles.totalAmount}>
            {getTotalPrice().toLocaleString()}원
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.bottomBar}
        onPress={() => {
          const selectedProducts = cartItems
            .filter((item) => selectedItems.includes(item.id))
            .map((item) => ({
              id: item.product_id,
              brand: item.brand,
              name: item.name,
              option: item.option,
              quantity: item.quantity,
              price: item.priceDiscounted * item.quantity,
              image: `${IMAGE_URL}/products/${item.name}/thumbnail.jpg`,
            }));

          if (selectedProducts.length === 0) {
            Alert.alert("선택된 상품이 없습니다.");
            return;
          }

          navigation.navigate("Purchase", {
            fromCart: true,
            products: selectedProducts,
          });
        }}
      >
        <Text style={styles.bottomBarText}>
          {getTotalPrice().toLocaleString()}원 주문하기
        </Text>
      </TouchableOpacity>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        swipeDirection="down"
        onSwipeComplete={() => setModalVisible(false)}
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />
          <Text style={styles.optionTitle}>옵션 선택</Text>

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
                <Text style={styles.dropdownText}>{selectedOption}</Text>
                <Text>
                  {isOptionOpen ? (
                    <Ionicons name="chevron-up" size={18} color="black" />
                  ) : (
                    <Ionicons name="chevron-down" size={18} color="black" />
                  )}
                </Text>
              </View>
            </TouchableOpacity>

            {isOptionOpen && (
              <View style={styles.optionScrollContainer}>
                <ScrollView>
                  {OPTIONS.map((opt, index) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.optionItem,
                        opt === selectedOption && styles.optionItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedOption(opt);
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>{opt}</Text>
                        {index === 0 && (
                          <Text style={{ color: "red", fontSize: 12 }}>
                            마지막 1개
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.qtySection}>
            <Text style={styles.qtyTitle}>수량 선택</Text>
            <View style={styles.qtyRow}>
              <View style={styles.qtyButtonRow}>
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
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{pendingQty}</Text>
                <TouchableOpacity
                  onPress={() => setPendingQty((prev) => prev + 1)}
                  style={styles.qtyButton}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.qtyTotal}>
                {(pendingQty * pendingPrice).toLocaleString()}원
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                if (!currentItemId) return;
                setCartItems((prev) =>
                  prev.map((item) =>
                    item.id === currentItemId
                      ? {
                          ...item,
                          option: pendingOption,
                          quantity: pendingQty,
                        }
                      : item
                  )
                );
                setModalVisible(false);
              }}
            >
              <Text style={styles.confirmButtonText}>변경하기</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          isVisible={qtyAlertVisible}
          onBackdropPress={() => setQtyAlertVisible(false)}
        >
          <View style={styles.alertModalContent}>
            <Text style={{ ...styles.alertText, marginBottom: 20 }}>
              더 이상 수량을 줄일 수 없습니다.
            </Text>
            <TouchableOpacity
              onPress={() => setQtyAlertVisible(false)}
              style={{ ...styles.alertButton }}
            >
              <Text style={styles.alertButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollArea: { flex: 1 },
  selectAllBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  itemGroup: {
    borderTopColor: "#f4f4f4",
    paddingHorizontal: 12,
  },
  brandLabel: {
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  grayBox: {
    width: 80,
    height: 90,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginHorizontal: 10,
  },
  itemDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  itemTitle: {
    fontSize: 14,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  optionText: { fontSize: 12, color: "grey" },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginTop: 30,
    gap: 6,
    marginRight: 2,
  },
  priceOld: {
    fontSize: 12,
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  priceFinal: {
    fontSize: 16,
    fontWeight: "700",
  },
  changeButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 120,
    paddingVertical: 8,
    borderRadius: 5,
    justifyContent: "center",
  },
  optionsButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: "#f9f9f9",
    margin: 12,
    borderRadius: 8,
    padding: 14,
  },
  summaryTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
  },
  totalAmount: {
    textAlign: "right",
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    marginTop: 12,
  },
  bottomBar: {
    height: 70,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  qtyTotal: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "700",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: Dimensions.get("window").height * 0.85,
    paddingBottom: 50,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionListWrapper: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  optionItem: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionItemSelected: {
    backgroundColor: "#f1f1f1",
  },
  qtySection: {
    marginTop: 20,
    marginBottom: -45,
  },
  qtyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 50,
  },
  qtyButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
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
  qtyButtonText: {
    fontSize: 20,
  },
  qtyValue: {
    fontSize: 18,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  confirmButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownBoxExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  lastOneText: {
    fontSize: 12,
    color: "red",
  },
  alertModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  alertText: {
    fontSize: 16,
  },
  alertButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  alertButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  brandDivider: {
    height: 1,
    marginLeft: 15,
    marginRight: 15,
    marginTop: -2,
    backgroundColor: "#f1f1f1",
    marginVertical: 12,
  },
  detailsBox: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  option: {
    fontSize: 12,
    color: "#666",
    marginVertical: 4,
  },
  alertCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  alertCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  alertConfirmButton: {
    flex: 1,
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  alertConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
