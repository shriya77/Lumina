import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  ImageBackground,
  View,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
  FlatList,
} from 'react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useNavigation } from '@react-navigation/native'
import { Auth } from "aws-amplify";

export default function HomeScreen() {
  const navigation = useNavigation();

  const [temperature, setTemperature] = useState(null);
  const [weatherDescription, setWeatherDescription] = useState("");
  const [moonPhase, setMoonPhase] = useState("");
  const [news, setNews] = useState([]);
  const [stateString, setStateString] = useState("");
  const [city, setCity] = useState("");
  const [cloudCoverage, setCloudCoverage] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [moonrise, setMoonrise] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [currentDay, setCurrentDay] = useState("");
  const [isSettingsBoxVisible, setIsSettingsBoxVisible] = useState(false);

  useEffect(() => {
    fetchWeather();
    fetchNews();
    handleFetchUserAttributes();
    setCurrentDay(getCurrentDay());
  }, []);

  const getCurrentDay = () => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    return daysOfWeek[today.getDay()];
  };

  const capitalizeDescription = (desc) => {
    return desc
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  function getPhaseName(moonPhaseValue) {
    if (moonPhaseValue === 0 || moonPhaseValue === 1) return 'New Moon';
    if (moonPhaseValue === 0.25) return 'First Quarter';
    if (moonPhaseValue === 0.5) return 'Full Moon';
    if (moonPhaseValue === 0.75) return 'Last Quarter';
    if (moonPhaseValue > 0 && moonPhaseValue < 0.25) return 'Waxing Crescent';
    if (moonPhaseValue > 0.25 && moonPhaseValue < 0.5) return 'Waxing Gibbous';
    if (moonPhaseValue > 0.5 && moonPhaseValue < 0.75) return 'Waning Gibbous';
    if (moonPhaseValue > 0.75 && moonPhaseValue < 1) return 'Waning Crescent';
  }

  async function handleFetchUserAttributes() {
    try {
      const userAttributes = await fetchUserAttributes();
      setStateString(userAttributes['custom:state']);
      console.log(stateString);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    handleFetchUserAttributes();
  }, []);

  async function fetchEvents() {
    const eventsUrl =
      'https://fi4o4iz0e2.execute-api.us-east-2.amazonaws.com/dev/recommendationsData?cityName=Dallas&stateName=TX';
    try {
      const response = await fetch(eventsUrl);
      if (!response.ok) throw new Error(`Response status: ${response.status}`);
      const eventData = await response.json();
      if (Array.isArray(eventData.body)) {
        const formattedEvents = eventData.body.map((event) => {
          const eventDate = new Date(event.date);
          const formattedDate = eventDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
          });
          return { ...event, date: formattedDate };
        });
        setEvents(formattedEvents);
      } else {
        console.error('Invalid event data format:', eventData);
      }
    } catch (error) {
      console.error('Fetch events error:', error);
    }
  }

  const fetchWeather = async () => {
    const url =
      "https://fi4o4iz0e2.execute-api.us-east-2.amazonaws.com/dev/weatherData?cityName=Dallas";

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Response status: ${response.status}`);

      const weatherData = await response.json();
      setTemperature(Math.round(weatherData.body.temp));
      setWeatherDescription(weatherData.body.description);
      setMoonPhase(getPhaseName(weatherData.body.moonphase));
      setCloudCoverage(weatherData.body.clouds);
      setWindSpeed(weatherData.body.wind);
      setMoonrise(weatherData.body.moonrise);
      setSunset(weatherData.body.sunset);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      // await Auth.signOut();
      // Alert.alert("Signed Out", "You have been signed out.");
      navigation.navigate("authenticationScreens");
    } catch (error) {
      console.error("Error signing out: ", error);
      Alert.alert("Sign Out Error", "Failed to sign out. Please try again.");
    }
  };

  const fetchNews = async () => {
    const newsUrl =
      "https://fi4o4iz0e2.execute-api.us-east-2.amazonaws.com/dev/newsData";

    try {
      const response = await fetch(newsUrl);
      if (!response.ok) throw new Error(`Response status: ${response.status}`);

      const newsData = await response.json();
      const parsedData = JSON.parse(newsData.body);
      const astronomyKeywords = [
        "astronomy",
        "space",
        "NASA",
        "planet",
        "star",
        "galaxy",
        "cosmos",
        "universe",
      ];

      const filteredNews = parsedData.filter((article) =>
        astronomyKeywords.some(
          (keyword) =>
            (article.title && article.title.toLowerCase().includes(keyword)) ||
            (article.description &&
              article.description.toLowerCase().includes(keyword))
        )
      );

      setNews(filteredNews.slice(0, 3));
    } catch (error) {
      console.error("Fetch news error:", error.message);
    }
  };

  const toggleSettingsBox = () => {
    setIsSettingsBoxVisible((prevState) => !prevState);
  };
  
  const moonPhaseImages = {
    "New Moon": '../assets/newAssets/universalAssets/moonIcons/full-moon.png',
    "First Quarter": "../assets/newAssets/universalAssets/moonIcons/first-quarter.png",
    "Full Moon": "../assets/newAssets/universalAssets/moonIcons/full-moon.png",
    "Last Quarter": "../assets/newAssets/universalAssets/moonIcons/third-quarter.png",
    "Waxing Crescent": "../assets/newAssets/universalAssets/moonIcons/waxing-crescent.png",
    "Waxing Gibbous": "../assets/newAssets/universalAssets/moonIcons/waxing-gibbous.png",
    "Waning Gibbous": "/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/moonIcons/waning-gib.png",
    "Waning Crescent": "../assets/newAssets/universalAssets/moonIcons/waning-crescent.png",
  };
  
  const weatherIcons = {
    "clear sky": require("../assets/newAssets/universalAssets/weatherIcons/sun.png"),
    "few clouds": require("../assets/newAssets/universalAssets/weatherIcons/cloud.png"),
    "scattered clouds": require("../assets/newAssets/universalAssets/weatherIcons/broken-cloud.png"),
    "broken clouds": require("../assets/newAssets/universalAssets/weatherIcons/broken-cloud.png"),
    "shower rain": require("../assets/newAssets/universalAssets/weatherIcons/rain.png"),
    "rain": require("../assets/newAssets/universalAssets/weatherIcons/rain.png"),
    "thunderstorm": require("../assets/newAssets/universalAssets/weatherIcons/storm.png"),
    "snow": require("../assets/newAssets/universalAssets/weatherIcons/snowy.png"),
    "mist": require("../assets/newAssets/universalAssets/weatherIcons/mist.png"),
    default: require("../assets/newAssets/universalAssets/weatherIcons/cloud (1).png"),
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require("../assets/newAssets/universalAssets/NewBackground.png")}
        style={styles.background}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={require("../assets/newAssets/universalAssets/LuminaLogoNew.png")}
            style={styles.logo}
          />
          <TouchableOpacity onPress={toggleSettingsBox}>
            <Image
              source={require("../assets/newAssets/calendarAssets/calendarIcons/configuration-gear 1.png")}
              style={styles.settingsIcon}
            />
          </TouchableOpacity>
        </View>
        {/* Settings Container */}
        {isSettingsBoxVisible && (
          <View style={styles.settingsBox}>
            <Text style={styles.settingsBoxText}>Settings</Text>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content */}
        <SafeAreaView>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Weather Section */}
            <View style={styles.topInfoContainer}>
              <View style={styles.weatherCard}>
                <View style={styles.weatherLeft}>
                  <Text style={styles.weatherDescText}>
                    {weatherDescription
                      ? capitalizeDescription(weatherDescription)
                      : "..."}
                  </Text>
                  <Image
                    source={
                      weatherIcons[weatherDescription.toLowerCase()] ||
                      weatherIcons["default"]
                    }
                    style={styles.weatherIcon}
                  />
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.weatherRight}>
                  <Text style={styles.cityText}>
                    Richardson, {stateString || "..."}
                  </Text>
                  <Text style={styles.dayText}>{currentDay}</Text>
                  <Text style={styles.weatherText}>
                    {temperature ? `${temperature}°F` : "..."}
                  </Text>
                </View>
              </View>

              {/* Moon Phase Section */}
              <View style={styles.moonRowContainer}>
                <View style={styles.moonLeftBox}>
                  <Text style={styles.moonPhaseText}>
                    {moonPhase || "..."}
                  </Text>
                  <Image
                    source={{ uri: moonPhaseImages[moonPhase] }}
                    style={styles.moonImage}
                  />
                </View>
                <View style={styles.moonRightBox}>
                  <View style={styles.detailRow}>
                    <Image
                      source={require("../assets/newAssets/universalAssets/weatherIcons/cloud.png")}
                      style={styles.iconStyle}
                    />
                    <Text style={styles.weatherDetailText}>
                      {cloudCoverage !== null
                        ? `Cloud Coverage: ${cloudCoverage}%`
                        : "..."}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Image
                      source={require("/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/weatherIcons/night (1).png")}
                      style={styles.iconStyle}
                    />
                    <Text style={styles.weatherDetailText}>
                      {moonrise ? `Moonrise: ${moonrise}` : "..."}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Image
                      source={require("../assets/newAssets/universalAssets/weatherIcons/sun.png")}
                      style={styles.iconStyle}
                    />
                    <Text style={styles.weatherDetailText}>
                      {sunset ? `Sunset: ${sunset}` : "..."}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Image
                      source={require("../assets/newAssets/universalAssets/weatherIcons/wind.png")}
                      style={styles.iconStyle}
                    />
                    <Text style={styles.weatherDetailText}>
                      {windSpeed !== null ? `Wind: ${windSpeed} mph` : "..."}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Planning Button */}
                <View style={[styles.planningButtonContainer, {marginTop: 40}]}>
                  <TouchableOpacity
                    style={styles.planningButton}
                    onPress={() => navigation.navigate("calendarScreen")}
                  >
                    <Image
                      source={require("/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/button-image.png")}
                      style={styles.planningImage}
                    />
                  </TouchableOpacity>
                </View>

              {/* News Section */}
              <View style={styles.newsContainer}>
                <Text style={styles.sectionTitle}>News</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {news.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.newsItem}
                        onPress={() => Linking.openURL(item.url)}
                      >
                        <Image
                          source={{ uri: item.urlToImage }}
                          style={styles.newsImage}
                        />
                        <View style={styles.newsTextContainer}>
                          <Text style={styles.newsTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.newsDesc} numberOfLines={3}>
                            {item.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    background: {
      flex: 1,
      resizeMode: "cover",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.4)", 
    },
  
    // Header styles
    header: {
      position: "absolute",
      top: 40,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 5,
    },
    logo: {
      width: 140,
      height: 60,
      opacity: 0.3,
      resizeMode: "contain",
    },
    settingsIcon: {
      width: 25,
      height: 25,
      resizeMode: "contain",
      zIndex: 10,
    },
    settingsBox: {
      position: "absolute",
      top: 100,
      right: 20,
      backgroundColor: "#000",
      padding: 20,
      borderRadius: 10,
      width: 200,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      zIndex: 10,
    },
    settingsBoxText: {
      fontSize: 18,
      color: "#fff",
      marginBottom: 10,
      fontWeight: "800",
    },
    signOutButton: {
      marginTop: 10,
      backgroundColor: "#BA91F9",
      padding: 20,
      borderRadius: 5,
      alignItems: "center",
      paddingHorizontal: 40,
    },
    signOutButtonText: {
      color: "#000",
      fontWeight: "bold",
    },
    contentText: {
      marginTop: 200,
      fontSize: 16,
      color: "#333",
      padding: 10,
      },
  
    // Top information container styles
    topInfoContainer: {
      width: "90%",
      marginTop: 90,
      justifyContent: "center",
      alignItems: "center", 
    },
    weatherCard: {
      flexDirection: "row", 
      alignItems: "center",
      justifyContent: "space-between", 
      padding: 15,
      backgroundColor: "rgba(0,0,0,0.4)",
      borderRadius: 12,
      marginTop: -30,
      width: "105%", 
      marginLeft: 40,
      height: 135,
    },
    weatherLeft: {
      alignItems: "center", 
      justifyContent: "center",
      marginLeft: 30,
    },
    weatherDescText: {
      fontSize: 14,
      color: "#fff",
      marginBottom: 5, 
    },
    weatherIcon: {
      width: 70, 
      height: 70,
      resizeMode: "contain",
      marginTop: 5,
    },
    weatherRight: {
      flex: 1,
      alignItems: "left", 
      justifyContent: "left",
      marginLeft: 50,
    },
    weatherText: {
      fontSize: 40,
      color: "#fff",
      fontWeight: "bold",
      marginTop: 10,
    },
    cityText: {
      fontSize: 20,
      color: "#fff",
      marginTop: 5,
      marginBottom: 20,
    },  
    moonImage: {
      width: 70,
      height: 80,
      resizeMode: "contain",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 5,
    },
    moonPhaseText: {
      fontSize: 14,
      color: "#fff",
      marginTop: 5,
      marginBottom: 5,
    },
    weatherDetailText: {
      fontSize: 13,
      color: "#B5B5B5",
      marginTop: 5,
      marginBottom: 5,
      marginLeft: 40,
      fontFamily: "Nunito",
    },
    moonRowContainer: {
      flexDirection: "row",
      width: "90%",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 30, 
      marginRight: 10,
    },
    moonLeftBox: {
      backgroundColor: "rgba(0,0,0,0.4)", 
      borderRadius: 12,
      alignItems: "center",
      padding: 10,
      marginRight: 20, 
      height: 130, 
      width: "45%",
    },
    moonRightBox: {
      backgroundColor: "rgba(0,0,0,0.4)", 
      borderRadius: 12,
      padding: 10, 
      alignItems: "flex-start", 
      height: 130, 
      width: "65%",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 0, 
    },
    iconStyle: {
      width: 19,
      height: 19,
      marginRight: -25, 
      marginLeft: 20,
      resizeMode: "contain", 
    },
    dayText: {
      fontSize: 14,
      color: "#fff",
      marginTop: -16,
      fontWeight: "300",
    },
    verticalLine: {
      width: 1,               
      height: "100%",        
      backgroundColor: "rgba(255, 255, 255, 0.2)", 
      marginHorizontal: 10,    
      marginLeft: 40,
    },  
  
    // Planning button styles
    planningButtonContainer: {
      alignItems: "center",
      marginVertical: 20,
      marginLeft: 40,
    },
    planningButton: {
      backgroundColor: "#BA91F9",
      paddingVertical: 25,
      paddingHorizontal: 25,
      borderRadius: 15,
      alignItems: "center",
      opacity: 0.8,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    planningImage: {
      width: 310,
      height: 100,
      resizeMode: "contain",
      alignSelf: "center",
    },
    // News section styles
    sectionTitle: {
      fontSize: 23,
      color: "#fff",
      fontWeight: "semi-bold",
      marginBottom: 10,
      fontFamily: "Nunito-Bold",
    },
    newsContainer: {
      width: "140%",
      marginTop: 10,
      marginLeft: 170,
    },
    newsItem: {
      flexDirection: "row",
      width: 360, 
      backgroundColor: "rgba(10, 10, 10, 0.5)",
      padding: 25,
      borderRadius: 10,
      marginRight: 10,
    },
    newsImage: {
      width: 80, 
      height: 80,
      borderRadius: 5,
      marginRight: 10, 
    },
    newsTextContainer: {
      flex: 1, 
      justifyContent: "center",
    },
    newsTitle: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
    newsDesc: {
      color: "#aaa",
      fontSize: 14,
      marginTop: 7,
    },
    settingsBox: {
      position: "absolute",
      top: 80,
      right: 40,
      backgroundColor: "rgba(0,0,0,0.9)",
      padding: 40,
      borderRadius: 10,
      shadowColor: "#fff",
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.2,
      shadowRadius: 9,
      zIndex: 20,
    },
    settingsBoxText: {
      fontSize: 19,
      color: "#fff",
      marginBottom: 10,
    },
  });