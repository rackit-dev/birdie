import { useState, useCallback } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import axios from "axios";
import CustomHeader from "../components/CustomHeader";
import { useUserIdStore } from "../store/useUserIdStore";

export default function MyScreen() {
  type Navigation = NativeStackNavigationProp<RootStackParamList, "Main">;
  const navigation = useNavigation<Navigation>();
  const [cartCount, setCartCount] = useState(0);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const userId = useUserIdStore((s) => s.id);
  const name = useUserIdStore((s) => s.name);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      const fetchCartCount = async () => {
        try {
          const res = await axios.get(`${API_URL}/cartitems`, {
            params: { user_id: userId },
          });
          setCartCount(res.data.total_count);
        } catch (err) {
          console.error("장바구니 개수 불러오기 실패:", err);
        }
      };

      fetchCartCount();
    }, [userId])
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="마이페이지"
        onPressCart={() => navigation.navigate("Cart")}
        cartCount={cartCount}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <View>
            <Text style={styles.userId}>{name ? name : "로그인 필요"}</Text>
            <Text style={styles.linkText}>자세히 보기 &gt;</Text>
          </View>
        </View>

        <View style={styles.iconRow}>
          {[
            { label: "포인트", value: "728P" },
            { label: "쿠폰", value: "0" },
          ].map((item, idx) => (
            <View style={styles.iconItem} key={idx}>
              <Text style={styles.iconValue}>{item.value}</Text>
              <Text style={styles.iconLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>주문/배송 조회</Text>
            <Text style={styles.linkText}>전체 보기 &gt;</Text>
          </View>
          <View style={styles.orderStatusRow}>
            {["주문접수", "결제완료", "배송준비중", "배송중", "배송완료"].map(
              (status, idx) => (
                <View style={styles.orderStatus} key={idx}>
                  <Text style={styles.orderCount}>0</Text>
                  <Text style={styles.orderLabel}>{status}</Text>
                </View>
              )
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>쇼핑 활동</Text>
          {["취소/반품/교환 내역", "배송지 관리", "환불계좌 관리"].map(
            (label, idx) => (
              <TouchableOpacity key={idx} style={styles.menuRow}>
                <Text style={styles.menuText}>{label}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의</Text>
          {["고객센터/공지사항", "상품 문의"].map((label, idx) => (
            <TouchableOpacity key={idx} style={styles.menuRow}>
              <Text style={styles.menuText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            width: "100%",
            backgroundColor: "#f9f9f9",
            paddingVertical: 32,
            paddingHorizontal: 17,
            marginTop: 10,
          }}
        >
          <Text style={{ marginTop: 10, fontFamily: "P-Bold", fontSize: 16 }}>
            고객센터 1588-1588
          </Text>
          <Text
            style={{
              marginTop: 15,
              fontFamily: "P-Medium",
              fontSize: 14,
              color: "#B0B0B0",
            }}
          >
            운영시간 평일 10:00 - 18:00 (토-일, 공휴일 휴무)
          </Text>
          <Text
            style={{
              fontFamily: "P-Medium",
              fontSize: 14,
              color: "#B0B0B0",
            }}
          >
            점심시간 평일 13:00 - 14:00
          </Text>
          <Text
            style={{
              marginTop: 15,
              fontFamily: "P-Medium",
              fontSize: 14,
            }}
          >
            자주 묻는 질문
          </Text>
          <Text
            style={{
              marginTop: 15,
              fontFamily: "P-Medium",
              fontSize: 14,
            }}
          >
            1:1 문의
          </Text>
          <View
            style={{
              marginTop: 30,
              marginBottom: 30,
              width: "92%",
              height: 0.7,
              backgroundColor: "#BCBCBC",
              alignSelf: "center",
            }}
          />
          <Text
            style={{
              fontFamily: "P-Bold",
              fontSize: 14,
              color: "grey",
            }}
          >
            사업자 정보
          </Text>
          <Text
            style={{
              marginTop: 25,
              fontFamily: "P-Bold",
              fontSize: 14,
              color: "grey",
            }}
          >
            법적 고지사항
          </Text>
          <View
            style={{
              marginTop: 30,
              marginBottom: 30,
              width: "92%",
              height: 0.7,
              backgroundColor: "#BCBCBC",
              alignSelf: "center",
            }}
          />
          <Text
            style={{
              fontFamily: "P-Medium",
              fontSize: 14,
              color: "grey",
            }}
          >
            이용약관
          </Text>
          <Text
            style={{
              marginTop: 20,
              fontFamily: "P-Bold",
              fontSize: 14,
            }}
          >
            개인정보처리방침
          </Text>
          <Text
            style={{
              marginTop: 20,
              marginRight: 20,
              fontFamily: "P-Medium",
              fontSize: 14,
              color: "grey",
            }}
          >
            일부 상품의 경우 주식회사 ----는 통신판매의 당사자가 아닌
            통신판매중개자로서 상품, 상품정보, 거래에 대한 책임이 제한될 수
            있으므로, 각 상품 페이지에서 구체적인 내용을 확인하시기 바랍니다.
            일부 상품의 경우 주식회사 ----는 통신판매의 당사자가 아닌
            통신판매중개자로서 상품, 상품정보, 거래에 대한 책임이 제한될 수
            있으므로, 각 상품 페이지에서 구체적인 내용을 확인하시기 바랍니다.
            어쩌구
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  userId: {
    fontSize: 18,
    fontWeight: "bold",
  },
  grade: {
    color: "pink",
    marginTop: 4,
  },

  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconItem: {
    alignItems: "center",
  },
  iconValue: {
    fontWeight: "bold",
    fontSize: 16,
  },
  iconLabel: {
    fontSize: 12,
    color: "#555",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#888",
  },
  orderStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderStatus: {
    alignItems: "center",
    flex: 1,
  },
  orderCount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  orderLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  menuRow: {
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 14,
  },
});
