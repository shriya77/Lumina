import React, {useState, useEffect} from 'react'
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
  SafeAreaView,
  Image,
  TextInput
} from 'react-native';
import StarGazingCarousel from '/Users/thebenzsecrets/lumina4.0/features/eventScreenFeatures/carousels/stargazingCarousel.js';
import PlanetCarousel from '/Users/thebenzsecrets/lumina4.0/features/eventScreenFeatures/carousels/planetCarousel.js';
import LunarSolarCarousel from '/Users/thebenzsecrets/lumina4.0/features/eventScreenFeatures/carousels/lunar_solarCarousel.js';
import { starEvents } from '/Users/thebenzsecrets/lumina4.0/assets/eventScreenData/stargazing.js';
import { planetEvents } from '/Users/thebenzsecrets/lumina4.0/assets/eventScreenData/planets.js';
import { lunarAndSolarEvents } from '/Users/thebenzsecrets/lumina4.0/assets/eventScreenData/lunarAndSolar.js';
// import [DynamoDBClient] = require("@aws-sdk/")

import AWS from "aws-sdk";
import { fetch } from '@react-native-community/netinfo';

AWS.config.update({
  region: "us-east-2",
  accessKeyId: "-",
  secretAccessKey: "-",
  dynamoDbCrc32: false,
});

const docClient = new AWS.DynamoDB.DocumentClient();

