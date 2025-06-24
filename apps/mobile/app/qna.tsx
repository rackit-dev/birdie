import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function QnaPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>판매자에게 문의하기</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productBox}>
        <Image
          source={require("@/assets/images/items/shoes1.jpg")}
          style={styles.productImage}
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.productTitle}>OOLALA OOMEGA NOMAD</Text>
          <Text style={styles.productPrice}>89,000원</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>문의 유형 (필수)</Text>
        <TouchableOpacity style={styles.selectBox}>
          <Text style={styles.selectText}>문의유형을 선택해 주세요</Text>
        </TouchableOpacity>
        <Text style={styles.note}>
          교환/반품/취소 관련 문의는 1:1 문의에서 등록해주세요.
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>문의 상품옵션</Text>
        <TouchableOpacity style={styles.selectBox}>
          <Text style={styles.selectText}>옵션을 선택해 주세요</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>제목 (필수)</Text>
        <TextInput
          style={styles.input}
          placeholder="30자 이내로 입력해주세요"
          maxLength={30}
        />
      </View>

      <View style={styles.formSectionRow}>
        <TouchableOpacity style={styles.checkbox} />
        <Text style={styles.label}>비밀글</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>내용 (필수)</Text>
        <TextInput
          style={styles.textarea}
          placeholder="문의할 내용을 입력해주세요."
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>사진 첨부</Text>
        <View style={styles.uploadBox}>
          <Text>+</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 37,
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  close: { fontSize: 20 },
  productBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 24,
  },
  productImage: { width: 70, height: 70, borderRadius: 8 },
  productTitle: { fontSize: 16, fontWeight: "bold" },
  productPrice: { marginTop: 4, fontSize: 15, color: "#555" },
  formSection: { marginBottom: 20 },
  formSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: { fontSize: 15, marginBottom: 6, fontWeight: "600" },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
  },
  selectText: { color: "#999" },
  note: { color: "#999", fontSize: 13, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    textAlignVertical: "top",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 8,
  },
  uploadBox: {
    width: 80,
    height: 80,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
});
