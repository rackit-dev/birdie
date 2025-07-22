import React, { useState } from "react";
import {
  Button,
  FormControl,
  Input,
  ScrollView,
  Stack,
  Switch,
  Text,
} from "native-base";
import Picker from "../paymentComponent/pickers";
import { PGS, TIER_CODES } from "../paymentComponent/constants";
import { getMethods, getQuotas } from "../paymentComponent/utils";
import { IMPConst } from "iamport-react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

interface PaymentTestProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

export default function PaymentTest({ navigation }: PaymentTestProps) {
  const [pg, setPg] = useState("html5_inicis");
  const [tierCode, setTierCode] = useState<string>("");
  const [method, setMethod] = useState("card");
  const [cardQuota, setCardQuota] = useState(0);
  const [merchantUid, setMerchantUid] = useState(`mid_${new Date().getTime()}`);
  const [name, setName] = useState("아임포트 결제데이터분석");
  const [amount, setAmount] = useState("333");
  const [buyerName, setBuyerName] = useState("강지웅");
  const [buyerTel, setBuyerTel] = useState("01012341234");
  const [buyerEmail, setBuyerEmail] = useState("example@example.com");
  const [vbankDue, setVbankDue] = useState("");
  const [bizNum, setBizNum] = useState("");
  const [escrow, setEscrow] = useState(false);
  const [digital, setDigital] = useState(false);

  return (
    <ScrollView>
      <FormControl>
        <Stack>
          <FormControl.Label>PG가</FormControl.Label>
          <Picker
            data={PGS}
            selectedValue={pg}
            onValueChange={(value) => {
              setPg(value.toString());
              const methods = getMethods(value.toString());
              setMethod(methods[0].value);
            }}
          />
        </Stack>
        <Stack>
          <FormControl.Label>티어 코드</FormControl.Label>
          <Picker
            data={TIER_CODES}
            selectedValue={tierCode}
            onValueChange={(value) => setTierCode(value.toString())}
          />
        </Stack>
        <Stack>
          <FormControl.Label>결제수단</FormControl.Label>
          <Picker
            data={getMethods(pg)}
            selectedValue={method}
            onValueChange={(value) => setMethod(value.toString())}
          />
        </Stack>
        {method === "card" && (
          <Stack>
            <FormControl.Label>할부값</FormControl.Label>
            <Picker
              data={getQuotas(pg).map((item) => ({
                label: item.label,
                value: item.value.toString(),
              }))}
              selectedValue={cardQuota.toString()}
              onValueChange={(value) =>
                setCardQuota(parseInt(value.toString(), 10))
              }
            />
          </Stack>
        )}
        {method === "vbank" && (
          <Stack>
            <FormControl.Label>입금기한</FormControl.Label>
            <Input
              value={vbankDue}
              onChangeText={(value) => setVbankDue(value)}
            />
          </Stack>
        )}
        {method === "vbank" && pg === "danal_tpay" && (
          <Stack>
            <FormControl.Label>사업자번호</FormControl.Label>
            <Input
              value={bizNum}
              keyboardType="number-pad"
              onChangeText={(value) => setBizNum(value)}
            />
          </Stack>
        )}
        {method === "phone" && (
          <Stack>
            <FormControl.Label>실물콘텐츠</FormControl.Label>
            <Switch
              value={digital}
              onValueChange={(value) => setDigital(value)}
            />
          </Stack>
        )}
        <Stack>
          <FormControl.Label>에스크로</FormControl.Label>
          <Switch value={escrow} onValueChange={(value) => setEscrow(value)} />
        </Stack>
        <Stack>
          <FormControl.Label>주문명</FormControl.Label>
          <Input value={name} onChangeText={(value) => setName(value)} />
        </Stack>
        <Stack>
          <FormControl.Label>결제금액</FormControl.Label>
          <Input
            value={amount}
            keyboardType="number-pad"
            onChangeText={(value) => setAmount(value)}
          />
        </Stack>
        <Stack>
          <FormControl.Label>주문번호</FormControl.Label>
          <Input
            value={merchantUid}
            onChangeText={(value) => setMerchantUid(value)}
          />
        </Stack>
        <Stack>
          <FormControl.Label>이름</FormControl.Label>
          <Input
            value={buyerName}
            onChangeText={(value) => setBuyerName(value)}
          />
        </Stack>
        <Stack>
          <FormControl.Label>전화번호</FormControl.Label>
          <Input
            value={buyerTel}
            keyboardType="number-pad"
            onChangeText={(value) => setBuyerTel(value)}
          />
        </Stack>
        <Stack>
          <FormControl.Label>이메일</FormControl.Label>
          <Input
            value={buyerEmail}
            onChangeText={(value) => setBuyerEmail(value)}
          />
        </Stack>
        <Button
          onPress={() => {
            const data: any = {
              params: {
                pg,
                pay_method: method,
                merchant_uid: merchantUid,
                name,
                amount,
                app_scheme: "exampleformanagedexpo",
                buyer_name: buyerName,
                buyer_tel: buyerTel,
                buyer_email: buyerEmail,
                m_redirect_url: IMPConst.M_REDIRECT_URL,
                escrow,
              },
              tierCode,
            };

            if (method === "card" && cardQuota !== 0) {
              data.params.display = {
                card_quota: cardQuota === 1 ? [] : [cardQuota],
              };
            }

            if (method === "vbank" && vbankDue) {
              data.params.vbank_due = vbankDue;
            }

            if (method === "vbank" && pg === "danal_tpay") {
              data.params.biz_num = bizNum;
            }

            if (method === "phone") {
              data.params.digital = digital;
            }

            if (pg === "kcp_billing") {
              data.params.customer_uid = `cuid_${new Date().getTime()}`;
            }

            if (pg === "naverpay") {
              const today = new Date();
              const oneMonthLater = new Date(
                today.setMonth(today.getMonth() + 1)
              );
              const dd = String(oneMonthLater.getDate()).padStart(2, "0");
              const mm = String(oneMonthLater.getMonth() + 1).padStart(2, "0");
              const yyyy = oneMonthLater.getFullYear();

              data.params.naverPopupMode = false;
              data.params.naverUseCfm = `${yyyy}${mm}${dd}`;
              data.params.naverProducts = [
                {
                  categoryType: "BOOK",
                  categoryId: "GENERAL",
                  uid: "107922211",
                  name: "한국사",
                  payReferrer: "NAVER_BOOK",
                  count: 10,
                },
              ];
            }

            navigation.navigate("Payment", data);
          }}
        >
          <Text>결제하기</Text>
        </Button>
      </FormControl>
    </ScrollView>
  );
}
