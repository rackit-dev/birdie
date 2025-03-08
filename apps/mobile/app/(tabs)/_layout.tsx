import React from "react";
import { Pressable, View, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, Tabs } from "expo-router";
import { BlurView } from "expo-blur";

import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useThemeColor } from "@/components/Themed";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
        headerStyle: {
          backgroundColor: useThemeColor({}, "headerBackground"),
          height: 105,
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
              tint="light"
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
          headerTitle: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={21}
              color={color}
            />
          ),
          tabBarLabelStyle: {
            marginTop: 2.5,
          },
          tabBarIconStyle: {
            marginTop: 2.5,
          },
          headerLeft: () => (
            <View>
              <Image
                source={require("../../assets/images/logo.png")}
                style={{
                  width: 100,
                  height: 90,
                  marginLeft: 8,
                  marginBottom: 5,
                }}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Ionicons name="search-outline" size={25} color="black" />
                  )}
                </Pressable>
              </Link>

              <View style={{ width: 15 }} />

              <Link href="/cart" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Ionicons
                      name="bag-outline"
                      size={25}
                      color={Colors["light"].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: "CATEGORY",
          headerShown: true,
          headerTitle: "",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list-outline" size={26} color={color} />
          ),
          tabBarLabelStyle: {
            marginTop: 2.5,
          },
          tabBarIconStyle: {
            marginTop: 2.5,
          },
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Ionicons name="search-outline" size={25} color="black" />
                  )}
                </Pressable>
              </Link>

              <View style={{ width: 15 }} />

              <Link href="/cart" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Ionicons
                      name="bag-outline"
                      size={25}
                      color={Colors["light"].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "SEARCH",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={22}
              color={color}
            />
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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={22}
              color={color}
            />
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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
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
