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
} from "react-native";
import * as SecureStore from "expo-secure-store";
import DaumPostcode from "react-native-daum-postcode";
import CustomHeader from "../components/CustomHeader";
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
  onSaved: () => void;
  address: Address | null;
};

export default function AddressEditModal({
  visible,
  onClose,
  onSaved,
  address,
}: Props) {
  const [zipcode, setZipcode] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderMemo, setOrderMemo] = useState("");
  const [showPostcode, setShowPostcode] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (address) {
      setZipcode(address.zipcode);
      setLine1(address.address_line1);
      setLine2(address.address_line2 || "");
      setName(address.recipient_name);
      setPhone(address.phone_number);
      setOrderMemo(address.order_memo || "");
    }
  }, [address]);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSave = async () => {
    if (!zipcode || !line1 || !name || !phone) {
      showAlert("필수 입력", "우편번호, 주소, 수령인, 휴대폰은 필수입니다.");
      return;
    }
    try {
      const token = await SecureStore.getItemAsync("session_token");
      if (!token) throw new Error("로그인 토큰이 없습니다.");
      if (!address) throw new Error("수정할 주소가 없습니다.");

      const res = await fetch(`${API_URL}/users/user_address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_address_id: address?.id,
          recipient_name: name,
          phone_number: phone,
          zipcode,
          address_line1: line1,
          address_line2: line2,
          order_memo: orderMemo,
        }),
      });

      if (!res.ok) {
        throw new Error(`수정 실패: ${res.status}`);
      }

      console.log("주소 수정 성공");
      onSaved();
      onClose();
    } catch (err) {
      console.error("주소 수정 실패:", err);
      showAlert("오류", "주소 수정 중 문제가 발생했습니다.");
    }
  };

  const handleAddressSelect = (data: any) => {
    setZipcode(data.zonecode);
    setLine1(data.address);
    setShowPostcode(false);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CustomHeader
          title="배송지 수정"
          showBackButton
          onPressBack={onClose}
        />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.row}>
            <Text style={styles.label}>우편번호</Text>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: "#ecececff" }]}
              placeholder="우편번호"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={zipcode}
              editable={false}
            />
            <TouchableOpacity
              style={styles.zipBtn}
              onPress={() => setShowPostcode(true)}
            >
              <Text
                style={{
                  fontFamily: "P-500",
                  color: "#fff",
                }}
              >
                우편번호 찾기
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>주소지</Text>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: "#ecececff" }]}
              placeholder="주소지를 입력해주세요."
              placeholderTextColor="#999"
              value={line1}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>상세주소</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={line2}
              onChangeText={setLine2}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>수령인</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>휴대폰</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>배송 메모</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={orderMemo}
              onChangeText={setOrderMemo}
            />
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

        <Modal visible={alertVisible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              {alertTitle ? (
                <Text style={styles.alertTitle}>{alertTitle}</Text>
              ) : null}
              <Text style={styles.alertMessage}>{alertMessage}</Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => setAlertVisible(false)}
              >
                <Text style={styles.alertButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    width: 70,
    fontSize: 16,
    fontFamily: "P-500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 15,
    backgroundColor: "#fff",
    fontSize: 15,
    lineHeight: 17,
    fontFamily: "P-500",
  },
  zipBtn: {
    marginLeft: 8,
    paddingVertical: 13,
    paddingHorizontal: 13,
    backgroundColor: "#000",
    borderRadius: 20,
  },
  saveBtn: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "P-500",
  },
  postcodeHeader: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 21,
    fontFamily: "P-500",
  },
  headerClose: {
    fontSize: 25,
    fontFamily: "P-600",
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
  alertButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "white",
    fontFamily: "P-500",
    fontSize: 16,
  },
});
