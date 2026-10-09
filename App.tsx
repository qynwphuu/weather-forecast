import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type Coordinate = {
  latitude: number;
  longitude: number;
};

const DEFAULT_COORDINATE: Coordinate = {
  latitude: 60.200692,
  longitude: 24.934302,
};

export default function App() {
  const [location, setLocation] = useState<Coordinate>(DEFAULT_COORDINATE);
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>Weather Forecast</Text>
        <Text>${}</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
