import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, FlatList, View } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

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

  useEffect(() => {
    const fetchData = () => {
      // ASK FOR GPS PERMISSION
      Location.requestForegroundPermissionsAsync()
        // GET THE LOCATION
        .then((permission) => {
          return Location.getCurrentPositionAsync({});
        })

        // SAVE THE LOCATION
        .then((userLocation) => {
          const coords = {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          };
          setLocation(coords);
          // GET CITY NAME
          Location.reverseGeocodeAsync(coords).then((reverseGeocode) => {
            if (reverseGeocode.length > 0) {
              setCity(
                reverseGeocode[0].city || reverseGeocode[0].subregion || "",
              );
            }
          });

          return fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
          );
        })
        .then((response) => response.json())
        .then((data) => {
          const daily = data.daily;
          const formattedData = daily.time.map(
            (date: string, index: number) => ({
              date,
              min: daily.temperature_2m_min[index],
              max: daily.temperature_2m_max[index],
            }),
          );
          setForecast(formattedData);
        })
        .catch((error) => console.error(error));
    };
    fetchData();
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView>
        <Text>Weather Forecast</Text>
        <Text>{city}</Text>
        <FlatList
          data={forecast}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardDate}>{item.date}</Text>
              <Text style={styles.cardTemp}>
                {item.min}°C / {item.max}°C
              </Text>
            </View>
          )}
        />
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  city: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: "500",
  },
  cardTemp: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
