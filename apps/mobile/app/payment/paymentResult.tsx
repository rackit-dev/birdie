import React from "react";
import {
  ArrowBackIcon,
  CheckCircleIcon,
  IconButton,
  List,
  Text,
  View,
  WarningIcon,
} from "native-base";
import { StackScreenProps } from "@react-navigation/stack";

type RootStackParamList = {
  PaymentResult: {
    imp_success?: boolean | string;
    success?: boolean | string;
    imp_uid?: string;
    merchant_uid?: string;
    error_msg?: string;
  };
  Menu: undefined;
};

type Props = StackScreenProps<RootStackParamList, "PaymentResult">;

export default function PaymentResult({ route, navigation }: Props) {
  const { imp_success, success, imp_uid, merchant_uid, error_msg } =
    route.params;

  // 결제 성공 여부 판별
  const isSuccess = !(
    imp_success === "false" ||
    imp_success === false ||
    success === "false" ||
    success === false
  );

  return (
    <View p={5}>
      {isSuccess ? (
        <CheckCircleIcon size="xl" color="green.500" />
      ) : (
        <WarningIcon size="xl" color="red.500" />
      )}
      <Text fontSize="xl" fontWeight="bold" my={4}>
        결제에 {isSuccess ? "성공" : "실패"}하였습니다
      </Text>
      <List borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <List.Item>
          <Text fontWeight="bold" mr={2}>
            아임포트 번호:
          </Text>
          <Text>{imp_uid || "없음"}</Text>
        </List.Item>
        {isSuccess ? (
          <List.Item>
            <Text fontWeight="bold" mr={2}>
              주문번호:
            </Text>
            <Text>{merchant_uid || "없음"}</Text>
          </List.Item>
        ) : (
          <List.Item>
            <Text fontWeight="bold" mr={2}>
              에러메시지:
            </Text>
            <Text>{error_msg || "없음"}</Text>
          </List.Item>
        )}
      </List>
      <IconButton
        icon={<ArrowBackIcon />}
        onPress={() => navigation.navigate("Menu")}
        mt={5}
      />
    </View>
  );
}
