import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import CartScreen from "../screens/CartScreen";
import QnaScreen from "../screens/QnaScreen";
import LoginScreen from "../screens/LoginScreen";
import LoadingScreen from "../screens/LoadingScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ProductListScreen from "../screens/ProductListScreen";
import SearchModal from "../screens/SearchModal";

export type RootStackParamList = {
  Main: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Qna: { id: string };
  Login: undefined;
  Loading: undefined;
  SearchModal: undefined;
  Purchase: { id: string };
  ProductList: { category: string; brand: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Qna" component={QnaScreen} />
      <Stack.Screen name="SearchModal" component={SearchModal} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
    </Stack.Navigator>
  );
}
