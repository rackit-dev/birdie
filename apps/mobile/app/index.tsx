import { View, Image } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Image
        source={require("@/assets/images/logo.png")}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
    </View>
  );
}