const EventScreen = () => {
  const [cEvents, setCEvents] = useState([]);
  const [sEvents, setSEvents] = useState([]);
  const [currentSocialEvents, setCurrentSocialEvents] = useState([]);
  const [currentCelestialEvents, setCurrentCelestialEvents] = useState([]);
  const [monthSocialEvents, setMonthSocialEvents] = useState([]);
  const [monthCelestialEvents, setMonthCelestialEvents] = useState([]);
  const [listOfCelestialEventDays, setListOfCelestialEventDays] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);

  const generateData = async (monthYearString) => {
    //retreieves month data
    const monthEvents = await fetchMonthYearData(monthYearString);
    const nextMonthEvents = await fetchMonthYearData("2024-12");

    //sets currentEvents today 
    const currentDAY = new Date();
    const cYear = currentDAY.getFullYear();
    const cMonth = currentDAY.getMonth()+1;
    const cday = currentDAY.getDate();
    const totalDays = getDaysInMonth(cMonth - 1, cYear);
    const dayString = `${String(cday).padStart(2, '0')}`;
    setCurrentSocialEvents(retrieveCurrentEventsSocial(monthEvents, dayString));
    setCurrentCelestialEvents(retrieveCurrentEventsCelestial(monthEvents, dayString));

    //sets monthEvents
    const socialEvents = []; //will hold all the social events of the month
    const celestialEvents = []; //will hold all the celestial events of the month
    const celestialEventDays = [];

    //iterates through each day
    for(let i = cday-1; i < totalDays; i++) {
      const dayStringTwo = `${String(i+1).padStart(2, '0')}`; //prints the day as a string 02 for instance

      const dailySocialEvents = retrieveCurrentEventsSocial(monthEvents, dayStringTwo)._j;
      const dailyCelestialEvents = retrieveCurrentEventsCelestial(monthEvents, dayStringTwo)._j;
      if (Array.isArray(dailySocialEvents)) socialEvents.push(...dailySocialEvents);
      if (Array.isArray(dailyCelestialEvents)) celestialEvents.push(...dailyCelestialEvents) && celestialEventDays.push(dayStringTwo);
    }

    //gets the next months celestial events
    for(let i = 0; i < getDaysInMonth(cMonth, cYear); i++) {
      const dayStringThree = `${String(i+1).padStart(2, '0')}`; 
      const dailyCelestialEventsTwo = retrieveCurrentEventsCelestial(nextMonthEvents, dayStringThree)._j;
      if(Array.isArray(dailyCelestialEventsTwo)) celestialEvents.push(...dailyCelestialEventsTwo) && celestialEventDays.push(dayStringThree);
    }

    if (Array.isArray(socialEvents)) setMonthSocialEvents(socialEvents);
    if (Array.isArray(celestialEvents)) setMonthCelestialEvents(celestialEvents);
    if (Array.isArray(celestialEventDays)) setListOfCelestialEventDays(celestialEventDays);
  }

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

  const retrieveCurrentEventsSocial = (monthData, targetDay) => {

    return new Promise((resolve, reject) => {
      const dayEvent = monthData.Items.find(item => item.day === targetDay);
      
      if (dayEvent) {
        const result = {
          // day: dayEvent.day,
          //celestialEvents: dayEvent.eventType.celestial,
          socialEvents: dayEvent.eventType.social,
          // yearMonth: dayEvent.yearMonth
        };
        resolve(result.socialEvents);
      } else {
        // console.log(`No events found for day ${targetDay}`);
        resolve(null); // or reject with an error if preferred
      }
    });
  }

  const retrieveCurrentEventsCelestial = (monthData, targetDay) => {

    return new Promise((resolve, reject) => {
      const dayEvent = monthData.Items.find(item => item.day === targetDay);
      
      if (dayEvent) {
        const result = {
          // day: dayEvent.day,
          celestialEvents: dayEvent.eventType.celestial,
          //socialEvents: dayEvent.eventType.social,
          // yearMonth: dayEvent.yearMonth
        };
        resolve(result.celestialEvents);
      } else {
        // console.log(`No events found for day ${targetDay}`);
        resolve(null); // or reject with an error if preferred
      }
    });
  }

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  useEffect(() => {
    const currentDAY = new Date();
    const cYear = currentDAY.getFullYear();
    const cMonth = currentDAY.getMonth()+1;
    const cday = currentDAY.getDate();
    const dayString = `${cYear}-${String(cMonth).padStart(2, '0')}-${String(cday).padStart(2, '0')}`;
    const monthYearString = `${cYear}-${String(cMonth).padStart(2, '0')}`;
    generateData(monthYearString);
  }, [])

  return (
    <ImageBackground source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/NewBackground.png')} style={styles.container}>
      <SafeAreaView>
        <ScrollView>
        <View style={{height: 52, flexDirection: 'row', marginHorizontal: 20}}>
        <Image style={{resizeMode: 'contain', height: '100%', width: '40%', opacity: 0.5}} source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/LuminaLogoNew.png')}/>
        <Image style={{alignSelf: 'center',left: '270%', height: '40%', width: '30%', resizeMode: 'contain'}}source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/calendarAssets/calendarIcons/configuration-gear 1.png')}/>
      </View>
      
          <View style={{ zIndex: 2 }}>
            {currentSocialEvents.length != 0 ? (<Text style={{
              marginTop: 20,
              fontSize: 20,
              color: 'white',
              marginLeft: 20,
              marginBottom: 20,
            }}>EVENTS TODAY</Text>) : (null)}
            <LunarSolarCarousel list={currentSocialEvents._j}/>
            {/* <LunarSolarCarousel list={currentCelestialEvents._j}/> */}
          </View>

          <View style={{ zIndex: 1 }}>
            {monthSocialEvents.length != 0 ? (
              <Text style={{
                fontSize: 20,
                color: 'white',
                marginLeft: 20,
                marginBottom: 20,
                marginTop: 20,
              }}>SOCIAL</Text>
            ) : (null)}
            <LunarSolarCarousel list={monthSocialEvents}/>
          </View>

          <View style={{ zIndex: 0 }}>
            {monthCelestialEvents.length != 0 ? (
              <Text style={{
                fontSize: 20,
                color: 'white',
                marginLeft: 20,
                marginBottom: 20,
                marginTop: 20,
              }}>CELESTIAL</Text>
            ) : (null)}
            <StarGazingCarousel list={monthCelestialEvents} celestialDays={listOfCelestialEventDays}/>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  )
}
export default EventScreen;

// export default class EventScreen extends React.Component {
//     render() {
//       const dave = "dave";
        
//     }
// }

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 0,
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis:0,
  },
  header: {
    marginVertical: 36,
  },
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: 'left',
    marginBottom: 36,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: 'white',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'left',
    marginLeft: 20,
    fontFamily: 'Nunito-Regular'
  },

  /** SEARCH */
  usernameIcon: {
    marginLeft: 10,
    opacity: 1,
    tintColor: 'black',
  },
  searchContainer: {
    backgroundColor: '#D8D8D8',
    flexDirection: 'row',
    borderRadius: 50,
    marginHorizontal: 20,
    elevation: 10,
    marginaVertical: 20,
    alignItems: 'center',
    height: 40,
    width: 350,
    alignSelf: 'center',
  },

  item: {
    height: 30,
    width: 50,
    color: 'white',
  },
  /** Events Universal Styles */
  subTitle: {
    fontSize: 20,
    color: 'white',
    marginTop: 20,
    marginLeft: 20,
  },
});
