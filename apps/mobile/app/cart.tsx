import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import Modal from "react-native-modal";

const OPTIONS = ["230mm", "240mm", "250mm", "260mm", "270mm", "280mm"];

export default function CartScreen() {
  const navigation = useNavigation();
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

  const { product } = useLocalSearchParams();

  useEffect(() => {
    if (product) {
      try {
        const parsed = JSON.parse(product as string);
        const newItem = {
          id: parsed.id,
          brand: parsed.category_sub || "기본브랜드",
          name: parsed.name,
          image: null,
          option: parsed.option,
          options: [parsed.option],
          quantity: parsed.quantity,
          priceOriginal: parsed.price_whole,
          priceDiscounted: parsed.price_sell,
        };

        setCartItems((prev) => {
          const exists = prev.find(
            (item) => item.id === newItem.id && item.option === newItem.option
          );
          if (exists) {
            return prev.map((item) =>
              item.id === newItem.id && item.option === newItem.option
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          } else {
            return [...prev, newItem];
          }
        });
      } catch (e) {
        console.error("장바구니 데이터 파싱 오류:", e);
      }
    }
  }, [product]);

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

  const handleRemoveItem = (id: string) => {
    Alert.alert("삭제하시겠습니까?", "", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setCartItems((prev) => prev.filter((item) => item.id !== id));
          setSelectedItems((prev) => prev.filter((item) => item !== id));
        },
      },
    ]);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장바구니</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView style={styles.scrollArea}>
        <View style={styles.selectAllBox}>
          <TouchableOpacity onPress={toggleSelectAll}>
            <Ionicons
              name={
                selectedItems.length === cartItems.length
                  ? "checkbox"
                  : "square-outline"
              }
              size={22}
              color="black"
            />
          </TouchableOpacity>
          <Text style={{ marginLeft: 6 }}>
            전체선택 ({selectedItems.length}/{cartItems.length})
          </Text>
        </View>

        {Object.keys(groupedItems).map((brand) => (
          <View key={brand} style={styles.itemGroup}>
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
                />
              </TouchableOpacity>
              <Text style={styles.brandLabel}>{brand}</Text>
            </View>

            {groupedItems[brand].map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <TouchableOpacity onPress={() => toggleSelectItem(item.id)}>
                  <Ionicons
                    name={
                      selectedItems.includes(item.id)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={20}
                  />
                </TouchableOpacity>
                <View style={styles.grayBox} />
                <View style={styles.itemDetails}>
                  <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.name.replace(/_/g, " ")}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                      <Ionicons name="close" size={20} color="#888" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.optionText}>
                    {item.option} / {item.quantity}개
                  </Text>
                  <View style={styles.priceRow}>
                    {item.priceOriginal > item.priceDiscounted && (
                      <Text style={styles.priceOld}>
                        {(item.priceOriginal * item.quantity).toLocaleString()}
                        원
                      </Text>
                    )}
                    <Text style={styles.priceFinal}>
                      {(item.priceDiscounted * item.quantity).toLocaleString()}
                      원
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {groupedItems[brand].map((item) => (
              <View key={`btn-${item.id}`} style={styles.optionsButtonRow}>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => openOptionModal(item.id, item.options)}
                >
                  <Text>옵션 변경</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>예상 결제금액</Text>
          <Text style={styles.totalAmount}>
            {getTotalPrice().toLocaleString()}원 주문하기
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarText}>
          {getTotalPrice().toLocaleString()}원 주문하기
        </Text>
      </View>

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
              <Text style={styles.cancelButtonText}>취소하기</Text>
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 35,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollArea: { flex: 1 },
  selectAllBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  itemGroup: {
    borderTopColor: "#f4f4f4",
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    marginTop: 40,
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
    height: 60,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
    borderRadius: 8,
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
    borderRadius: 8,
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
});
