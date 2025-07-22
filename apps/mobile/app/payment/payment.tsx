import React from "react";
import IMP from "iamport-react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { getUserCode } from "../paymentComponent/utils";
import Loading from "../loading";

type RootStackParamList = {
  Payment: {
    params: any;
    tierCode?: string;
  };
  paymentResult: any;
};

type Props = StackScreenProps<RootStackParamList, "Payment">;

export default function Payment({ route, navigation }: Props) {
  const { params, tierCode } = route.params;
  const userCode = getUserCode(params.pg, tierCode);
  console.log(userCode);

  return (
    <IMP.Payment
      userCode={userCode}
      tierCode={tierCode}
      loading={<Loading />}
      data={params}
      callback={(response: any) =>
        navigation.replace("paymentResult", response)
      }
    />
  );
}
