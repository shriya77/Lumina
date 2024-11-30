import React, { useState, useEffect } from 'react';
import { View, Text, Button,StyleSheet, TouchableOpacity, ImageBackground, Dimensions, ScrollView, Image} from 'react-native';
import MonthlyData from "/Users/thebenzsecrets/lumina4.0/features/calendarScreenFeatures/month1/monthlyData.json";
import { FlatList } from 'react-native-gesture-handler';
import CalendarEventCarousel from '../carousels/calendarEventCarousel';
import CalendarEventCarouselTwo from '../carousels/calendarEventCarousalTwo';
import AWS from "aws-sdk";
import { list } from 'aws-amplify/storage';

AWS.config.update({
  region: "us-east-2",
  accessKeyId: "AKIA3CMCCMY6G2LNLUMH",
  secretAccessKey: "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",
  dynamoDbCrc32: false,
});

const docClient = new AWS.DynamoDB.DocumentClient();

const screenHeight = Dimensions.get('window').height; //852
const screenWidth = Dimensions.get('window').width; //393
const dayWidth = screenWidth / 7;


const WeeklyCalendarScreen = ({route}) => {
    const {year, month, dog} = route.params;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentCloudPrec, setCloudPrec] = useState(0);
    const [currentMoonPhase, setMoonPhase]  = useState("Full Moon");
    const [currentIllumination, setIllumination] = useState(0);
    const [stringDate, setStringDate] = useState("");
    const [sEvents, setSEvents] = useState([]);
    const [temperature, setTemperature] = useState(0);
    const [StringDay, setStringDay] = useState("");
    const [weatherDescription, setWeatherDescription] = useState('');

    function getPhaseName(moonPhaseValue) {
        if (moonPhaseValue === 0 || moonPhaseValue === 1) return "New Moon";
        if (moonPhaseValue === 0.25) return "First Quarter";
        if (moonPhaseValue === 0.5) return "Full Moon";
        if (moonPhaseValue === 0.75) return "Last Quarter";
        if (moonPhaseValue > 0 && moonPhaseValue < 0.25) return "Waxing Crescent";
        if (moonPhaseValue > 0.25 && moonPhaseValue < 0.5) return "Waxing Gibbous";
        if (moonPhaseValue > 0.5 && moonPhaseValue < 0.75) return "Waning Gibbous";
        if (moonPhaseValue > 0.75 && moonPhaseValue < 1) return "Waning Crescent";
    }

    const moonPhaseImages = {
      'New Moon':
        'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/new_moon.png',
      'First Quarter':
        'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/first_quarter.png',
      'Full Moon':
        'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/full_moon.png',
      'Last Quarter':
        'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/last_quarter.png',
      'Waxing Crescent':
        'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/waxing_crescent.png',
      'Waxing Gibbous':
        'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/waxing_gibbous.png',
      'Waning Gibbous':
        'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/waning_gibbous.png',
      'Waning Crescent':
        'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/waning_crescent.png',
    };
  

    async function fetchWeather() {
        const url = "https://fi4o4iz0e2.execute-api.us-east-2.amazonaws.com/dev/calendarWeather?cityName=Dallas";
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
          const weatherData = await response.json();
          setTemperature(Math.round(weatherData.body.current.temp));
          setWeatherDescription(weatherData.body.current.weather[0].description);
          setMoonPhase(getPhaseName(weatherData.body.daily[0].moon_phase));
        } catch (error) {
          console.error(error.message);
        }
       }

    const generateDaysInMonth = async (strDate) => {   
        const eventsByDay = {};

        const dayString = `${String(dog).padStart(2, '0')}`;
        setStringDay(dayString);
        const monthEvents = await fetchMonthYearData(strDate);


        try {
            // console.log(strDate);
            const socialEvents = await fetchSocialEventsForDay(monthEvents, dayString);
            const celestialEvents = await fetchCelestialEventsForDay(monthEvents, dayString)
            //console.log(socialEvents);
            eventsByDay[dayString] = { 
                social: socialEvents != null && socialEvents.socialEvents.length > 0 ? socialEvents : [], 
                celestial: celestialEvents != null && celestialEvents.celestialEvents.length > 0 ? celestialEvents : [] 
              };
        } catch (error) {
            console.error(`Error fetching events for ${dayString}:`, error);
            // Proceed with an empty array if there was an error
            eventsByDay[strDate] = { social: [], celestial: [] };
        }
        
        setSEvents(eventsByDay);
      };
      
      const fetchSocialEventsForDay = (monthData, targetDay) => {
        return new Promise((resolve, reject) => {
          const dayEvent = monthData.Items.find(item => item.day === targetDay);
          
          if (dayEvent) {
            const result = {
              day: dayEvent.day,
              socialEvents: dayEvent.eventType.social,
              yearMonth: dayEvent.yearMonth
            };
            resolve(result);
          } else {
            resolve(null); // or reject with an error if preferred
          }
        });
      };

      const fetchMonthYearData = (monthYear) => {
        const params = {
          TableName: 'CelestialData3',
          FilterExpression: '#yearMonth = :yearMonth',
          ExpressionAttributeNames: {
            '#yearMonth': 'yearMonth',
            // '#day': 'day'
          },
          ExpressionAttributeValues: {
            ':yearMonth': monthYear,
            // ':day' : "01"
          }
        };
    
        return new Promise((resolve, reject) => {
          docClient.scan(params, function (err, data) {
            if (err) {
              // console.error("Error fetching data:", err);
              reject(err);
            } else {
              const monthEvents = data;
              if (monthEvents.length === 0) {
                resolve([]); // Resolve with empty array if no events
              } else {
                resolve(monthEvents);
              }
            }
          });
        });
      }
      
      const fetchCelestialEventsForDay = (monthData, targetDay) => {
        return new Promise((resolve, reject) => {
          const dayEvent = monthData.Items.find(item => item.day === targetDay);
          
          if (dayEvent) {
            const result = {
              day: dayEvent.day,
              celestialEvents: dayEvent.eventType.celestial,
              yearMonth: dayEvent.yearMonth
            };
            resolve(result);
          } else {
            resolve(null); // or reject with an error if preferred
          }
        });
      };
      
    
      useEffect(() => {
        // Calculate dayString based on currentDate or other dependencies
        const dayString = `${year}-${String(getDate().getMonth() + 1).padStart(2, '0')}`;
        // setSelectedDate(dayString);
        setStringDate(dayString);
        // Optionally call any additional functions here if needed
        generateDaysInMonth(stringDate);
      });

    useEffect(() => {
      // Call fetchWeather only once when the component mounts
      fetchWeather();
  }, []);

    const getDate = () => {
        return new Date(year, month, dog);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const shortDaysOfTheWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayString = daysOfTheWeek[getDate().getDay()];

    return (
        <View style={styles.container}>
            <ScrollView >

            <View style={{top: 30}}>
                {/* <CalendarEventCarousel items={sEvents[StringDay]?.social || []}/>
                <CalendarEventCarouselTwo items={sEvents[StringDay]?.celestial || []}/> */}
                <CalendarEventCarousel 
                items={sEvents[StringDay]?.social?.socialEvents || []}
                />
                <CalendarEventCarouselTwo
                items={sEvents[StringDay]?.celestial?.celestialEvents || []}
                />
              </View>

            {/* <Button style={{color: 'black'}}title="Create Item" onPress={() => createDay({ date: "10-30-24" })} /> */}
            </ScrollView>
        </View>

    );
};

