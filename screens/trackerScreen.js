import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, TouchableWithoutFeedback} from 'react-native';
import MonthlyData from "/Users/thebenzsecrets/lumina4.0/features/calendarScreenFeatures/month1/monthlyData.json";
import { useNavigation } from '@react-navigation/native';
import AWS from "aws-sdk";


//in request body, specify query opperation

const docClient = new AWS.DynamoDB.DocumentClient();

const screenWidth = Dimensions.get('window').width;
const dayWidth = screenWidth / 7;

const TrackerScreen = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [sEvents, setSEvents] = useState([]);
  const [cEvents, setCEvents] = useState([]);
  const [setBack, setSetBack] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');

  //RETRIEVING DATA
  // const generateDaysInMonth = async (currDay) => {
  //   const daysArray = [];
  //   const d = new Date();
  //   const month = d.getMonth()+1;
  //   const year = d.getFullYear();
  //   // const numDaysInMonth = new Date(year, month + 1, 0).getDate();
  //   // setNumDaysInMonth(new Date(year, month + 1, 0).getDate())
  //   // console.log("numDaysInMonth", numDaysInMonth);

  //   const allSocialEvents = [];
  //   const allCelestialEvents = [];

  //   // Generate all days of the month
  //   // const currentDate = new Date(year, month, i);

      
  //     // Retrieve events for each day and add to allSocialEvents
  //     const socialEvents = await fetchSocialEvents(currDay);
  //     const celestialEvents = await fetchCelestialEvents(currDay);
  //     allSocialEvents.push(...socialEvents);
  //     allCelestialEvents.push(...celestialEvents);
  //     // console.log("Right:", JSON.stringify(celestialEvents.Items, null, 2));

  //     // setDataDaysInMonth(daysArray);
  //     setSEvents(socialEvents); // Set all collected social events for the month
  //     //console.log("All Social Events:", allSocialEvents);
  //     setCEvents(cEvents);
  //     // console.log("Celestial Events:", allCelestialEvents);
  // }

  const generateDaysInMonth = async (month, year) => {
    const totalDays = getDaysInMonth(month - 1, year);
    const monthYearString = `${year}-${String(month).padStart(2, '0')}`;
    const monthEvents = await fetchMonthYearData(monthYearString);
  
    const eventsByDay = {};
  
    for (let day = 1; day <= totalDays; day++) {
      const dayString = `${String(day).padStart(2, '0')}`;
      
      try {
        // const socialEvents = await fetchSocialEvents(monthEvents, dayString);
        const socialEvents = await fetchSocialEventsForDay(monthEvents, dayString)
        const celestialEvents = await fetchCelestialEventsForDay(monthEvents, dayString);

        // Check if socialEvents is empty and set a fallback value if necessary
        // eventsByDay[dayString] = { 
        //   social: Array.isArray(socialEvents) && socialEvents.length > 0 ? socialEvents : [], 
        //   celestial: Array.isArray(celestialEvents) && celestialEvents.length > 0 ? celestialEvents : [] 
        // };
        
        eventsByDay[dayString] = { 
          social: socialEvents != null && socialEvents.socialEvents.length > 0 ? socialEvents : [], 
          celestial: celestialEvents != null && celestialEvents.celestialEvents.length > 0 ? celestialEvents : [] 
        };

      } catch (error) {
        console.error(`Error fetching events for ${dayString}:`, error);
        // Proceed with an empty array if there was an error
        eventsByDay[dayString] = { social: [], celestial: [] };
      }
    }
    
    setSEvents(eventsByDay);
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

  //fetches the social events by month and yar
  // const fetchSocialEvents = (monthData, bob) => {

  //   return new Promise((resolve, reject) => {

  //     const dayEvents = monthData.Items.map(item => ({
  //       day: item.day,
  //       eventType: item.eventType,
  //       yearMonth: item.yearMonth
  //     }))
  //     console.log(dayEvents);
  //     resolve(dayEvents);

  //     // const dayEvents = monthData?.dayString || [];
  //     // console.log(monthData.count);

  //     // docClient.scan(params, function (err, data) {
  //     //   if (err) {
  //     //     // console.error("Error fetching data:", err);
  //     //     reject(err);
  //     //   } else {
  //     //     const socialEvents = data.Items.flatMap(item => item.eventType?.social || []);
  //     //     if (socialEvents.length === 0) {
  //     //       resolve([]); // Resolve with empty array if no events
  //     //     } else {
  //     //       resolve(socialEvents);
  //     //     }
  //     //   }
  //     // });
  //   });
  // };

  const fetchSocialEvents = (monthData) => {
    return new Promise((resolve, reject) => {
      const dayEvents = monthData.Items.map(item => ({
        day: item.day,
        socialEvents: item.eventType.social,  // Get only social events
        yearMonth: item.yearMonth
      }));
      resolve(dayEvents);
    });
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
        console.log(`No events found for day ${targetDay}`);
        resolve(null); // or reject with an error if preferred
      }
    });
  };
  
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
        console.log(`No events found for day ${targetDay}`);
        resolve(null); // or reject with an error if preferred
      }
    });
  };
  
  
  const fetchCelestialEvents = (monthData, bob) => {

    return new Promise((resolve, reject) => {

      const dayEvents = monthData.Items.map(item => ({
        day: item.day,
        eventType: item.eventType.social,
        yearMonth: item.yearMonth
      }))
      resolve(dayEvents);

      // const dayEvents = monthData?.dayString || [];
      // console.log(monthData.count);

      // docClient.scan(params, function (err, data) {
      //   if (err) {
      //     // console.error("Error fetching data:", err);
      //     reject(err);
      //   } else {
      //     const socialEvents = data.Items.flatMap(item => item.eventType?.social || []);
      //     if (socialEvents.length === 0) {
      //       resolve([]); // Resolve with empty array if no events
      //     } else {
      //       resolve(socialEvents);
      //     }
      //   }
      // });
    });
  };
  // const fetchCelestialEvents = (day) => {
  //   const params = {
  //     TableName: 'CelestialData',
  //     FilterExpression: '#date = :date',
  //     ExpressionAttributeNames: {
  //       '#date': 'date'
  //     },
  //     ExpressionAttributeValues: {
  //       ':date': day
  //     }
  //   };
  
  //   return new Promise((resolve, reject) => {
  //     // console.log("Fetching celestial events for date:", day);
  //     docClient.scan(params, function (err, data) {
  //       if (err) {
  //         // console.log("Error fetching data:", err);
  //         reject(err);
  //       } else {
  //         // console.log("Query succeeded:", JSON.stringify(data, null, 2));
  
  //         // Combine celestial events from all items
  //         const celestialEvents = data.Items.flatMap(item => {
  //           //console.log("Inspecting item:", JSON.stringify(item, null, 2));
  //           return item.eventType?.celestial || []; // Use optional chaining to safely access celestial events
  //         });
  
  //         if (celestialEvents.length === 0) {
  //           // console.log("No celestial events found for this date.");
  //         } else {
  //           //console.log("Celestial Events:", celestialEvents);
  //         }
  
  //         resolve(celestialEvents);
  //       }
  //     });
  //   });
  // };
  

  useEffect(() => {
    // Calculate dayString based on currentDate or other dependencies
    const dayString = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    setSelectedDate(dayString);

    // Optionally call any additional functions here if needed
    generateDaysInMonth(currentDate.getMonth() + 1, currentDate.getFullYear());
}, [currentDate]);


  // Helper function to get the number of days in a month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Update the calendar when the current date changes
  useEffect(() => {
    //BEFORE
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    setSetBack(firstDay);
    console.log("setBack", setBack);

    const daysArray = [];
    
    // Fill in the blanks for the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push("");
    }

    // Fill in the days of the current month
    for (let day = 1; day <= totalDays; day++) {
      daysArray.push(day);
    }

    setDaysInMonth(daysArray);
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (day) => {
    const currentDate = new Date(); // Today's date
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Current month
    // console.log("LINE 188",currentDate.getMonth() + 1);
  
    const dateKey = `${year}-${month}-${String(day).padStart(2, '0')}`;
  
    const socialEventsForDay = sEvents.filter(event => event.date === dateKey);
    const celestialEventsForDay = cEvents.filter(event => event.date === dateKey);
  
    return { socialEvents: socialEventsForDay, celestialEvents: celestialEventsForDay };
  };
  

  // Go to the previous month
  const handlePrevMonth = () => {
    const prevMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    setCurrentDate(prevMonthDate);
  };

  // Go to the next month
  const handleNextMonth = () => {
    const nextMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    setCurrentDate(nextMonthDate);
  };

  // Format the month and year for the header
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  //function to get color for type of event
  const getEventColor = (event) => {
      switch(event.type) {
        case 'celestial':
          return styles.solarBox;
        default:
          return styles.socialBox;
    };    
  };

  return (
    <ImageBackground source={require('/Users/thebenzsecrets/lumina4.0/assets/calendarScreenImages/calendarScreenBackground3.jpg')} style={styles.container}>
    <View style={styles.calendarContainer}>
      {/* Header for the current month and navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Text style={[styles.navButton, {marginLeft: 20}]}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{`${currentMonth} ${currentYear}`}</Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Text style={[styles.navButton, {marginRight: 20}]}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekdayLabels}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <Text key={index} style={styles.weekdayLabel}>{day}</Text>
        ))}
      </View>

      <View style={{height: 2, width: '100%', backgroundColor: '#7379AE'}}/>

      {/* Days grid */}
      <View style={styles.daysGrid}>
  {daysInMonth.map((day, index) => {
    //const dayString = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayString = `${String(day).padStart(2, '0')}`;

    // Retrieve events for the specific day from sEvents
    const events = sEvents[dayString] || { social: [], celestial: [] };
    //console.log(events);
    
    const socialEvents = Array.isArray(events.social?.socialEvents) ? events.social.socialEvents : [];
    const celestialEvents = Array.isArray(events.celestial?.celestialEvents) ? events.celestial.celestialEvents : [];
    

    return (
      <View key={index} style={index % 7 === 6 ? styles.endBox : styles.dayBox}>
        {index >= setBack ? (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('weeklyCalendarScreen', { year: currentYear, month: currentDate.getMonth(), dog: (day)})}
          >
            <View style={day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? styles.todayBox : styles.noBox}>
              <Text style={day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? styles.today : styles.dayText}>
                {day}
              </Text>

              {/* Render social events under the day */}
              {socialEvents.slice(0, 3).map((event, idx) => (
                <View key={`social-${idx}`} style={styles.socialBox}>
                  <Text style={styles.eventText}>{event.eventTitle}</Text>
                </View>
              ))}

              {/* Display three dots if there are more than 3 social events */}
              {socialEvents.length > 3 && (
                  <Text style={{color: 'white'}}>...</Text>
              )}

              {/* Render celestial events under the day */}
              {socialEvents.length < 3 && (
                celestialEvents.map((event, idx) => (
                  <View key={`celestial-${idx}`} style={styles.solarBox}>
                    <Text style={styles.eventText}>{event.title}</Text>
                  </View>
                ))
              )}

            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.noBox}>
            <Text style={{ color: 'transparent' }}>{day}</Text>
          </View>
        )}
      </View>
    );
  })}
</View>

    </View>
    </ImageBackground>
  )
};



// Basic styles for the calendar
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    top: 80,
    flex: 1,
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

export default TrackerScreen;


