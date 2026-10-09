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
            (date: string, index: number) => {
              const d = new Date(date);
              // Format: "Friday, 9/11"
              const dayName = d.toLocaleDateString("en-US", {
                weekday: "long",
              });
              const month = d.getMonth() + 1;
              const day = d.getDate();
              return {
                id: index.toString(),
                date: `${dayName}, ${month}/${day}`,
                min: daily.temperature_2m_min[index],
                max: daily.temperature_2m_max[index],
              };
            },
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
        <View style={styles.header}>
          <Text style={styles.title}>Weather forecast</Text>
          <Text style={styles.city}>{city}</Text>
        </View>

        <FlatList
          data={forecast}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardDate}>{item.date}</Text>
              <Text style={styles.cardTemp}>
                Min {item.min}°C / Max {item.max}°C
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
    backgroundColor: "#f7f8fa",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  city: {
    fontSize: 18,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 6,
  },
  cardTemp: {
    fontSize: 16,
    color: "#333",
  },
});
