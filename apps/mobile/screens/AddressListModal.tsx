import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import CustomHeader from "../components/CustomHeader";

import AddressEditModal from "./AddressEditModal";
import { API_URL } from "@env";

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

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState<
    { text: string; onPress: () => void; style?: "cancel" | "destructive" }[]
  >([{ text: "확인", onPress: () => setAlertVisible(false) }]);

  const showAlert = (
    title: string,
    message: string,
    buttons?: {
      text: string;
      onPress: () => void;
      style?: "cancel" | "destructive";
    }[]
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    if (buttons) setAlertButtons(buttons);
    else
      setAlertButtons([
        { text: "확인", onPress: () => setAlertVisible(false) },
      ]);
    setAlertVisible(true);
  };

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

      showAlert("삭제 완료", "배송지가 삭제되었습니다.");
      fetchAddresses();
    } catch (err) {
      console.error("배송지 삭제 실패:", err);
      showAlert("오류", "배송지 삭제 중 문제가 발생했습니다.");
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
                      showAlert("확인", "배송지를 삭제하시겠습니까?", [
                        {
                          text: "취소",
                          style: "cancel",
                          onPress: () => setAlertVisible(false),
                        },
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
            <TouchableOpacity style={styles.addBtnBottom} onPress={onAdd}>
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

        <Modal visible={alertVisible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              {alertTitle ? (
                <Text style={styles.alertTitle}>{alertTitle}</Text>
              ) : null}
              <Text style={styles.alertMessage}>{alertMessage}</Text>
              <View style={styles.alertButtonRow}>
                {alertButtons.map((btn, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.alertButton,
                      btn.style === "destructive" && {
                        backgroundColor: "#ea0000ff",
                      },
                      btn.style === "cancel" && { backgroundColor: "#000" },
                    ]}
                    onPress={() => {
                      setAlertVisible(false);
                      btn.onPress();
                    }}
                  >
                    <Text style={styles.alertButtonText}>{btn.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
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
    fontFamily: "P-500",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 16,
    fontFamily: "P-400",
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
    fontFamily: "P-500",
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
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "75%",
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontFamily: "P-500",
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    fontFamily: "P-500",
    marginBottom: 20,
    textAlign: "center",
  },
  alertButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  alertButton: {
    flex: 1,
    backgroundColor: "black",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  alertButtonText: {
    color: "white",
    fontFamily: "P-500",
    fontSize: 16,
  },
});
