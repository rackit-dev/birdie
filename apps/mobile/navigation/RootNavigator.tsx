import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import CartScreen from "../screens/CartScreen";
import QnaScreen from "../screens/QnaScreen";
import LoginScreen from "../screens/LoginScreen";
import LoadingScreen from "../screens/LoadingScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ProductListScreen from "../screens/ProductListScreen";
import SearchModal from "../screens/SearchModal";
import SearchScreen from "../screens/SearchScreen";
import PurchaseScreen from "../screens/PurchaseScreen";
import CouponListScreen from "../screens/CouponListScreen";
import PaymentWebviewScreen from "../screens/payment/PaymentWebviewScreen";
import PaymentResultScreen from "../screens/payment/PaymentResultScreen";
import QnaListScreen from "../screens/QnaListScreen";

type PortOnePaymentRequest = {
  storeId: string;
  channelKey: string;
  paymentId: string; // 가맹점 주문번호(고유)
  orderName: string;
  totalAmount: number;
  currency: "CURRENCY_KRW" | "CURRENCY_USD" | string;
  payMethod?: "CARD" | "MOBILE" | "VBANK";
  customer?: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  noticeUrls?: string[];
};

export type RootStackParamList = {
  Main: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Qna: { id: string };
  Login: undefined;
  Loading: undefined;
  SearchModal: undefined;
  Purchase: {
    fromCart: boolean;
    products: {
      id: string;
      brand: string;
      name: string;
      option: string;
      quantity: number;
      price: number;
      image: string;
    }[];
  };
  CouponList: undefined;
  ProductList: { category: string; brand: string };
  Search: undefined;
  PaymentWebview: { params: PortOnePaymentRequest };
  PaymentResult: {
    success?: boolean | string;
    paymentId?: string;
    orderId?: string;
    code?: string;
    message?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Qna" component={QnaScreen} />
      <Stack.Screen name="SearchModal" component={SearchModal} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Purchase" component={PurchaseScreen} />
      <Stack.Screen name="PaymentWebview" component={PaymentWebviewScreen} />
      <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
      <Stack.Screen name="CouponList" component={CouponListScreen} />
      <Stack.Screen name="QnaList" component={QnaListScreen} />
    </Stack.Navigator>
  );
}
