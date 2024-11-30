import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, TouchableWithoutFeedback, Image, ScrollView} from 'react-native';
import MonthlyData from "/Users/thebenzsecrets/lumina4.0/features/calendarScreenFeatures/month1/monthlyData.json";
import { useNavigation } from '@react-navigation/native';
import AWS from "aws-sdk";
import NewCalendar from '../assets/newAssets/calendarAssets/NewCalendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarEventCarousel from '../features/calendarScreenFeatures/carousels/calendarEventCarousel';
import CalendarEventCarouselTwo from '../features/calendarScreenFeatures/carousels/calendarEventCarousalTwo';
import { SafeAreaView } from 'react-native-safe-area-context';
//import * as Location from 'expo-location';

const access_key_id = process.env.AWS_ACCESS_KEY_ID;
const secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;

//in request body, specify query opperation
AWS.config.update({
  region: "us-east-2",
  accessKeyId: "-",
  secretAccessKey: "-",
  dynamoDbCrc32: false,
});


const docClient = new AWS.DynamoDB.DocumentClient();

const screenWidth = Dimensions.get('window').width;
const dayWidth = screenWidth / 7;

const CalendarScreen = () => {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null);
  // const navigation = useNavigation();
  const [sEvents, setSEvents] = useState([]);
  const [cEvents, setCEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [recEvents, setRecEvents] = useState([]);

  //weather stuff
  const [temperature, setTemperature] = useState(null);
  const [weatherDescription, setWeatherDescription] = useState("");
  const [moonPhase, setMoonPhase] = useState("");
  const [news, setNews] = useState([]);
  const [stateString, setStateString] = useState("");
  const [city, setCity] = useState("");
  const [cloudCoverage, setCloudCoverage] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [currentDay, setCurrentDay] = useState("");

  useEffect(() => {
    fetchRecommendedEvents();
    handleDateSelect();
  },[])

  useEffect(() => {
    console.log('Cloud Coverage updated:', cloudCoverage);
    console.log('Wind updated', windSpeed);
    console.log('Temperature updated: ', temperature);
  }, [cloudCoverage, windSpeed, temperature]);

  const saveDateToStorage = async (date) => {
    try {
      await AsyncStorage.setItem('selectedDate', date);
      console.log('Date saved successfully:', date);
    } catch (error) {
      console.error('Failed to save the date:', error);
    }
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date); // Update state
    console.log('This is the selected day: ', date);

    const yearMonth = date.split('-').slice(0, 2).join('-');
    const dayOnly = date.split('-')[2];

    const monthYearData = await fetchMonthYearData(yearMonth);
    const socialData = await fetchSocialEventsForDay(monthYearData, dayOnly);
    const celestialData = await fetchCelestialEventsForDay(monthYearData, dayOnly)
    const weatherData = await fetchWeather("Dallas", date);

    setSEvents(socialData.socialEvents);
    setCEvents(celestialData.celestialEvents);
    setTemperature(Math.floor(weatherData.body?.temperature.max) || "N/A");
    setWindSpeed(Math.floor(weatherData.body?.wind.max.speed) || "N/A");
    setCloudCoverage(Math.floor(weatherData.body?.cloud_cover.afternoon) || "0");

    saveDateToStorage(date); // Persist to AsyncStorage
  };

  useEffect(() => {
    console.log("Selected date changed:", selectedDate);
    if (selectedDate) {
      fetchWeather("Dallas", selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const loadSavedDate = async () => {
      try {
        const savedDate = await AsyncStorage.getItem('selectedDate');
        if (savedDate) {
          setSelectedDate(savedDate);
          
          // setCEvents(celestialData._j.celestialEvents);
        }
      } catch (error) {
        console.error('Failed to load the saved date:', error);
      }
    };
    loadSavedDate();
  });

  async function fetchRecommendedEvents() {
    // Number of days in the month we want data from
    let numDays = 30; // Update this dynamically as needed
    const yearMonth = "2024-11"; // Example: "2024-11"

  // Array of days formatted with leading zeros for query
    const days = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];

  // Array to store recommended events
    const recommendedEvents = [];

    const eventData = await fetchMonthYearData(yearMonth);

    // Construct weather API URL for this date
    const weatherData = await fetchWeather("Dallas", "2024-11-20");

    for(let i = 0; i <= numDays; i++) {
      const curDay = days[i];
      const celestialDayData = await fetchCelestialEventsForDay(eventData, curDay);

    }

    // Check weather conditions and recommend events
    if (weatherData.cloud_cover.afternoon <= 20) {
      // If the weather is clear, recommend celestial events
      if (eventData.celestial && eventData.celestial.length > 0) {
        recommendedEvents.push(newDate);
      }
    } else {
      // Recommend social events based on state
      // for (const event of eventData.social) {
      //   if (event.state === stateName) {
      //     recommendedEvents.push(newDate);
      //     break;
      //   }
      // }
    }
}
  

  async function fetchWeather(cityName, dateOfRetrieval) {
    const weatherUrl = `https://fi4o4iz0e2.execute-api.us-east-2.amazonaws.com/dev/aggregateWeather?cityName=${cityName}&date=${dateOfRetrieval}`;
    console.log("Fetching weather from URL:", weatherUrl);
    try {
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        console.error(`Weather API returned error: ${response.status}`);
        return;
      }
      const weatherData = await response.json();
      console.log("Weather data received:", weatherData);
  
      // Update state
      setTemperature(Math.floor(weatherData.body?.temperature.max) || "N/A");
      setWindSpeed(Math.floor(weatherData.body?.wind.max.speed) || "N/A");
      setCloudCoverage(Math.floor(weatherData.body?.cloud_cover.afternoon) || "0");

      return(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  const  fetchMonthYearData = async (monthYear) => {
    const params = {
      TableName: 'CelestialData3',
      KeyConditionExpression: '#yearMonth = :yearMonth',
      ExpressionAttributeNames: {
        '#yearMonth': 'yearMonth',
        // '#day': 'day'
      },
      ExpressionAttributeValues: {
        ':yearMonth': monthYear,
        // ':day' : "01"
      }
    };

    try {
      const data = await docClient.query(params).promise(); // Wait for the Promise to resolve
      return data.Items; // Return the resolved data
      console.log(data.Items);
    } catch (error) {
      throw error;
    }
  }

  const fetchSocialEventsForDay = (monthData, targetDay) => {
    return new Promise((resolve, reject) => {
      const dayEvent = monthData.find(item => item.day === targetDay);
      
      if (dayEvent) {
        const result = {
          day: dayEvent.day,
          socialEvents: dayEvent.eventType.social,
          yearMonth: dayEvent.yearMonth
        };
        resolve(result);
      } else {
        // console.log(`No events found for day ${targetDay}`);
        resolve(null); // or reject with an error if preferred
      }
    });
  };
  
  const fetchCelestialEventsForDay = (monthData, targetDay) => {
    return new Promise((resolve, reject) => {
      const dayEvent = monthData.find(item => item.day === targetDay);
      
      if (dayEvent) {
        const result = {
          day: dayEvent.day,
          celestialEvents: dayEvent.eventType.celestial,
          yearMonth: dayEvent.yearMonth
        };
        resolve(result);
      } else {
        // console.log(`No events found for day ${targetDay}`);
        resolve(null); // or reject with an error if preferred
      }
    });
  };

  return(
    <ImageBackground source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/NewBackground.png')} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{top: 30, height: 70, flexDirection: 'row', marginVertical: 20, marginHorizontal: 20}}>
        <Image style={{resizeMode: 'contain', height: '100%', width: '40%', opacity: 0.5}} source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/LuminaLogoNew.png')}/>
        <Image style={{alignSelf: 'center',left: '190%', height: '30%', width: '30%', resizeMode: 'contain'}}source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/calendarAssets/calendarIcons/configuration-gear 1.png')}/>
      </View>

      <NewCalendar onDateSelect={handleDateSelect} recommendedDates={['2024-11-23', '2024-11-25', '2024-11-20']}/>

      <View style={newStyle.widgets}>
        <View style={newStyle.cloudCoverageBar}>
          <Image style={{height: 20, width: 20}}source={require('../assets/weatherIcons/cloudy.png')}/>
          <Text style={{color: 'white', fontSize: 13, fontWeight: '600'}}>Cloud Coverage: {cloudCoverage}%</Text>
        </View>
        <View style={newStyle.windBar}>
        <Image style={{height: 20, width: 20}} source={require('../assets/newAssets/universalAssets/weatherIcons/wind.png')}/>
          <Text style={{color: 'white', fontSize: 13, fontWeight: '600'}}>Wind: {windSpeed} MPH</Text>
        </View>
        <View style={newStyle.temperatureBar}>
          <Image style={{height: 20, width: 20}}  source={require('../assets/newAssets/calendarAssets/calendarIcons/warm.png')}/>
          <Text style={{color: 'white', fontSize: 13, fontWeight: '600'}}>{temperature}</Text>
        </View>
      </View>

      <View style={[newStyle.EventsHeadline]}>
        <Text style={newStyle.eventsHeadlineText}>Events</Text>
      </View>
      
      <View>
      <CalendarEventCarousel 
        items={sEvents || []}
      />
      </View>
      
      <View style={{top: 30}}>
      <CalendarEventCarouselTwo
        items={cEvents || []}
      />
      </View>
      
      </ScrollView>
    </ImageBackground>
  )
};


const newStyle = StyleSheet.create({
  header: {
    top: '10%',
    height: '10%',
    flexDirection: 'row',
  },
  widgets: {
    height: 37.5,
    width: '100%',
    flexDirection: 'row',
    alignContent: 'center',
    marginVertical: 20,
  },
  cloudCoverageBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 37.5,
    width: '45%',
    borderRadius: 20,
    marginHorizontal: 2,
    marginLeft: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  windBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 37.5,
    width: '30%',
    borderRadius: 20,
    marginHorizontal: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  temperatureBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 37.5,
    width: '15%',
    borderRadius: 20,
    marginHorizontal: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  EventsHeadline: {
    height: 20,
    marginBottom: 20,
    width: '100%',
    marginHorizontal: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center'
  },
  eventsHeadlineText: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
  }
});

// Basic styles for the calendar
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    top: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerText: {
      fontWeight: '700',
      fontSize: 27,
      color: '#fff',
      textTransform: 'capitalize',
  },
  weekdayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // rowGap: 75,
    // columnGap: 10,
  },
  dayBox: {
    width:dayWidth,
    height: 130,
    borderColor: '#7379AE',
    borderWidth: 1,
    alignItems: 'center',
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  endBox: {
    width:dayWidth,
    height: 130,
    borderColor: '#7379AE',
    borderWidth: 1,
    alignItems: 'center',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  dayText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
  },
  today: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    top: 2,
  },
  todayBox: {
    height: 25,
    width: 25,
    position: 'absolute',
    backgroundColor: '#BA91F9',
    marginTop: 8,
    borderRadius: 20,
  },
  eventText: {
    fontSize: 10,
    color: 'white',
  },
  solarBox: {
    height: 14, width: dayWidth-3, backgroundColor: '#B98A13', marginBottom: 5
  },
  lunarBox: {
    height: 14, width: dayWidth-3, backgroundColor: '#807BE4', marginBottom: 5
  },
  stargazingBox: {
    height: 14, width: dayWidth-3, backgroundColor: '#2F43E4', marginBottom: 5
  },
  socialBox: {
    height: 14, width: dayWidth-3, backgroundColor: '#BA91F9', marginBottom: 5
  }
});

export default CalendarScreen;