const header = StyleSheet.create({
    headerBox: {
        top: 80,
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    headerText: {
        fontWeight: '700',
        fontSize: 40,
        color: '#fff',
        textTransform: 'capitalize',
    },
    subHeader: {
        fontWeight: '300',
        fontSize: 15,
        color: 'white',
    }
});

const boxWidth = 60;

const weekdayWidget = StyleSheet.create({
    container: {
        alignSelf: 'center',
        marginTop: 110,
        height: 100,
        width: boxWidth * 7,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignContent: 'center',
    },
    dayBox: {
        borderRadius: 10,
        alignItems: 'center',
        width: boxWidth,
        height: 90,
        backgroundColor: 'transparent',
    },
    chosenDayBox: {
        borderRadius: 5,
        alignItems: 'center',
        width: boxWidth,
        height: 90,
        backgroundColor: '#7B62A9',
    },
    dayText: {
        top: 15,
        fontSize: 30,
        color: 'white',
        textTransform: 'capitalize',
        fontWeight: '400',
    },
    chosenDayText: {
        top: 15,
        fontSize: 30,
        color: '#000D30',
        textTransform: 'capitalize',
        fontWeight: '400',
    },
    subtitleNumberDay: {
        top: 15,
        fontSize: 20,
        fontWeight: 'ultralight',
    }
});

const widgets = StyleSheet.create({
    widgetContainer: {
        flexDirection: 'row',
        height: 90,
        width: screenWidth,
        marginTop: 30,
        paddingHorizontal: 20,
    },
    cloudContainer: {
        height: 90,
        width: 80,
        backgroundColor: '#182748',
        borderRadius: 10,
    },
    cloudText: {
        color: 'white',
        top: 5,
        resizeMode: 'contain',
        fontSize: 15,
        left: 10,
    },
    cloudNumberText: {
        color: 'white',
        fontSize: 15,
        marginLeft: 10,
        marginTop: 5,
        fontWeight: '500',
    },
    moonContainer: {
        marginLeft: 20,
        height: 90,
        width: 150,
        backgroundColor: '#182748',
        borderRadius: 10,
        alignItems: 'center',
    },
    moonText: {
        color: 'white',
        alignSelf: 'center'
    },
    weatherContainer: {
        marginLeft: 20,
        height: 90,
        width: 80,
        backgroundColor: '#182748',
        borderRadius: 10,
    },
    weatherText: {
        color: 'white',
        alignSelf: 'center',
        fontSize: 25,
        top: 10,
    }

});

const styles = StyleSheet.create({
    container: {
        flex: 1,
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

export default WeeklyCalendarScreen;


// import React, { useState, useEffect } from 'react';
// import { View, Text, Button,StyleSheet, TouchableOpacity, ImageBackground, Dimensions, ScrollView, Image} from 'react-native';
// import MonthlyData from "/Users/thebenzsecrets/lumina4.0/features/calendarScreenFeatures/month1/monthlyData.json";
// import { FlatList } from 'react-native-gesture-handler';
// import CalendarEventCarousel from '../carousels/calendarEventCarousel';
// import CalendarEventCarouselTwo from '../carousels/calendarEventCarousalTwo';
// import AWS from "aws-sdk";
// import { list } from 'aws-amplify/storage';

// AWS.config.update({
//   region: "us-east-2",
//   accessKeyId: "AKIA3CMCCMY6G2LNLUMH",
//   secretAccessKey: "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",
//   dynamoDbCrc32: false,
// });

// const docClient = new AWS.DynamoDB.DocumentClient();

// const screenHeight = Dimensions.get('window').height; //852
// const screenWidth = Dimensions.get('window').width; //393
// const dayWidth = screenWidth / 7;


// const WeeklyCalendarScreen = ({route}) => {
//     const {year, month, dog} = route.params;
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [currentCloudPrec, setCloudPrec] = useState(0);
//     const [currentMoonPhase, setMoonPhase]  = useState("Full Moon");
//     const [currentIllumination, setIllumination] = useState(0);
//     const [stringDate, setStringDate] = useState("");
//     const [sEvents, setSEvents] = useState([]);
//     const [temperature, setTemperature] = useState(0);
//     const [StringDay, setStringDay] = useState("");
//     const [weatherDescription, setWeatherDescription] = useState('');

//     function getPhaseName(moonPhaseValue) {
//         if (moonPhaseValue === 0 || moonPhaseValue === 1) return "New Moon";
//         if (moonPhaseValue === 0.25) return "First Quarter";
//         if (moonPhaseValue === 0.5) return "Full Moon";
//         if (moonPhaseValue === 0.75) return "Last Quarter";
//         if (moonPhaseValue > 0 && moonPhaseValue < 0.25) return "Waxing Crescent";
//         if (moonPhaseValue > 0.25 && moonPhaseValue < 0.5) return "Waxing Gibbous";
//         if (moonPhaseValue > 0.5 && moonPhaseValue < 0.75) return "Waning Gibbous";
//         if (moonPhaseValue > 0.75 && moonPhaseValue < 1) return "Waning Crescent";
//     }

//     const moonPhaseImages = {
//       'New Moon':
//         'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/new_moon.png',
//       'First Quarter':
//         'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/first_quarter.png',
//       'Full Moon':
//         'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/full_moon.png',
//       'Last Quarter':
//         'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/last_quarter.png',
//       'Waxing Crescent':
//         'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/waxing_crescent.png',
//       'Waxing Gibbous':
//         'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/waxing_gibbous.png',
//       'Waning Gibbous':
//         'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/waning_gibbous.png',
//       'Waning Crescent':
//         'https://moonphases.org/themes/xwm-moonphases/assets/images/moon-phases/waning_crescent.png',
//     };
  

//     async function fetchWeather() {
//         const url = "https://fi4o4iz0e2.execute-api.us-east-2.amazonaws.com/dev/calendarWeather?cityName=Dallas";
//         try {
//           const response = await fetch(url);
//           if (!response.ok) {
//             throw new Error(`Response status: ${response.status}`);
//           }
//           const weatherData = await response.json();
//           setTemperature(Math.round(weatherData.body.current.temp));
//           setWeatherDescription(weatherData.body.current.weather[0].description);
//           setMoonPhase(getPhaseName(weatherData.body.daily[0].moon_phase));
//         } catch (error) {
//           console.error(error.message);
//         }
//        }

//     const generateDaysInMonth = async (strDate) => {   
//         const eventsByDay = {};

//         const dayString = `${String(dog).padStart(2, '0')}`;
//         setStringDay(dayString);
//         const monthEvents = await fetchMonthYearData(strDate);


//         try {
//             // console.log(strDate);
//             const socialEvents = await fetchSocialEventsForDay(monthEvents, dayString);
//             const celestialEvents = await fetchCelestialEventsForDay(monthEvents, dayString)
//             //console.log(socialEvents);
//             eventsByDay[dayString] = { 
//                 social: socialEvents != null && socialEvents.socialEvents.length > 0 ? socialEvents : [], 
//                 celestial: celestialEvents != null && celestialEvents.celestialEvents.length > 0 ? celestialEvents : [] 
//               };
//         } catch (error) {
//             console.error(`Error fetching events for ${dayString}:`, error);
//             // Proceed with an empty array if there was an error
//             eventsByDay[strDate] = { social: [], celestial: [] };
//         }
        
//         setSEvents(eventsByDay);
//       };
      
//       const fetchSocialEventsForDay = (monthData, targetDay) => {
//         return new Promise((resolve, reject) => {
//           const dayEvent = monthData.Items.find(item => item.day === targetDay);
          
//           if (dayEvent) {
//             const result = {
//               day: dayEvent.day,
//               socialEvents: dayEvent.eventType.social,
//               yearMonth: dayEvent.yearMonth
//             };
//             resolve(result);
//           } else {
//             resolve(null); // or reject with an error if preferred
//           }
//         });
//       };

//       const fetchMonthYearData = (monthYear) => {
//         const params = {
//           TableName: 'CelestialData3',
//           FilterExpression: '#yearMonth = :yearMonth',
//           ExpressionAttributeNames: {
//             '#yearMonth': 'yearMonth',
//             // '#day': 'day'
//           },
//           ExpressionAttributeValues: {
//             ':yearMonth': monthYear,
//             // ':day' : "01"
//           }
//         };
    
//         return new Promise((resolve, reject) => {
//           docClient.scan(params, function (err, data) {
//             if (err) {
//               // console.error("Error fetching data:", err);
//               reject(err);
//             } else {
//               const monthEvents = data;
//               if (monthEvents.length === 0) {
//                 resolve([]); // Resolve with empty array if no events
//               } else {
//                 resolve(monthEvents);
//               }
//             }
//           });
//         });
//       }
      
//       const fetchCelestialEventsForDay = (monthData, targetDay) => {
//         return new Promise((resolve, reject) => {
//           const dayEvent = monthData.Items.find(item => item.day === targetDay);
          
//           if (dayEvent) {
//             const result = {
//               day: dayEvent.day,
//               celestialEvents: dayEvent.eventType.celestial,
//               yearMonth: dayEvent.yearMonth
//             };
//             resolve(result);
//           } else {
//             resolve(null); // or reject with an error if preferred
//           }
//         });
//       };
      
    
//       useEffect(() => {
//         // Calculate dayString based on currentDate or other dependencies
//         const dayString = `${year}-${String(getDate().getMonth() + 1).padStart(2, '0')}`;
//         // setSelectedDate(dayString);
//         setStringDate(dayString);
//         // Optionally call any additional functions here if needed
//         generateDaysInMonth(stringDate);
//       });

//     useEffect(() => {
//       // Call fetchWeather only once when the component mounts
//       fetchWeather();
//   }, []);

//     const getDate = () => {
//         return new Date(year, month, dog);
//     };

//     const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//     const shortDaysOfTheWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
//     const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     const dayString = daysOfTheWeek[getDate().getDay()];

//     return (
//         <ImageBackground source={require('/Users/thebenzsecrets/lumina4.0/assets/calendarScreenImages/calendarScreenBackground3.jpg')} style={styles.container}>
//             <ScrollView >
//             <View style={header.headerBox}>
//                 <Text style={header.headerText}>{dayString}</Text>
//                 <Text style={header.subHeader}>{monthNames[month].substring(0, 3)} {dog}, {year}</Text>
//             </View>
//             <ScrollView style={weekdayWidget.container} horizontal={true} contentContainerStyle={{justifyContent: 'space-evenly', gap: 10, paddingHorizontal: 30}} showsHorizontalScrollIndicator='false'>
//                 <View style={weekdayWidget.dayBox}>
//                     <Text style={weekdayWidget.dayText}>{shortDaysOfTheWeek[(getDate().getDay()-3+7) % 7]}</Text>
//                     <Text style={[weekdayWidget.subtitleNumberDay, {color: 'white'}]}>{dog-3}</Text>
//                 </View>
//                 <View style={weekdayWidget.dayBox}>
//                     <Text style={weekdayWidget.dayText}>{shortDaysOfTheWeek[(getDate().getDay()-2+7) % 7]}</Text>
//                     <Text style={[weekdayWidget.subtitleNumberDay, {color: 'white'}]}>{dog-2}</Text>
//                 </View>
//                 <View style={weekdayWidget.dayBox}>
//                     <Text style={weekdayWidget.dayText}>{shortDaysOfTheWeek[(getDate().getDay()-1+7) % 7]}</Text>
//                     <Text style={[weekdayWidget.subtitleNumberDay, {color: 'white'}]}>{dog-1}</Text>
//                 </View>
//                 <View style={weekdayWidget.chosenDayBox}>
//                     <Text style={weekdayWidget.chosenDayText}>{shortDaysOfTheWeek[getDate().getDay()]}</Text>
//                     <Text style={[weekdayWidget.subtitleNumberDay, {color: 'black'}]}>{dog}</Text>
//                 </View>
//                 <View style={weekdayWidget.dayBox}>
//                     <Text style={weekdayWidget.dayText}>{shortDaysOfTheWeek[(getDate().getDay()+1+7) % 7]}</Text>
//                     <Text style={[weekdayWidget.subtitleNumberDay, {color: 'white'}]}>{dog+1}</Text>
//                 </View>
//                 <View style={weekdayWidget.dayBox}>
//                     <Text style={weekdayWidget.dayText}>{shortDaysOfTheWeek[(getDate().getDay()+2+7) % 7]}</Text>
//                     <Text style={[weekdayWidget.subtitleNumberDay, {color: 'white'}]}>{dog+2}</Text>
//                 </View>
//                 <View style={weekdayWidget.dayBox}>
//                     <Text style={weekdayWidget.dayText}>{shortDaysOfTheWeek[(getDate().getDay()+3+7) % 7]}</Text>
//                     <Text style={[weekdayWidget.subtitleNumberDay, {color: 'white'}]}>{dog+3}</Text>
//                 </View>
//             </ScrollView>

//             <View style={widgets.widgetContainer}>
//                 <View style={widgets.cloudContainer}>
//                     <Image style={{height: 30, width: 30, resizeMode: 'contain', marginLeft: 10, marginTop: 10}} source={require('/Users/thebenzsecrets/lumina4.0/assets/calendarScreenImages/icons8-cloud-96.png')}/>
//                     <Text style={widgets.cloudText}>Clouds</Text>
//                     <Text style={widgets.cloudNumberText}>{currentCloudPrec}%</Text>
//                 </View>
//                 <View style={[widgets.weatherContainer]}>
//                     <Image style={{height: 40, width: 40, top: 10, alignSelf: 'center'}}source={{ uri: moonPhaseImages[currentMoonPhase] }}/>
//                     <Text style={[widgets.moonText, {top: 10, resizeMode: 'contain', fontWeight: 'bold'}]}>{currentMoonPhase}</Text>
//                 </View>
//                 <View style={widgets.weatherContainer}>
//                     <Text style={widgets.weatherText}>{temperature}</Text>
//                     <Text style={{fontSize: 15, color: 'white', alignSelf: 'center', marginTop: 10, flexWrap: 1}}>{weatherDescription}</Text>
//                 </View>
//             </View>

//             <View style={{top: 30}}>
//                 {/* <CalendarEventCarousel items={sEvents[StringDay]?.social || []}/>
//                 <CalendarEventCarouselTwo items={sEvents[StringDay]?.celestial || []}/> */}
//                 <CalendarEventCarousel 
//                 items={sEvents[StringDay]?.social?.socialEvents || []}
//                 />
//                 <CalendarEventCarouselTwo
//                 items={sEvents[StringDay]?.celestial?.celestialEvents || []}
//                 />


//             </View>

//             {/* <Button style={{color: 'black'}}title="Create Item" onPress={() => createDay({ date: "10-30-24" })} /> */}
//             </ScrollView>
//         </ImageBackground>

//     );
// };

// const header = StyleSheet.create({
//     headerBox: {
//         top: 80,
//         alignItems: 'center',
//         alignSelf: 'center',
//         backgroundColor: 'transparent',
//     },
//     headerText: {
//         fontWeight: '700',
//         fontSize: 40,
//         color: '#fff',
//         textTransform: 'capitalize',
//     },
//     subHeader: {
//         fontWeight: '300',
//         fontSize: 15,
//         color: 'white',
//     }
// });

// const boxWidth = 60;

// const weekdayWidget = StyleSheet.create({
//     container: {
//         alignSelf: 'center',
//         marginTop: 110,
//         height: 100,
//         width: boxWidth * 7,
//         backgroundColor: 'transparent',
//         flexDirection: 'row',
//         alignContent: 'center',
//     },
//     dayBox: {
//         borderRadius: 10,
//         alignItems: 'center',
//         width: boxWidth,
//         height: 90,
//         backgroundColor: 'transparent',
//     },
//     chosenDayBox: {
//         borderRadius: 5,
//         alignItems: 'center',
//         width: boxWidth,
//         height: 90,
//         backgroundColor: '#7B62A9',
//     },
//     dayText: {
//         top: 15,
//         fontSize: 30,
//         color: 'white',
//         textTransform: 'capitalize',
//         fontWeight: '400',
//     },
//     chosenDayText: {
//         top: 15,
//         fontSize: 30,
//         color: '#000D30',
//         textTransform: 'capitalize',
//         fontWeight: '400',
//     },
//     subtitleNumberDay: {
//         top: 15,
//         fontSize: 20,
//         fontWeight: 'ultralight',
//     }
// });

// const widgets = StyleSheet.create({
//     widgetContainer: {
//         flexDirection: 'row',
//         height: 90,
//         width: screenWidth,
//         marginTop: 30,
//         paddingHorizontal: 20,
//     },
//     cloudContainer: {
//         height: 90,
//         width: 80,
//         backgroundColor: '#182748',
//         borderRadius: 10,
//     },
//     cloudText: {
//         color: 'white',
//         top: 5,
//         resizeMode: 'contain',
//         fontSize: 15,
//         left: 10,
//     },
//     cloudNumberText: {
//         color: 'white',
//         fontSize: 15,
//         marginLeft: 10,
//         marginTop: 5,
//         fontWeight: '500',
//     },
//     moonContainer: {
//         marginLeft: 20,
//         height: 90,
//         width: 150,
//         backgroundColor: '#182748',
//         borderRadius: 10,
//         alignItems: 'center',
//     },
//     moonText: {
//         color: 'white',
//         alignSelf: 'center'
//     },
//     weatherContainer: {
//         marginLeft: 20,
//         height: 90,
//         width: 80,
//         backgroundColor: '#182748',
//         borderRadius: 10,
//     },
//     weatherText: {
//         color: 'white',
//         alignSelf: 'center',
//         fontSize: 25,
//         top: 10,
//     }

// });

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     eventText: {
//         fontSize: 10,
//         color: 'white',
//     },
//     solarBox: {
//         height: 14, width: dayWidth-3, backgroundColor: '#B98A13', marginBottom: 5
//     },
//     lunarBox: {
//         height: 14, width: dayWidth-3, backgroundColor: '#807BE4', marginBottom: 5
//     },
//     stargazingBox: {
//         height: 14, width: dayWidth-3, backgroundColor: '#2F43E4', marginBottom: 5
//     },
//     socialBox: {
//         height: 14, width: dayWidth-3, backgroundColor: '#BA91F9', marginBottom: 5
//     }
// });

// export default WeeklyCalendarScreen;
