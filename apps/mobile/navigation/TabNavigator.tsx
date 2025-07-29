import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import HomeScreen from "../screens/HomeScreen";
import CategoryScreen from "../screens/CategoryScreen";
import SearchScreen from "../screens/SearchScreen";
import LikeScreen from "../screens/LikeScreen";
import MyScreen from "../screens/MyScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;

          if (route.name === "HOME") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "CATEGORY") {
            iconName = "list-outline";
          } else if (route.name === "SEARCH") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "LIKE") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "MY") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HOME" component={HomeScreen} />
      <Tab.Screen name="CATEGORY" component={CategoryScreen} />
      <Tab.Screen
        name="SEARCH"
        component={SearchScreen}
        options={{
          tabBarStyle: { display: "none" },
        }}
      />
      <Tab.Screen name="LIKE" component={LikeScreen} />
      <Tab.Screen name="MY" component={MyScreen} />
    </Tab.Navigator>
  );
}
