import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../components/CustomHeader";
import axios from "axios";
import { useUserIdStore } from "@/store/useUserIdStore";
import { API_URL } from "@env";

type CouponDetail = {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_rate: number;
  discount_amount: number;
  min_order_amount: number;
  max_discount_amount: number;
  valid_until: string;
};

type CouponWallet = {
  id: string;
  coupon_id: string;
  is_used: boolean;
  created_at: string;
  updated_at: string;
  coupon: CouponDetail | null;
};

export default function CouponListScreen() {
  const [coupons, setCoupons] = useState<CouponWallet[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const userId = useUserIdStore((s) => s.id);
  const navigation = useNavigation();

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons/wallet/by_user`, {
        params: { user_id: userId },
      });
      console.log("쿠폰 지갑 응답:", res.data);

      const walletList: Omit<CouponWallet, "coupon">[] =
        res.data.coupon_wallets ?? [];

      const merged = await Promise.all(
        walletList.map(async (w) => {
          try {
            const detailRes = await axios.get(`${API_URL}/coupons/by_id`, {
              params: { coupon_id: w.coupon_id },
            });
            return { ...w, coupon: detailRes.data };
          } catch (e) {
            console.error(`쿠폰 상세 불러오기 실패: ${w.coupon_id}`, e);
            return { ...w, coupon: null };
          }
        })
      );

      const available = merged.filter(
        (c) =>
          !c.is_used && c.coupon && new Date(c.coupon.valid_until) > new Date()
      );

      setCoupons(available);
    } catch (err) {
      console.error("쿠폰 불러오기 실패:", err);
    }
  }, [API_URL, userId]);

  useEffect(() => {
    if (userId) fetchCoupons();
  }, [userId, fetchCoupons]);

  const renderCoupon = ({ item }: { item: CouponWallet }) => {
    const c = item.coupon;
    if (!c) return null;

    return (
      <View style={styles.couponCard}>
        <View style={styles.cutoutLeft} />
        <View style={styles.couponContent}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.discountText}>
              {c.discount_type === "비율"
                ? `${c.discount_rate}%`
                : `${(Number(c.discount_amount) || 0).toLocaleString()}원`}
            </Text>

            <TouchableOpacity>
              <Text style={styles.linkText}>적용 상품 &gt;</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.titleText}>{c.description}</Text>

          {c.discount_type === "비율" ? (
            <Text style={styles.subText}>
              {`${(
                Number(c.min_order_amount) || 0
              ).toLocaleString()}원 이상 주문 시, 최대 ${(
                Number(c.max_discount_amount) || 0
              ).toLocaleString()}원 할인`}
            </Text>
          ) : (
            <Text style={styles.subText}>
              {`${(
                Number(c.min_order_amount) || 0
              ).toLocaleString()}원 이상 주문 시, ${(
                Number(c.discount_amount) || 0
              ).toLocaleString()}원 할인`}
            </Text>
          )}

          <Text style={styles.subText}>
            {(() => {
              const d = new Date(c.valid_until);
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              const hh = String(d.getHours()).padStart(2, "0");
              const mi = String(d.getMinutes()).padStart(2, "0");
              return `${yyyy}-${mm}-${dd} ${hh}:${mi}까지`;
            })()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="쿠폰함"
        showBackButton
        onPressBack={() => navigation.goBack()}
      />
      <View style={styles.topRow}>
        <Text style={styles.totalText}>전체 쿠폰 {coupons.length}개</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={styles.whiteBtn}
            onPress={() => setShowInput((prev) => !prev)}
          >
            <Text>쿠폰등록</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showInput && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="쿠폰코드를 입력해주세요"
            placeholderTextColor={"#999"}
            value={couponCode}
            onChangeText={setCouponCode}
          />
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={async () => {
              try {
                const res = await axios.post(
                  `${API_URL}/coupons/wallet/by_code`,
                  null,
                  {
                    params: {
                      user_id: userId,
                      coupon_code: couponCode,
                    },
                  }
                );
                console.log("쿠폰 등록 성공:", res.data);

                setCouponCode("");
                setShowInput(false);

                fetchCoupons();
              } catch (err: any) {
                console.error("쿠폰 등록 실패:", err);
                Alert.alert(
                  "쿠폰 등록 실패",
                  "쿠폰 코드가 올바르지 않거나 이미 등록된 쿠폰입니다."
                );
              }
            }}
          >
            <Text style={{ color: "#fff", padding: 3 }}>등록</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={coupons}
        renderItem={renderCoupon}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
    marginBottom: -18,
  },
  totalText: { fontSize: 16, fontFamily: "P-500" },
  whiteBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  couponCard: {
    backgroundColor: "#f4f4f4ff",
    borderRadius: 8,
    marginBottom: 12,
    position: "relative",
  },
  couponContent: {
    padding: 20,
    paddingLeft: 24,
  },
  cutoutLeft: {
    position: "absolute",
    left: -12,
    top: "50%",
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  discountText: { fontSize: 18, fontFamily: "P-600", color: "#FF2D55" },
  titleText: { fontSize: 16, fontFamily: "P-600", marginTop: 6 },
  subText: { fontSize: 13, fontFamily: "P-500", color: "#666", marginTop: 4 },
  linkText: { fontSize: 13, fontFamily: "P-500", color: "#555" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 8,
  },
  registerBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
});
