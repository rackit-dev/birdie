import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import CustomHeader from "../components/CustomHeader";

// 배송지 타입 정의
type Address = {
  id: number;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  zipcode: string;
  isDefault?: boolean;
};

export default function AddressListScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const userId = "test_user1"; // ✅ 실제 로그인 유저 ID로 교체

  // 배송지 불러오기
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/addresses?user_id=${userId}`);
      const data = await res.json();
      setAddresses(data || []);
    } catch (err) {
      console.error("배송지 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 화면에 돌아올 때마다 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="배송지 목록"
        onPressClose={() => navigation.goBack()}
      />

      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 30 }}>
          불러오는 중...
        </Text>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>등록된 배송지가 없습니다.</Text>
          <Text style={styles.emptySub}>배송지를 추가해주세요.</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              navigation.navigate("AddressAdd" as never, { products } as never)
            }
          >
            <Text style={styles.addBtnText}>배송지 추가</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {addresses.map((addr) => (
            <View key={addr.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text
                  style={{ fontFamily: "P-600", fontSize: 18, marginTop: -4 }}
                >
                  {addr.name}
                  {addr.isDefault && (
                    <Text style={{ color: "purple" }}>(기본배송지)</Text>
                  )}
                </Text>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => {
                    navigation.navigate({
                      name: "Purchase",
                      params: { selectedAddress: addr, products },
                      merge: true,
                    } as never);
                  }}
                >
                  <Text style={styles.selectBtnText}>선택</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontFamily: "P-400", fontSize: 16, marginTop: 6 }}>
                {addr.name} · {addr.phone}
              </Text>
              <Text
                style={{
                  fontFamily: "P-400",
                  fontSize: 16,
                  marginTop: 6,
                  color: "#777",
                }}
              >
                {addr.line1}, {addr.line2} [{addr.zipcode}]
              </Text>

              <View style={styles.footerRow}>
                <TouchableOpacity onPress={() => console.log("수정", addr.id)}>
                  <Text style={styles.footerAction}>수정</Text>
                </TouchableOpacity>
                <Text style={{ color: "#ccc", marginHorizontal: 6 }}>|</Text>
                <TouchableOpacity onPress={() => console.log("삭제", addr.id)}>
                  <Text style={styles.footerAction}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addBtnBottom}
            onPress={() =>
              navigation.navigate("AddressAdd" as never, { products } as never)
            }
          >
            <Text style={styles.addBtnText}>배송지 추가</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 5 },
  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  emptySub: { fontSize: 16, color: "#888", marginBottom: 20 },
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
  addBtnText: { fontFamily: "P-Medium", color: "#fff", fontSize: 16 },
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
  footerRow: { flexDirection: "row", marginTop: 16 },
  footerAction: { fontFamily: "P-400", fontSize: 14 },
});
