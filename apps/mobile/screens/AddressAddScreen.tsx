import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DaumPostcode from "react-native-daum-postcode";
import CustomHeader from "../components/CustomHeader";

export default function AddressAddScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (route.params?.products) {
      setProducts(route.params.products);
    }
  }, [route.params?.products]);

  const [zipcode, setZipcode] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [showPostcode, setShowPostcode] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const userId = "test_user1"; // ✅ 실제 로그인 유저 ID로 교체

  const handleSave = async () => {
    if (!zipcode || !line1 || !name || !phone) {
      Alert.alert("필수 입력", "우편번호, 주소, 수령인, 휴대폰은 필수입니다.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          zipcode,
          line1,
          line2,
          name,
          phone,
          is_default: isDefault,
        }),
      });

      if (!res.ok) {
        throw new Error(`저장 실패: ${res.status}`);
      }

      // 저장 성공 → 목록으로 돌아가기
      navigation.goBack();
    } catch (err) {
      console.error("주소 저장 실패:", err);
      Alert.alert("오류", "주소 저장 중 문제가 발생했습니다.");
    }
  };

  const handleAddressSelect = (data: any) => {
    setZipcode(data.zonecode);
    setLine1(data.address);
    setShowPostcode(false);
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="배송지 추가"
        showBackButton
        onPressBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.row}>
          <Text style={styles.label}>우편번호</Text>
          <TextInput
            style={[
              styles.input,
              { flex: 1, fontSize: 15, fontFamily: "P-Medium" },
            ]}
            placeholder="우편번호"
            placeholderTextColor="#999"
            value={zipcode}
            onChangeText={setZipcode}
          />
          <TouchableOpacity
            style={styles.zipBtn}
            onPress={() => setShowPostcode(true)}
          >
            <Text style={{ fontFamily: "P-Medium", color: "#fff" }}>
              우편번호 찾기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>주소지</Text>
          <TextInput
            style={[
              styles.input,
              { flex: 1, fontSize: 15, fontFamily: "P-Medium" },
            ]}
            placeholder="주소지를 입력해주세요."
            placeholderTextColor="#999"
            value={line1}
            onChangeText={setLine1}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>상세주소</Text>
          <TextInput
            style={[
              styles.input,
              { flex: 1, fontSize: 15, fontFamily: "P-Medium" },
            ]}
            placeholder="상세주소를 입력해주세요."
            placeholderTextColor="#999"
            value={line2}
            onChangeText={setLine2}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>수령인</Text>
          <TextInput
            style={[
              styles.input,
              { flex: 1, fontSize: 15, fontFamily: "P-Medium" },
            ]}
            placeholder="이름을 입력해주세요."
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>휴대폰</Text>
          <TextInput
            style={[
              styles.input,
              { flex: 1, fontSize: 15, fontFamily: "P-Medium" },
            ]}
            placeholder="숫자만 입력해주세요."
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.checkRow}>
          <TouchableOpacity
            onPress={() => setIsDefault((prev) => !prev)}
            style={[
              styles.checkbox,
              { backgroundColor: isDefault ? "#000" : "#fff" },
            ]}
          />
          <Text style={{ marginLeft: 8 }}>기본 배송지로 설정</Text>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>저장하기</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showPostcode} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.postcodeHeader}>
            <Text style={{ width: 17 }}></Text>
            <Text style={styles.headerTitle}>주소 검색</Text>
            <TouchableOpacity onPress={() => setShowPostcode(false)}>
              <Text style={styles.headerClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <DaumPostcode
            style={{ flex: 1 }}
            onSelected={handleAddressSelect}
            onError={(err) => console.error("주소 검색 오류:", err)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  label: { width: 70, fontSize: 16, fontFamily: "P-Medium" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 15,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  zipBtn: {
    marginLeft: 8,
    paddingVertical: 13,
    paddingHorizontal: 13,
    backgroundColor: "#000",
    borderRadius: 20,
  },
  checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  saveBtn: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  postcodeHeader: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 22, fontFamily: "P-Medium" },
  headerClose: { fontSize: 25, fontFamily: "P-Medium" },
});
