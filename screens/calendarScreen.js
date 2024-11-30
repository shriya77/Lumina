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
  accessKeyId: "AKIA3CMCCMY6G2LNLUMH",
  secretAccessKey: "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",
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

//   return (
//     <ImageBackground source={require('/Users/thebenzsecrets/lumina4.0/assets/calendarScreenImages/calendarScreenBackground3.jpg')} style={styles.container}>
//     <View style={styles.calendarContainer}>
//       {/* Header for the current month and navigation */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handlePrevMonth}>
//           <Text style={[styles.navButton, {marginLeft: 20}]}>{"<"}</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerText}>{`${currentMonth} ${currentYear}`}</Text>
//         <TouchableOpacity onPress={handleNextMonth}>
//           <Text style={[styles.navButton, {marginRight: 20}]}>{">"}</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Weekday labels */}
//       <View style={styles.weekdayLabels}>
//         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
//           <Text key={index} style={styles.weekdayLabel}>{day}</Text>
//         ))}
//       </View>

//       <View style={{height: 2, width: '100%', backgroundColor: '#7379AE'}}/>

//       {/* Days grid */}
//       <View style={styles.daysGrid}>
//   {daysInMonth.map((day, index) => {
//     //const dayString = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//     const dayString = `${String(day).padStart(2, '0')}`;

//     // Retrieve events for the specific day from sEvents
//     const events = sEvents[dayString] || { social: [], celestial: [] };
//     //console.log(events);
    
//     const socialEvents = Array.isArray(events.social?.socialEvents) ? events.social.socialEvents : [];
//     const celestialEvents = Array.isArray(events.celestial?.celestialEvents) ? events.celestial.celestialEvents : [];
    

//     return (
//       <View key={index} style={index % 7 === 6 ? styles.endBox : styles.dayBox}>
//         {index >= setBack ? (
//           <TouchableWithoutFeedback
//             onPress={() => navigation.navigate('weeklyCalendarScreen', { year: currentYear, month: currentDate.getMonth(), dog: (day)})}
//           >
//             <View style={day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? styles.todayBox : styles.noBox}>
//               <Text style={day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? styles.today : styles.dayText}>
//                 {day}
//               </Text>

//               {/* Render social events under the day */}
//               {socialEvents.slice(0, 3).map((event, idx) => (
//                 <View key={`social-${idx}`} style={styles.socialBox}>
//                   <Text style={styles.eventText}>{event.eventTitle}</Text>
//                 </View>
//               ))}

//               {/* Display three dots if there are more than 3 social events */}
//               {socialEvents.length > 3 && (
//                   <Text style={{color: 'white'}}>...</Text>
//               )}

//               {/* Render celestial events under the day */}
//               {socialEvents.length < 3 && (
//                 celestialEvents.map((event, idx) => (
//                   <View key={`celestial-${idx}`} style={styles.solarBox}>
//                     <Text style={styles.eventText}>{event.title}</Text>
//                   </View>
//                 ))
//               )}

//             </View>
//           </TouchableWithoutFeedback>
//         ) : (
//           <View style={styles.noBox}>
//             <Text style={{ color: 'transparent' }}>{day}</Text>
//           </View>
//         )}
//       </View>
//     );
//   })}
// </View>

//     </View>
//     </ImageBackground>
//   )



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


// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, TouchableWithoutFeedback} from 'react-native';
// import MonthlyData from "/Users/thebenzsecrets/lumina4.0/features/calendarScreenFeatures/month1/monthlyData.json";
// import { useNavigation } from '@react-navigation/native';
// import AWS from "aws-sdk";

// AWS.config.update({
//   region: "us-east-2",
//   accessKeyId: "AKIA3CMCCMY6G2LNLUMH",
//   secretAccessKey: "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",
// });

// const docClient = new AWS.DynamoDB.DocumentClient();

// const screenWidth = Dimensions.get('window').width;
// const dayWidth = screenWidth / 7;

// const CustomCalendar = () => {
//   const navigation = useNavigation();
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [daysInMonth, setDaysInMonth] = useState([]);
//   const [dataDaysInMonth, setDataDaysInMonth] = useState([]);
//   const [sEvents, setSEvents] = useState([]);
//   const [cEvents, setCEvents] = useState([]);

