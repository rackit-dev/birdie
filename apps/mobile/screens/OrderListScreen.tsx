import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import axios from "axios";
import Modal from "react-native-modal";
import CustomHeader from "../components/CustomHeader";
import { useUserIdStore } from "@/store/useUserIdStore";
import { API_URL, IMAGE_URL } from "@env";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentResult">;

export default function OrderListScreen() {
  const navigation = useNavigation<Props["navigation"]>();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const userId = useUserIdStore((s) => s.id);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`${API_URL}/orders`, {
          params: { page: 1, items_per_page: 50 },
        });

        const myOrders = (res.data.orders || []).filter(
          (o: any) => o.user_id === userId
        );

        const detailed = await Promise.all(
          myOrders.map(async (o: any) => {
            try {
              const detail = await axios.get(`${API_URL}/orders/by_id`, {
                params: { order_id: String(o.id) },
              });
              return { ...o, items: detail.data.items || [] };
            } catch (err: any) {
              if (axios.isAxiosError(err) && err.response?.status === 404) {
                console.warn("주문 제외됨 (404):", o.id);
                return null;
              }
              console.error("주문 상세 불러오기 실패:", o.id, err);
              return null;
            }
          })
        );

        setOrders(
          detailed
            .filter(Boolean)
            .sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
        );
      } catch (err) {
        console.error("주문 내역 불러오기 실패:", err);
      }
    };

    fetchOrders();
  }, [userId]);

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const renderOptions = (item: any) => {
    if (item.option) return item.option;
    const options = [
      item.option_1_value,
      item.option_2_value,
      item.option_3_value,
    ].filter(Boolean);
    if (options.length === 0) return "옵션 없음";
    return options.join(" / ");
  };

  const renderImage = (item: any) => {
    if (!item?.product_name) {
      return `${IMAGE_URL}/products/defaults/no_image.png`;
    }
    return `${IMAGE_URL}/products/${item.product_name}/thumbnail.jpg`;
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="주문 내역"
        showBackButton
        onPressBack={() => navigation.goBack()}
        onPressHome={() => navigation.navigate("Main")}
      />

      <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
        {orders.map((o) => {
          const firstItem = o.items?.[0];
          const orderDate = new Date(o.created_at).toLocaleDateString("ko-KR", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            weekday: "short",
          });

          return (
            <View key={o.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>{orderDate}</Text>
                <TouchableOpacity onPress={() => openOrderDetail(o)}>
                  <Text style={styles.detailBtn}>주문 상세</Text>
                </TouchableOpacity>
              </View>

              {firstItem && (
                <View style={styles.itemRow}>
                  <Image
                    source={{ uri: renderImage(firstItem) }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {firstItem.product_name
                        ? firstItem.product_name.replace(/_/g, " ")
                        : "상품명 없음"}
                    </Text>
                    <Text style={styles.itemOption}>
                      {renderOptions(firstItem)} / {firstItem.quantity}개
                    </Text>
                    <Text style={styles.itemPrice}>
                      {firstItem.final_price?.toLocaleString() || 0}원
                    </Text>
                  </View>
                </View>
              )}

              <View>
                <TouchableOpacity
                  style={styles.actionBtnFull}
                  onPress={() => Alert.alert("준비중입니다.")}
                >
                  <Text style={styles.actionTextBlue}>후기 작성</Text>
                </TouchableOpacity>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Alert.alert("준비중입니다.")}
                  >
                    <Text style={styles.actionText}>배송 조회</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Alert.alert("준비중입니다.")}
                  >
                    <Text style={styles.actionText}>재구매</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
        >
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {selectedOrder ? (
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.orderDateDetail}>
                  {new Date(selectedOrder.created_at).toLocaleDateString(
                    "ko-KR",
                    {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                      weekday: "short",
                    }
                  )}
                </Text>
                <Text style={styles.orderNumber}>
                  주문번호 {selectedOrder.id}
                </Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {selectedOrder.recipient_name}
                  </Text>
                  <Text>
                    {selectedOrder.address_line1} {selectedOrder.address_line2}
                  </Text>
                  <Text>{selectedOrder.phone_number}</Text>
                  {selectedOrder.order_memo && (
                    <Text>{selectedOrder.order_memo}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionSubtitle}>
                    주문 상품 {selectedOrder.items.length}개
                  </Text>
                  {selectedOrder.items.map((item: any) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Image
                        source={{ uri: renderImage(item) }}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>
                          {item.product_name.replace(/_/g, " ")}
                        </Text>
                        <Text style={styles.itemOption}>
                          {renderOptions(item)} / {item.quantity}개
                        </Text>
                        <Text style={styles.itemPrice}>
                          {item.final_price?.toLocaleString()}원
                        </Text>
                      </View>
                    </View>
                  ))}

                  <View style={styles.actionCol}>
                    <TouchableOpacity style={styles.actionBtnFull}>
                      <Text style={styles.actionTextBlue}>후기 작성</Text>
                    </TouchableOpacity>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>배송 조회</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>재구매</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionSubtitle}>결제 정보</Text>
                  <View style={styles.payRow}>
                    <Text>상품 금액</Text>
                    <Text>
                      {selectedOrder.subtotal_price?.toLocaleString()}원
                    </Text>
                  </View>
                  <View style={styles.payRow}>
                    <Text>할인 금액</Text>
                    <Text style={{ color: "#007aff" }}>
                      -{selectedOrder.coupon_discount_price?.toLocaleString()}원
                    </Text>
                  </View>
                  <View style={styles.payRow}>
                    <Text>적립금 사용</Text>
                    <Text style={{ color: "#007aff" }}>
                      -{selectedOrder.point_discount_price?.toLocaleString()}원
                    </Text>
                  </View>
                  <View style={styles.payRow}>
                    <Text>배송비</Text>
                    <Text>무료배송</Text>
                  </View>
                  <View style={styles.payRow}>
                    <Text style={{ fontFamily: "P-600" }}>결제 금액</Text>
                    <Text style={{ fontFamily: "P-700" }}>
                      {selectedOrder.total_price?.toLocaleString()}원
                    </Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionSubtitle}>
                    이번 주문으로 받은 혜택
                  </Text>
                  <View style={styles.payRow}>
                    <Text>총 할인 금액</Text>
                    <Text>
                      {(
                        (selectedOrder.coupon_discount_price ?? 0) +
                        (selectedOrder.point_discount_price ?? 0)
                      ).toLocaleString()}
                      원
                    </Text>
                  </View>
                  <View style={styles.payRow}>
                    <Text>배송비</Text>
                    <Text>무료배송</Text>
                  </View>
                  <View style={styles.payRow}>
                    <Text>후기 적립</Text>
                    <Text>최대 1,500원</Text>
                  </View>
                  <View style={styles.payRow}>
                    <Text style={{ fontFamily: "P-600" }}>받은 총 혜택</Text>
                    <Text style={{ color: "#007aff", fontFamily: "P-500" }}>
                      {(
                        (selectedOrder.coupon_discount_price ?? 0) +
                        (selectedOrder.point_discount_price ?? 0) +
                        1500
                      ).toLocaleString()}
                      원
                    </Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <Text>불러오는 중...</Text>
            )}
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  orderCard: {
    borderBottomWidth: 8,
    borderBottomColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderDate: { fontSize: 18, fontFamily: "P-500" },
  detailBtn: {
    color: "#555",
    fontSize: 14,
    fontFamily: "P-500",
    textDecorationLine: "underline",
  },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  itemImage: { width: 70, height: 70, borderRadius: 3, marginRight: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontFamily: "P-500", marginBottom: 2 },
  itemOption: {
    fontSize: 12,
    fontFamily: "P-500",
    color: "#777",
    marginBottom: 2,
  },
  itemPrice: { fontSize: 14, fontFamily: "P-500" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    fontFamily: "P-500",
    color: "#333",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    maxHeight: "80%", // 모달 세로 길이 제한 (화면의 80%)
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "P-500",
    marginBottom: 12,
  },
  itemBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  orderDateDetail: { fontSize: 20, fontFamily: "P-500" },
  orderNumber: { color: "#666", marginBottom: 12 },
  section: { borderTopWidth: 1, borderTopColor: "#eee", paddingVertical: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "P-600", marginBottom: 4 },
  sectionSubtitle: { fontSize: 17, fontFamily: "P-500", marginBottom: 8 },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  actionCol: { marginTop: 12 },
  actionBtnFull: {
    marginHorizontal: 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    alignItems: "center",
  },
  actionTextBlue: { color: "#007aff", fontSize: 14, fontFamily: "P-500" },
  deleteBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
  },
  deleteText: { fontSize: 15, fontFamily: "P-500" },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
  closeText: {
    fontSize: 22,
    color: "#333",
    fontFamily: "P-800",
  },
});
