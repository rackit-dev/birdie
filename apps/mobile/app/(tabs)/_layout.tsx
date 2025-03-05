import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Pressable, View } from "react-native";

import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeColor } from "@/components/Themed";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
        headerStyle: {
          backgroundColor: useThemeColor({}, "headerBackground"),
        },
        headerTintColor: useThemeColor({}, "headerText"),

        tabBarStyle: {
          position: "absolute",
          backgroundColor: ["index", "like"].includes(route.name)
            ? "transparent"
            : "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
        },

        tabBarBackground: () =>
          ["index", "like"].includes(route.name) ? (
            <BlurView
              intensity={90}
              tint="default"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 85,
                overflow: "hidden",
                backgroundColor: "rgba(245, 245, 245, 0.8)",
              }}
            />
          ) : (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 85,
                backgroundColor: "#f5f5f5",
              }}
            />
          ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid" size={21} color={color} />
          ),
          tabBarLabelStyle: {
            marginTop: 2.5,
          },
          tabBarIconStyle: {
            marginTop: 2.5,
          },
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors["light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: "CATEGORY",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={26} color={color} />
          ),
          tabBarLabelStyle: {
            marginTop: 2.5,
          },
          tabBarIconStyle: {
            marginTop: 2.5,
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "SEARCH",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={22} color={color} />
          ),
          tabBarLabelStyle: {
            marginTop: 2.5,
            marginLeft: 3,
          },
          tabBarIconStyle: {
            marginTop: 2.5,
            marginLeft: 3,
          },
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="like"
        options={{
          title: "LIKE",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={22} color={color} />
          ),
          tabBarLabelStyle: {
            marginTop: 2.5,
            marginLeft: 4,
          },
          tabBarIconStyle: {
            marginTop: 2.5,
            marginLeft: 4,
          },
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: "MY",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
          tabBarLabelStyle: {
            marginTop: 2.5,
          },
          tabBarIconStyle: {
            marginTop: 2.5,
          },
        }}
      />
    </Tabs>
  );
}