//   //RETRIEVING DATA
//   const generateDaysInMonth = async () => {
//     const daysArray = [];
//     const d = new Date();
//     const month = d.getMonth()+1;
//     const year = d.getFullYear();
//     const numDaysInMonth = new Date(year, month + 1, 0).getDate();

//     const allSocialEvents = [];
//     const allCelestialEvents = [];

//     // Generate all days of the month
//     for (let i = 1; i <= numDaysInMonth; i++) {
//       const currentDate = new Date(year, month, i);
//       const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
//         .toString()
//         .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

//       daysArray.push(formattedDate);
      
//       // Retrieve events for each day and add to allSocialEvents
//       const socialEvents = await fetchSocialEvents(formattedDate);
//       const celestialEvents = await fetchCelestialEvents(formattedDate);
//       allSocialEvents.push(...socialEvents);
//       allCelestialEvents.push(...celestialEvents);
//       // console.log("Right:", JSON.stringify(celestialEvents.Items, null, 2));
//     }

//     setDataDaysInMonth(daysArray);
//     setSEvents(allSocialEvents); // Set all collected social events for the month
//     console.log("All Social Events:", allSocialEvents);
//     setCEvents(allCelestialEvents);
//     console.log("Celestial Events:", allCelestialEvents);
//   };

//   const fetchSocialEvents = (day) => {
//     const params = {
//       TableName: 'CelestialData',
//       FilterExpression: '#date = :date',
//       ExpressionAttributeNames: {
//         '#date': 'date'
//       },
//       ExpressionAttributeValues: {
//         ':date': day
//       }
//     };

//     return new Promise((resolve, reject) => {
//       console.log("Fetching social events for date:", day);
//       docClient.scan(params, function (err, data) {
//         if (err) {
//           console.log("Error fetching data:", err);
//           reject(err);
//         } else {
//           console.log("Query succeeded:", JSON.stringify(data, null, 2));
  
//           // Combine social events from all items
//           const socialEvents = data.Items.flatMap(item => {
//             console.log("Inspecting item:", JSON.stringify(item, null, 2));
//             return item.eventType?.social || []; // Use optional chaining to safely access celestial events
//           });
  
//           if (socialEvents.length === 0) {
//             console.log("No social events found for this date.");
//           } else {
//             console.log("Social Events:", socialEvents);
//           }
  
//           resolve(socialEvents);
//         }
//       });
//     });
//   };

//   const fetchCelestialEvents = (day) => {
//     const params = {
//       TableName: 'CelestialData',
//       FilterExpression: '#date = :date',
//       ExpressionAttributeNames: {
//         '#date': 'date'
//       },
//       ExpressionAttributeValues: {
//         ':date': day
//       }
//     };
  
//     return new Promise((resolve, reject) => {
//       console.log("Fetching celestial events for date:", day);
//       docClient.scan(params, function (err, data) {
//         if (err) {
//           console.log("Error fetching data:", err);
//           reject(err);
//         } else {
//           console.log("Query succeeded:", JSON.stringify(data, null, 2));
  
//           // Combine celestial events from all items
//           const celestialEvents = data.Items.flatMap(item => {
//             console.log("Inspecting item:", JSON.stringify(item, null, 2));
//             return item.eventType?.celestial || []; // Use optional chaining to safely access celestial events
//           });
  
//           if (celestialEvents.length === 0) {
//             console.log("No celestial events found for this date.");
//           } else {
//             console.log("Celestial Events:", celestialEvents);
//           }
  
//           resolve(celestialEvents);
//         }
//       });
//     });
//   };
  

//   useEffect(() => {
//     console.log("WORKSSSS");
//     generateDaysInMonth();
//   }, []);


//   // Helper function to get the number of days in a month
//   const getDaysInMonth = (month, year) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   // Helper function to get the first day of the month (0 = Sunday, 1 = Monday, etc.)
//   const getFirstDayOfMonth = (month, year) => {
//     return new Date(year, month, 1).getDay();
//   };

//   // Update the calendar when the current date changes
//   useEffect(() => {
//     //BEFORE
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();

//     const totalDays = getDaysInMonth(month, year);
//     const firstDay = getFirstDayOfMonth(month, year);

//     const daysArray = [];
    
