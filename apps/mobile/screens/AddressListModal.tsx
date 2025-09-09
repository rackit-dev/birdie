import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import CustomHeader from "../components/CustomHeader";

import AddressEditModal from "./AddressEditModal";

type Address = {
  id: string;
  user_id: string;
  recipient_name: string;
  phone_number: string;
  zipcode: string;
  address_line1: string;
  address_line2?: string;
  order_memo?: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (addr: Address) => void;
  onAdd: () => void;
};

export default function AddressListModal({
  visible,
  onClose,
  onSelect,
  onAdd,
}: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("session_token");
      if (!token) throw new Error("로그인 토큰이 없습니다.");

      const res = await fetch(`${API_URL}/users/user_address`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("배송지 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await SecureStore.getItemAsync("session_token");
      if (!token) throw new Error("로그인 토큰이 없습니다.");

      const res = await fetch(
        `${API_URL}/users/user_address?user_address_id=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`삭제 실패 (status ${res.status})`);
      }

      Alert.alert("삭제 완료", "배송지가 삭제되었습니다.");
      fetchAddresses();
    } catch (err) {
      console.error("배송지 삭제 실패:", err);
      Alert.alert("오류", "배송지 삭제 중 문제가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (visible) fetchAddresses();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CustomHeader title="배송지 목록" onPressClose={onClose} />

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 30 }}>
            불러오는 중...
          </Text>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>등록된 배송지가 없습니다.</Text>
            <Text style={styles.emptySub}>배송지를 추가해주세요.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
              <Text style={styles.addBtnText}>배송지 추가</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {addresses.map((addr) => (
              <View key={addr.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={{ fontFamily: "P-600", fontSize: 18 }}>
                    {addr.recipient_name}
                  </Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => {
                      onSelect(addr);
                    }}
                  >
                    <Text style={styles.selectBtnText}>선택</Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={{ fontFamily: "P-400", fontSize: 16, marginTop: 6 }}
                >
                  {addr.recipient_name} · {addr.phone_number}
                </Text>
                <Text style={styles.addrText}>
                  {addr.address_line1}, {addr.address_line2} [{addr.zipcode}]
                </Text>
                {addr.order_memo ? (
                  <Text style={styles.memo}>배송 메모: {addr.order_memo}</Text>
                ) : null}

                <View style={styles.footerRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditTarget(addr);
                      setShowEditModal(true);
                    }}
                  >
                    <Text style={styles.footerAction}>수정</Text>
                  </TouchableOpacity>
                  <Text style={{ color: "#ccc", marginHorizontal: 6 }}>|</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("확인", "배송지를 삭제하시겠습니까?", [
                        { text: "취소", style: "cancel" },
                        {
                          text: "삭제",
                          style: "destructive",
                          onPress: () => handleDelete(addr.id),
                        },
                      ])
                    }
                  >
                    <Text style={styles.footerAction}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addBtnBottom}
              onPress={() => console.log("배송지 추가")}
            >
              <Text style={styles.addBtnText}>배송지 추가</Text>
            </TouchableOpacity>

            <AddressEditModal
              visible={showEditModal}
              address={editTarget}
              onClose={() => setShowEditModal(false)}
              onSaved={fetchAddresses}
            />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 5,
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  addBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addBtnBottom: {
    margin: 20,
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnText: {
    fontFamily: "P-Medium",
    color: "#fff",
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectBtn: {
    borderWidth: 1,
    borderColor: "#bdbdbdff",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  selectBtnText: { fontFamily: "P-600", fontSize: 14 },
  addrText: {
    fontFamily: "P-400",
    fontSize: 15,
    marginTop: 6,
    color: "#777",
  },
  memo: {
    fontFamily: "P-400",
    fontSize: 15,
    marginTop: 6,
    color: "#777",
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  footerAction: {
    fontFamily: "P-400",
    fontSize: 14,
  },
});
