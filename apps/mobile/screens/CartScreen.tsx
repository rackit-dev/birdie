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
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";
import axios from "axios";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import CustomHeader from "../components/CustomHeader";
import { useUserIdStore } from "../store/useUserIdStore";
import { API_URL, IMAGE_URL } from "@env";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Cart">;

export default function CartScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [pendingOption, setPendingOption] = useState<string>("");
  const [pendingQty, setPendingQty] = useState<number>(1);
  const [pendingPrice, setPendingPrice] = useState<number>(0);
  const [optionTypes, setOptionTypes] = useState<any[]>([]);
  const [options, setOptions] = useState<Record<string, any[]>>({});
  const [selected, setSelected] = useState<
    Record<string, { value: string; id: string; typeId: string }>
  >({});
  const [selectedOptions, setSelectedOptions] = useState<
    {
      key: string;
      label: string;
      quantity: number;
      price: number;
      optionType1Id: string;
      option1Id: string;
      optionType2Id?: string;
      option2Id?: string;
    }[]
  >([]);
  const [isOptionOpen, setIsOptionOpen] = useState<Record<string, boolean>>({});

  const [qtyAlertVisible, setQtyAlertVisible] = useState(false);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<"single" | "multiple">("single");

  const userId = useUserIdStore((s) => s.id);

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
        const product = allProducts.find((p: any) => p.id === item.product_id);

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
          option: optionLabel,
          priceOriginal: product?.price_whole ?? 0,
          priceDiscounted: product?.price_sell ?? 0,
          isActive: product?.is_active ?? true,

          options: [
            item.option_type_1 && item.option_1
              ? {
                  type: item.option_type_1,
                  value: item.option_1,
                  active: item.is_option_1_active,
                }
              : null,
            item.option_type_2 && item.option_2
              ? {
                  type: item.option_type_2,
                  value: item.option_2,
                  active: item.is_option_2_active,
                }
              : null,
            item.option_type_3 && item.option_3
              ? {
                  type: item.option_type_3,
                  value: item.option_3,
                  active: item.is_option_3_active,
                }
              : null,
          ].filter(Boolean),
        };
      });

      setCartItems(mergedCartItems);

      setCartItems(mergedCartItems);
    } catch (error) {
      console.error("장바구니 또는 상품 정보 불러오기 실패:", error);
    }
  };

  const updateQuantity = (key: string, delta: number) => {
    setSelectedOptions((prev) =>
      prev.map((opt) =>
        opt.key === key
          ? { ...opt, quantity: Math.max(1, opt.quantity + delta) }
          : opt
      )
    );
  };

  const removeOption = (key: string) => {
    setSelectedOptions((prev) => prev.filter((opt) => opt.key !== key));
  };

  useEffect(() => {
    fetchCartItemsWithProducts();
  }, [userId]);

  const handleOrder = async () => {
    const selectedRaw = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    if (selectedRaw.length === 0) {
      Alert.alert("선택된 상품이 없습니다.");
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/products`, {
        params: { page: 1, items_per_page: 500 },
      });
      const allProducts = res.data.products;

      const hasSoldOut = selectedRaw.some((item) => {
        const product = allProducts.find((p: any) => p.id === item.product_id);
        return !product?.is_active;
      });

      if (hasSoldOut) {
        Alert.alert(
          "선택한 상품 중 품절된 상품이 있습니다. 장바구니를 확인해주세요."
        );
        await fetchCartItemsWithProducts();
        return;
      }

      const selectedProducts = selectedRaw.map((item) => ({
        id: item.product_id,
        brand: item.brand,
        name: item.name,
        option: item.option,
        quantity: item.quantity,
        price: item.priceDiscounted * item.quantity,
        image: `${IMAGE_URL}/products/${item.name}/thumbnail.jpg`,
      }));

      navigation.navigate("Purchase", {
        fromCart: true,
        products: selectedProducts,
      });
    } catch (err) {
      console.error("상품 상태 확인 실패:", err);
      Alert.alert("상품 상태 확인 중 오류가 발생했습니다.");
    }
  };

  const toggleSelectAll = () => {
    const activeItems = cartItems
      .filter((item) => item.isActive)
      .map((item) => item.id);

    if (selectedItems.length === activeItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(activeItems);
    }
  };

  const toggleSelectItem = (id: string) => {
    const target = cartItems.find((item) => item.id === id);
    if (!target?.isActive) return;

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

  const openOptionModal = async (id: string) => {
    const currentItem = cartItems.find((c) => c.id === id);
    if (!currentItem) return;

    setCurrentItemId(id);
    setPendingQty(currentItem.quantity);
    setPendingPrice(currentItem.priceDiscounted);

    try {
      const res = await axios.get(`${API_URL}/products/option_types`, {
        params: { product_id: currentItem.product_id },
      });
      const types = res.data.product_option_types;
      setOptionTypes(types);

      const optionValues: Record<string, any[]> = {};
      for (const t of types) {
        const optRes = await axios.get(`${API_URL}/products/options`, {
          params: {
            product_id: currentItem.product_id,
            product_option_type_id: t.id,
          },
        });
        optionValues[t.option_type] = optRes.data.product_options;
      }
      setOptions(optionValues);

      const initialSelected: Record<
        string,
        { value: string; id: string; typeId: string }
      > = {};

      currentItem.options.forEach((opt: any) => {
        const type = types.find((t: any) => t.option_type === opt.type);
        if (type) {
          const match = optionValues[opt.type]?.find(
            (o: any) => o.option === opt.value
          );
          if (match) {
            initialSelected[opt.type] = {
              id: match.id,
              typeId: type.id,
              value: match.option,
            };
          }
        }
      });

      setSelected(initialSelected);

      if (Object.keys(initialSelected).length > 0) {
        const key = Object.values(initialSelected)
          .map((o) => o.value)
          .join("-");
        const label = Object.values(initialSelected)
          .map((o) => o.value)
          .join(" / ");

        setSelectedOptions([
          {
            key,
            label,
            quantity: currentItem.quantity,
            price: currentItem.priceDiscounted,
            optionType1Id: initialSelected[types[0].option_type]?.typeId,
            option1Id: initialSelected[types[0].option_type]?.id,
            optionType2Id: types[1]
              ? initialSelected[types[1].option_type]?.typeId
              : undefined,
            option2Id: types[1]
              ? initialSelected[types[1].option_type]?.id
              : undefined,
          },
        ]);
      }
    } catch (err) {
      console.error("옵션 불러오기 실패", err);
    }

    setModalVisible(true);
  };

  const handleUpdateOption = async () => {
    if (!currentItemId || selectedOptions.length === 0) return;

    const opt = selectedOptions[0];
    const currentItem = cartItems.find((c) => c.id === currentItemId);
    if (!currentItem) return;

    try {
      // 1. 같은 product_id + 같은 옵션 조합 있는지 확인
      const normalizeOptions = (opts: { type: string; value: string }[]) =>
        opts
          .map((o) => `${o.type}:${o.value}`)
          .sort()
          .join("|");

      const duplicateItem = cartItems.find((c) => {
        if (c.product_id !== currentItem.product_id || c.id === currentItemId) {
          return false;
        }

        const currentKey = normalizeOptions(
          Object.entries(selected).map(([type, val]) => ({
            type,
            value: val.value,
          }))
        );

        const compareKey = normalizeOptions(c.options);

        return currentKey === compareKey;
      });

      if (duplicateItem) {
        const mergedQty = duplicateItem.quantity + opt.quantity;

        // 2. 이미 같은 옵션이 있으면 → merge (수량 합치기)
        await axios.put(`${API_URL}/cartitems`, {
          cartitem_id: duplicateItem.id,
          user_id: userId,
          product_id: currentItem.product_id,
          quantity: mergedQty,
          option_type_1_id: opt.optionType1Id,
          option_1_id: opt.option1Id,
          is_option_1_active: true,
          option_type_2_id: opt.optionType2Id,
          option_2_id: opt.option2Id,
          is_option_2_active: true,
          option_type_3_id: undefined,
          option_3_id: undefined,
          is_option_3_active: true,
        });

        // 현재 수정하던 cartitem은 삭제
        await axios.delete(`${API_URL}/cartitems?cartitem_id=${currentItemId}`);
      } else {
        // 3. 없으면 그냥 옵션 변경
        await axios.put(`${API_URL}/cartitems`, {
          cartitem_id: currentItemId,
          user_id: userId,
          product_id: currentItem.product_id,
          quantity: opt.quantity,
          option_type_1_id: opt.optionType1Id,
          option_1_id: opt.option1Id,
          is_option_1_active: true,
          option_type_2_id: opt.optionType2Id,
          option_2_id: opt.option2Id,
          is_option_2_active: true,
        });
      }

      await fetchCartItemsWithProducts();
      setModalVisible(false);
    } catch (err) {
      console.error("옵션 변경 실패:", err);
      Alert.alert("옵션 변경 실패", "다시 시도해주세요.");
    }
  };

  const handleSelectOption = (
    optionType: string,
    optionValue: string,
    optionId: string,
    typeId: string
  ) => {
    setSelected((prev) => {
      const updated = {
        ...prev,
        [optionType]: { id: optionId, typeId, value: optionValue },
      };

      // 옵션이 1개짜리 상품일 경우 → 바로 selectedOptions에 반영
      if (optionTypes.length === 1) {
        const key = `${updated[optionType].value}`;
        const label = updated[optionType].value;

        setSelectedOptions([
          {
            key,
            label,
            quantity: pendingQty, // 장바구니에 있던 수량 유지
            price: pendingPrice,
            optionType1Id: updated[optionType].typeId,
            option1Id: updated[optionType].id,
          },
        ]);

        return updated; // 상태 유지
      }

      // 옵션이 2개 이상일 경우 → 전부 선택됐을 때만 반영
      if (Object.keys(updated).length === optionTypes.length) {
        const key = optionTypes
          .map((t) => updated[t.option_type].value)
          .join("-");
        const label = optionTypes
          .map((t) => updated[t.option_type].value)
          .join(" / ");

        setSelectedOptions([
          {
            key,
            label,
            quantity: pendingQty,
            price: pendingPrice,
            optionType1Id: updated[optionTypes[0].option_type].typeId,
            option1Id: updated[optionTypes[0].option_type].id,
            optionType2Id: optionTypes[1]
              ? updated[optionTypes[1].option_type].typeId
              : undefined,
            option2Id: optionTypes[1]
              ? updated[optionTypes[1].option_type].id
              : undefined,
          },
        ]);
      }

      return updated;
    });
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
            <Text
              style={{
                color: "#666",
                fontSize: 14,
                fontFamily: "P-400",
                textDecorationLine: "underline",
              }}
            >
              선택 삭제
            </Text>
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
                                  fontFamily: "P-500",
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
                        {item.option} / {item.quantity}개
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
                      onPress={() => openOptionModal(item.id)}
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

      <TouchableOpacity style={styles.bottomBar} onPress={handleOrder}>
        <Text style={styles.bottomBarText}>
          {getTotalPrice().toLocaleString()}원 주문하기
        </Text>
      </TouchableOpacity>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        propagateSwipe
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />

          {optionTypes.map((t) => (
            <View key={t.id}>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() =>
                  setIsOptionOpen((prev) => ({
                    ...prev,
                    [t.option_type]: !prev[t.option_type],
                  }))
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {selected[t.option_type]?.value || "옵션 선택"}
                  </Text>
                  <Ionicons
                    name={
                      isOptionOpen[t.option_type]
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={18}
                    color="black"
                  />
                </View>
              </TouchableOpacity>

              {isOptionOpen[t.option_type] && (
                <View style={styles.optionScrollContainer}>
                  <FlatList
                    data={options[t.option_type] || []}
                    keyExtractor={(opt) => opt.id}
                    nestedScrollEnabled
                    style={{ maxHeight: 200 }}
                    renderItem={({ item: opt }) => {
                      const disabled = !opt.is_active;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.optionItem,
                            selected[t.option_type]?.value === opt.option &&
                              styles.optionItemSelected,
                            disabled && { backgroundColor: "#f0f0f0" },
                          ]}
                          disabled={disabled}
                          onPress={() => {
                            handleSelectOption(
                              t.option_type,
                              opt.option,
                              opt.id,
                              t.id
                            );
                            setIsOptionOpen((prev) => ({
                              ...prev,
                              [t.option_type]: false,
                            }));
                          }}
                        >
                          <View style={styles.optionRow}>
                            <Text style={{ color: disabled ? "#aaa" : "#000" }}>
                              {opt.option}
                            </Text>
                            {disabled && (
                              <Text style={{ color: "red", fontSize: 12 }}>
                                품절
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              )}
            </View>
          ))}

          <View style={{ marginTop: 20 }}>
            {selectedOptions.map((opt) => (
              <View key={opt.key} style={styles.selectedRow}>
                <Text style={{ fontSize: 16, fontFamily: "P-500", flex: 1 }}>
                  {opt.label}
                </Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(opt.key, -1)}
                    style={styles.qtyButton}
                  >
                    <Text>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 10 }}>{opt.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(opt.key, 1)}
                    style={styles.qtyButton}
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ width: 80, textAlign: "right" }}>
                  {(opt.price * opt.quantity).toLocaleString()}원
                </Text>
                <TouchableOpacity onPress={() => removeOption(opt.key)}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "P-500",
                      marginLeft: 10,
                    }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={{ ...styles.buyText, color: "#000" }}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyButton}
              onPress={handleUpdateOption}
            >
              <Text style={styles.buyText}>변경하기</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  brandLabel: { fontFamily: "P-500", fontSize: 16, marginLeft: 10 },
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
    fontFamily: "P-500",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  optionText: { fontSize: 12, fontFamily: "P-500", color: "grey" },
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
    fontFamily: "P-500",
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  priceFinal: {
    fontSize: 16,
    fontFamily: "P-600",
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
  summaryTitle: { fontFamily: "P-500", fontSize: 16, marginBottom: 12 },
  totalAmount: {
    textAlign: "right",
    fontSize: 17,
    fontFamily: "P-600",
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
    fontFamily: "P-500",
    marginBottom: 12,
  },
  qtyTotal: {
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "P-500",
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
    fontFamily: "P-500",
    marginBottom: 10,
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
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
  optionItemSelected: {
    backgroundColor: "#f1f1f1",
  },
  qtySection: {
    marginTop: 20,
    marginBottom: -45,
  },
  qtyTitle: {
    fontSize: 18,
    fontFamily: "P-500",
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  qtyButtonText: {
    fontSize: 20,
    fontFamily: "P-500",
  },
  qtyValue: {
    fontSize: 18,
    fontFamily: "P-500",
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
    fontFamily: "P-500",
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
    fontFamily: "P-500",
    color: "#fff",
  },
  dropdownBoxExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: "P-500",
  },
  optionScrollContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#eee",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: "hidden",
  },

  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  alertModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  alertText: {
    fontSize: 16,
    fontFamily: "P-500",
  },
  alertButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  alertButtonText: {
    color: "white",
    fontFamily: "P-500",
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
    fontFamily: "P-500",
  },
  option: {
    fontSize: 12,
    fontFamily: "P-500",
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
    fontFamily: "P-500",
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
    fontFamily: "P-500",
    color: "#fff",
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },

  cartButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  buyButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 5,
  },

  buyText: {
    fontSize: 16,
    fontFamily: "P-500",
    color: "#fff",
  },
});