//     // Fill in the blanks for the days before the first day of the month
//     for (let i = 0; i < firstDay; i++) {
//       daysArray.push("");
//     }

//     // Fill in the days of the current month
//     for (let day = 1; day <= totalDays; day++) {
//       daysArray.push(day);
//     }

//     setDaysInMonth(daysArray);
//   }, [currentDate]);

//   // Get events for a specific day
//   const getEventsForDay = (day) => {
//     const currentDate = new Date(); // Today's date
//     const year = currentDate.getFullYear();
//     const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Current month
  
//     const dateKey = `${year}-${month}-${String(day).padStart(2, '0')}`;
  
//     const socialEventsForDay = sEvents.filter(event => event.date === dateKey);
//     const celestialEventsForDay = cEvents.filter(event => event.date === dateKey);
  
//     return { socialEvents: socialEventsForDay, celestialEvents: celestialEventsForDay };
//   };
  

//   // Go to the previous month
//   const handlePrevMonth = () => {
//     const prevMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
//     setCurrentDate(prevMonthDate);
//   };

//   // Go to the next month
//   const handleNextMonth = () => {
//     const nextMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
//     setCurrentDate(nextMonthDate);
//   };

//   // Format the month and year for the header
//   const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   const currentMonth = monthNames[currentDate.getMonth()];
//   const currentYear = currentDate.getFullYear();

//   //function to get color for type of event
//   const getEventColor = (event) => {
//       switch(event.type) {
//         case 'celestial':
//           return styles.solarBox;
//         default:
//           return styles.socialBox;
//     };    
//   };

//   return (
//     <ImageBackground source={require('/Users/thebenzsecrets/lumina4.0/assets/calendarScreenImages/calendarScreenBackground3.jpg')} style={styles.container}>
//     <View style={styles.calendarContainer}>
//       {/* Header for the current month and navigation */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handlePrevMonth}>
//           <Text style={[styles.navButton, {marginLeft: 20}]}>{"<"}</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerText}>{`${currentMonth} ${currentYear}`}</Text>
//         <TouchableOpacity onPress={handleNextMonth}>
//           <Text style={[styles.navButton, {marginRight: 20}]}>{">"}</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Weekday labels */}
//       <View style={styles.weekdayLabels}>
//         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
//           <Text key={index} style={styles.weekdayLabel}>{day}</Text>
//         ))}
//       </View>

//       <View style={{height: 2, width: '100%', backgroundColor: '#7379AE'}}/>

//       {/* Days grid */}
//       <View style={styles.daysGrid}>
//     {daysInMonth.map((day, index) => {
//         // const eventsForDay = getEventsForDay(day); // Get both social and celestial events for the day
//         return (
//             <View key={index} style={index % 7 === 6 ? styles.endBox : styles.dayBox}>
//                 <TouchableWithoutFeedback onPress={() => navigation.navigate('weeklyCalendarScreen', { year: currentYear, month: currentDate.getMonth(), dog: index - 1 })}>
//                     <View style={day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? styles.todayBox : styles.noBox}>
//                         <Text style={day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? styles.today : styles.dayText}>
//                             {day}
//                         </Text>
//                         {console.log(index)}
//                     </View>
//                 </TouchableWithoutFeedback>

//                 {/* Render social events under the day */}
//                 {/* {sEvents.map(event => (
//                     <View style={{backgroundColor: 'red'}} key={event.date}>
//                         <Text style={styles.eventText}>{event.date}</Text>
//                     </View>
//                 ))} */}

//                 {/* Render celestial events under the day */}
//                 {/* {cEvents.map(event => (
//                     <View style={{backgroundColor: 'blue'}} key={event.date}>
//                         <Text style={styles.eventText}>{event.eventTitle}</Text>
//                     </View>
//                 ))} */}
//             </View>
//         );
//     })}
// </View>
//     </View>
//     </ImageBackground>
//   );
// };



