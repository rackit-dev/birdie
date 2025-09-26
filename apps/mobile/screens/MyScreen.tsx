import { useState, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import Modal from "react-native-modal";
import { Text, View } from "@/components/Themed";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import CustomHeader from "../components/CustomHeader";
import useLikeStore from "../store/useLikeStore";
import { useCartStore } from "../store/useCartStore";
import { useUserIdStore } from "../store/useUserIdStore";
import AddressListModal from "../screens/AddressListModal";
import { API_URL } from "@env";

export default function MyScreen() {
  type Navigation = NativeStackNavigationProp<RootStackParamList, "Main">;
  const navigation = useNavigation<Navigation>();
  const [cartCount, setCartCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);

  const userId = useUserIdStore((s) => s.id);
  const name = useUserIdStore((s) => s.name);
  const setUser = useUserIdStore((s) => s.setUser);
  const clearUser = useUserIdStore((s) => s.clearUser);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newName, setNewName] = useState(name ?? "");

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

      const fetchCouponCount = async () => {
        try {
          const res = await axios.get(`${API_URL}/coupons/wallet/by_user`, {
            params: { user_id: userId },
          });

          const walletList = res.data.coupon_wallets ?? [];

          // 사용하지 않은 쿠폰만 카운트
          const availableCount = walletList.filter(
            (c: any) => !c.is_used
          ).length;

          setCouponCount(availableCount);
        } catch (err) {
          console.error("쿠폰 개수 불러오기 실패:", err);
        }
      };

      fetchCartCount();
      fetchCouponCount();
    }, [userId])
  );

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("session_token");

      clearUser();

      useLikeStore.getState().reset();
      useCartStore.getState().reset();

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" as never }],
      });
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  const handleUpdateName = async () => {
    try {
      const token = await SecureStore.getItemAsync("session_token");
      if (!token) {
        Alert.alert(
          "로그인 필요",
          "로그인이 만료되었습니다. 다시 로그인해주세요."
        );
        navigation.navigate("Login");
        return;
      }

      await axios.put(
        `${API_URL}/users`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUser({ id: userId!, name: newName, email: null });
      Alert.alert("성공", "닉네임이 변경되었습니다.");
      setIsEditModalVisible(false);
    } catch (err) {
      console.error("닉네임 수정 실패:", err);
      Alert.alert("실패", "닉네임 변경 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = await SecureStore.getItemAsync("session_token");
      if (!token) {
        console.error("토큰 없음");
        return;
      }

      await axios.delete(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await SecureStore.deleteItemAsync("session_token");
      clearUser();

      useLikeStore.getState().reset();
      useCartStore.getState().reset();

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" as never }],
      });
    } catch (err) {
      console.error("탈퇴 실패:", err);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="마이페이지"
        onPressCart={() => navigation.navigate("Cart")}
        cartCount={cartCount}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={() => {
              if (!name) {
                navigation.navigate("Login");
              }
            }}
            activeOpacity={name ? 1 : 0.7}
          >
            <Text style={styles.userId}>
              {name ? name : "로그인/회원가입 >"}
            </Text>
          </TouchableOpacity>

          {name && (
            <TouchableOpacity
              onPress={() => {
                setNewName(name);
                setIsEditModalVisible(true);
              }}
            >
              <Text style={styles.linkText}>내정보 수정하기 &gt;</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.iconRow}>
          {[
            { label: "포인트", value: userId ? "0P" : "0P", route: "Point" },
            {
              label: "쿠폰",
              value: userId ? `${couponCount}장` : "0장",
              route: "CouponList",
            },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.iconItem}
              onPress={() => {
                if (!userId) {
                  navigation.navigate("Login");
                  return;
                }
                if (item.route) navigation.navigate(item.route as never);
              }}
            >
              <Text style={styles.iconValue}>{item.value}</Text>
              <Text style={styles.iconLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>쇼핑 활동</Text>
          {[
            { label: "주문 내역", route: "OrderList" },
            { label: "취소/반품/교환 내역" },
            { label: "배송지 관리" },
            { label: "환불계좌 관리" },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuRow}
              onPress={() => {
                if (!userId) {
                  navigation.navigate("Login");
                  return;
                }

                if (
                  item.label === "취소/반품/교환 내역" ||
                  item.label === "배송지 관리" ||
                  item.label === "환불계좌 관리"
                ) {
                  Alert.alert("준비중입니다");
                  return;
                }

                if (item.route) navigation.navigate(item.route as never);
              }}
            >
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의</Text>
          {["고객센터/공지사항"].map((label, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuRow}
              onPress={() => {
                Alert.alert("준비중입니다");
              }}
            >
              <Text style={styles.menuText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {userId && (
          <View
            style={{
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.menuText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        isVisible={isEditModalVisible}
        onBackdropPress={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>내 정보 수정</Text>
          <TextInput
            style={styles.input}
            placeholder="닉네임 입력"
            value={newName}
            onChangeText={setNewName}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdateName}
          >
            <Text style={styles.saveText}>저장</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 20, alignSelf: "flex-end" }}
            onPress={() =>
              Alert.alert("회원 탈퇴", "정말 탈퇴하시겠습니까?", [
                { text: "취소", style: "cancel" },
                {
                  text: "탈퇴",
                  style: "destructive",
                  onPress: handleDeleteAccount,
                },
              ])
            }
          >
            <Text
              style={{
                color: "red",
                fontSize: 16,
                fontFamily: "P-500",
              }}
            >
              회원 탈퇴
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    fontSize: 22,
    fontFamily: "P-600",
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
  iconValue: { fontFamily: "P-500", fontSize: 16 },
  iconLabel: {
    fontSize: 12,
    fontFamily: "P-500",
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
    fontSize: 18,
    fontFamily: "P-600",
    marginBottom: 5,
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
    fontFamily: "P-500",
  },
  orderLabel: {
    fontSize: 12,
    fontFamily: "P-500",
    marginTop: 4,
  },
  menuRow: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "P-500",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontFamily: "P-600", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "white", fontFamily: "P-600" },
});
