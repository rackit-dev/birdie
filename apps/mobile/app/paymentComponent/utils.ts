// component/paymentComponent/utils.ts
import {
  QUOTAS,
  METHODS,
  METHODS_FOR_KCP,
  METHODS_FOR_UPLUS,
  METHODS_FOR_INICIS,
  METHODS_FOR_MOBILIANS,
  METHOD_FOR_CARD,
  METHOD_FOR_PHONE,
  METHOD_FOR_VBANK,
  METHOD_FOR_TRANS,
} from "./constants";

type PG =
  | "html5_inicis"
  | "kcp"
  | "kcp_billing"
  | "uplus"
  | "jtnet"
  | "nice"
  | "kakaopay"
  | "kakao"
  | "danal"
  | "danal_tpay"
  | "kicc"
  | "paypal"
  | "mobilians"
  | "payco"
  | "eximbay"
  | "settle"
  | "naverco"
  | "naverpay"
  | "smilepay"
  | "chai"
  | "payple"
  | "alipay"
  | "bluewalnut"
  | "tosspay"
  | string;

type QuotaItem = {
  value: number;
  label: string;
};

function getQuotas(pg: PG): QuotaItem[] {
  switch (pg) {
    case "html5_inicis":
    case "kcp":
      return QUOTAS.concat([
        { value: 2, label: "2개월" },
        { value: 3, label: "3개월" },
        { value: 4, label: "4개월" },
        { value: 5, label: "5개월" },
        { value: 6, label: "6개월" },
      ]);
    default:
      return QUOTAS;
  }
}

type MethodItem = {
  value: string;
  label: string;
};

function getMethods(pg: PG): MethodItem[] {
  switch (pg) {
    case "html5_inicis":
      return METHODS_FOR_INICIS;
    case "kcp":
      return METHODS_FOR_KCP;
    case "kcp_billing":
    case "kakaopay":
    case "kakao":
    case "paypal":
    case "payco":
    case "smilepay":
    case "chai":
    case "alipay":
    case "tosspay":
      return METHOD_FOR_CARD;
    case "uplus":
      return METHODS_FOR_UPLUS;
    case "danal":
      return METHOD_FOR_PHONE;
    case "mobilians":
      return METHODS_FOR_MOBILIANS;
    case "settle":
      return METHOD_FOR_VBANK;
    case "payple":
      return METHOD_FOR_TRANS;
    default:
      return METHODS;
  }
}

function getUserCode(
  pg?: PG,
  tierCode?: string,
  type: string = "payment"
): string {
  return "imp83677210";
}

export { getQuotas, getMethods, getUserCode };