// // Basic styles for the calendar
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   calendarContainer: {
//     top: 80,
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   navButton: {
//     fontSize: 20,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   headerText: {
//       fontWeight: '700',
//       fontSize: 27,
//       color: '#fff',
//       textTransform: 'capitalize',
//   },
//   weekdayLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 5,
//   },
//   weekdayLabel: {
//     width: 40,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   daysGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     // rowGap: 75,
//     // columnGap: 10,
//   },
//   dayBox: {
//     width:dayWidth,
//     height: 130,
//     borderColor: '#7379AE',
//     borderWidth: 1,
//     alignItems: 'center',
//     borderTopWidth: 0,
//     borderLeftWidth: 0,
//   },
//   endBox: {
//     width:dayWidth,
//     height: 130,
//     borderColor: '#7379AE',
//     borderWidth: 1,
//     alignItems: 'center',
//     borderTopWidth: 0,
//     borderLeftWidth: 0,
//     borderRightWidth: 0,
//   },
//   dayText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: 'white',
//   },
//   today: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center',
//     top: 2,
//   },
//   todayBox: {
//     height: 25,
//     width: 25,
//     position: 'absolute',
//     backgroundColor: '#BA91F9',
//     marginTop: 8,
//     borderRadius: 20,
//   },
//   eventText: {
//     fontSize: 10,
//     color: 'white',
//   },
//   solarBox: {
//     height: 14, width: dayWidth-3, backgroundColor: '#B98A13', marginBottom: 5
//   },
//   lunarBox: {
//     height: 14, width: dayWidth-3, backgroundColor: '#807BE4', marginBottom: 5
//   },
//   stargazingBox: {
//     height: 14, width: dayWidth-3, backgroundColor: '#2F43E4', marginBottom: 5
//   },
//   socialBox: {
//     height: 14, width: dayWidth-3, backgroundColor: '#BA91F9', marginBottom: 5
//   }
// });

// export default CustomCalendar;


// export default class CalendarScreen extends React.Component {
//     render() {
//         console.log(currentDate.getDaysInMonth);
//         return (
//           <ImageBackground source={require('/Users/thebenzsecrets/lumina4.0/assets/calendarScreenImages/calendarScreenBackground3.jpg')} style={styles.container}>
//             <Text style={{color: 'white', left: 20, top: 70, fontSize: 27, fontWeight: '700',}}>{monthName}</Text>
//             <View style={{position: 'absolute', height: phoneHeight, width: phoneWidth}}>
//               <View style={{top: 160, flexDirection: 'column', gap: 102.5, position: 'absolute'}}>
//                 <View style={{height: 2, width: phoneWidth, backgroundColor: '#7379AE'}}/>
//                 <View style={{height: 2, width: phoneWidth, backgroundColor: '#7379AE'}}/>
//                 <View style={{height: 2, width: phoneWidth, backgroundColor: '#7379AE'}}/>
//                 <View style={{height: 2, width: phoneWidth, backgroundColor: '#7379AE'}}/>
//                 <View style={{height: 2, width: phoneWidth, backgroundColor: '#7379AE'}}/>
//                 <View style={{height: 2, width: phoneWidth, backgroundColor: '#7379AE'}}/>
//               </View>
//               <View style={{top: 160, gap: 56.1428571429, flexDirection: 'row' }}>
//                 <View style={[styles.line, {marginLeft: 56.1428571429}]}/>
//                 <View style={styles.line}/>
//                 <View style={styles.line}/>
//                 <View style={styles.line}/>
//                 <View style={styles.line}/>
//                 <View style={styles.line}/>
//               </View>

//               {/* <Text style={styles.textStyle}>{getNumDaysInMonth(currentMonth, currentYear)}</Text> */}
//             </View>
//             <View style={{ top: 85,flexDirection: 'row', justifyContent: 'center', gap: 29.0}}>
//                 <Text style={styles.subTitle}>SU</Text>
//                 <Text style={styles.subTitle}>MO</Text>
//                 <Text style={styles.subTitle}>TU</Text>
//                 <Text style={styles.subTitle}>WE</Text>
//                 <Text style={styles.subTitle}>TH</Text>
//                 <Text style={styles.subTitle}>FR</Text>
//                 <Text style={styles.subTitle}>SA</Text>
//             </View>
            
//             <View style={{ flexDirection: 'column', justifyContent: 'center', gap: 72, position: 'absolute', top: 80}}>
//               <View style={{ top: 85,flexDirection: 'row', justifyContent: 'center', gap: 29.0}}>
//                 <Text style={styles.datesText}>SU</Text>
//                 <Text style={styles.datesText}>MO</Text>
//                 <Text style={styles.datesText}>TU</Text>
//                 <Text style={styles.datesText}>WE</Text>
//                 <Text style={styles.datesText}>TH</Text>
//                 <Text style={styles.datesText}>FR</Text>
//                 <Text style={styles.datesText}>SA</Text>
//               </View>

//               <View style={{ top: 85,flexDirection: 'row', justifyContent: 'center', gap: 29.0}}>
//                 <Text style={styles.datesText}>SU</Text>
//                 <Text style={styles.datesText}>MO</Text>
//                 <Text style={styles.datesText}>TU</Text>
//                 <Text style={styles.datesText}>WE</Text>
//                 <Text style={styles.datesText}>TH</Text>
//                 <Text style={styles.datesText}>FR</Text>
//                 <Text style={styles.datesText}>SA</Text>
//               </View>

//               <View style={{ top: 85,flexDirection: 'row', justifyContent: 'center', gap: 29.0}}>
//                 <Text style={styles.datesText}>SU</Text>
//                 <Text style={styles.datesText}>MO</Text>
//                 <Text style={styles.datesText}>TU</Text>
//                 <Text style={styles.datesText}>WE</Text>
//                 <Text style={styles.datesText}>TH</Text>
//                 <Text style={styles.datesText}>FR</Text>
//                 <Text style={styles.datesText}>SA</Text>
//               </View>

//               <View style={{ top: 85,flexDirection: 'row', justifyContent: 'center', gap: 29.0}}>
//                 <Text style={styles.datesText}>SU</Text>
//                 <Text style={styles.datesText}>MO</Text>
//                 <Text style={styles.datesText}>TU</Text>
//                 <Text style={styles.datesText}>WE</Text>
//                 <Text style={styles.datesText}>TH</Text>
//                 <Text style={styles.datesText}>FR</Text>
//                 <Text style={styles.datesText}>SA</Text>
//               </View>

//               <View style={{ top: 85,flexDirection: 'row', justifyContent: 'center', gap: 29.0}}>
//                 <Text style={styles.datesText}>SU</Text>
//                 <Text style={styles.datesText}>MO</Text>
//                 <Text style={styles.datesText}>TU</Text>
//                 <Text style={styles.datesText}>WE</Text>
//                 <Text style={styles.datesText}>TH</Text>
//                 <Text style={styles.datesText}>FR</Text>
//                 <Text style={styles.datesText}>SA</Text>
//               </View>

//               <View style={{ top: 85,flexDirection: 'row', justifyContent: 'center', gap: 29.0}}>
//                 <Text style={styles.datesText}>SU</Text>
//                 <Text style={styles.datesText}>MO</Text>
//                 <Text style={styles.datesText}>TU</Text>
//                 <Text style={styles.datesText}>WE</Text>
//                 <Text style={styles.datesText}>TH</Text>
//                 <Text style={styles.datesText}>FR</Text>
//                 <Text style={styles.datesText}>SA</Text>
//               </View>

//               <View style={{ top: 85,flexDirection: 'row', justifyContent: 'center', gap: 29.0}}>
//                 <Text style={styles.datesText}>SU</Text>
//                 <Text style={styles.datesText}>MO</Text>
//                 <Text style={styles.datesText}>TU</Text>
//                 <Text style={styles.datesText}>WE</Text>
//                 <Text style={styles.datesText}>TH</Text>
//                 <Text style={styles.datesText}>FR</Text>
//                 <Text style={styles.datesText}>SA</Text>
//               </View>
//             </View>
            
//           </ImageBackground>

//         )
//     }
// }

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       flexShrink: 1,
//     },
//     textStyle: {
//       position: 'absolute',
//       fontWeight: 'bold',
//       fontSize: 18,
//       padding: 10,
//       color: '#fff',
//     },
//     line: {
//       height: 700,
//       width: 2,
//       backgroundColor: '#7379AE',
//     },
//     subTitle: {
//       fontSize: 20,
//       fontWeight: '700',
//       color: 'white',
//       marginTop: 10,
//     },
//     datesText: {
//       fontSize: 15,
//       fontWeight: '500',
//       color: 'white',
//       marginTop: 10,
//     }
// });