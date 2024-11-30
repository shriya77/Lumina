import React, {useState, useEffect} from 'react'
import { StyleSheet, Image, SafeAreaView, ScrollView, View, Text, TouchableOpacity, ImageBackground, TextInput, Switch, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [events, setEvents] = useState([
    { id: 1, day: "23", month: "Nov", name: 'Skywatch @ Northwest' },
    { id: 2, day: "21", month: "Nov",name: 'Starlight Astronomy Club' },
    { id: 3, day: "21", month: "Nov",name: 'Merrill Gardens' },
  ]);

  const [visitedEvents, setVisitedEvents] = useState([
    { id: 1, day: "11", month: "Nov", name: 'Covington Community Star ...' },
    { id: 2, day: "11", month: "Nov", name: 'Quarter Moon Viewing' },
    { id: 3, day: "13", month: "Nov", name: 'Public Skygazing' },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [cityString, setCityString] = useState('');
  const [stateString, setStateString] = useState('');
  
  useEffect(() => {
    const loadSavedDate = async () => {
      try {
        const savedDate = await AsyncStorage.getItem('LikedEvent');
        if (savedDate) {
          console.log(savedDate);
          
          // setCEvents(celestialData._j.celestialEvents);
        }
      } catch (error) {
        console.error('Failed to load the saved date:', error);
      }
    };
    loadSavedDate();
  });
  
  //fetches user attributions
  async function handleFetchUserAttributes() {
    try {
      const userAttributes = await fetchUserAttributes();
      setStateString(userAttributes["custom:state"]);
      setCityString(userAttributes["custom:city"])
    } catch (error) {
      console.log(error);
    }
  }

  //calls fetch
  useEffect(() => {
    handleFetchUserAttributes();
  }, []);  

  const removeEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  return (
    <ImageBackground
      source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/NewBackground.png')}
      style={styles.container}
    >
      <View style={{top: 30, height: 70, flexDirection: 'row', marginVertical: 20, marginHorizontal: 20}}>
        <Image style={{resizeMode: 'contain', height: '100%', width: '40%', opacity: 0.5}} source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/universalAssets/LuminaLogoNew.png')}/>
        <Image style={{alignSelf: 'center',left: '190%', height: '30%', width: '30%', resizeMode: 'contain'}}source={require('/Users/thebenzsecrets/lumina4.0/assets/newAssets/calendarAssets/calendarIcons/configuration-gear 1.png')}/>
      </View>

      <View style={{ marginBottom: 10,width: '100%', height: 70, flexDirection: 'row', alignItems: 'center'}}>
        <Image style={{height: '100%', width: '15%', resizeMode: 'contain'}}source={require('../assets/profileScreenImages/STARS.png')}/>
        <Text style={{color: '#BA91F9',fontSize: 25, fontWeight: '600', marginLeft: 10, opacity: 0.8}}>Mercedes' Log</Text>
      </View>

      <Image style={{top: 10, height: 18, resizeMode: 'contain', right: 50}}source={require('../assets/newAssets/text/Planned.png')}/>

      <View style={styles.section}>
      <ScrollView>
        <View>
          {events.length > 0 ? (
            events.map((event) => (
              <View key={event.id} style={styles.row}>
                <View style={styles.rowDateBox}>
                  <Text style={{fontWeight: '600', color: 'white'}}>{event.day}</Text>
                  <Text style={{fontWeight: '400', color: 'white'}}>{event.month}</Text>
                </View>
                <Text style={styles.rowLabel}>{event.name}</Text>
                <View style={styles.rowSpacer} />
                <TouchableOpacity onPress={() => removeEvent(event.id)}>
                  <Text style={styles.removeButton}>✖</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noEventsText}>No events available.</Text>
          )}
        </View>
      </ScrollView>
      </View>

      {/* <Text style={{color: 'white', marginLeft: 20, fontSize: 20, fontWeight: '500', marginTop: 10}}>Completed</Text> */}
      <Image style={{top: 10, height: 20, resizeMode: 'contain', right: 80}}source={require('../assets/newAssets/text/Completed.png')}/>
      {/* <View style={styles.profile}>
        <TextInput
          style={styles.profileLocation}
          value={cityString + ", " + stateString}
          onChangeText={setStateString}
        />
      </View>

      <View style={styles.notificationsContainer}>
        <Text style={styles.notificationsLabel}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
        />
      </View>
       */}
       <View style={styles.section}>
      <ScrollView>
        <View>
          {visitedEvents.length > 0 ? (
            visitedEvents.map((event) => (
              <View key={event.id} style={styles.row}>
                <View style={styles.rowDateBox}>
                  <Text style={{fontWeight: '600', color: 'white'}}>{event.day}</Text>
                  <Text style={{fontWeight: '400', color: 'white'}}>{event.month}</Text>
                </View>
                <Text style={styles.rowLabel}>{event.name}</Text>
                <View style={styles.rowSpacer} />
                <TouchableOpacity onPress={() => removeEvent(event.id)}>
                  <Text style={styles.removeButton}>✖</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noEventsText}>No events available.</Text>
          )}
        </View>
      </ScrollView>
      </View>

      {/* <SignOutButton /> */}
    </ImageBackground>
  );
};


export default ProfileScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: {
    marginTop:30,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileLocation: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Nunito',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '80%',
    textAlign: 'center',
    padding: 8,
  },
  notificationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 60,
    marginTop: 20,
  },
  notificationsLabel: {
    fontSize: 20,
    fontFamily: 'Nunito',
    color: '#fff',
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 30,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontFamily: 'Nunito',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  rowDateBox: {
    height: 40,
    width: 40,
    borderRadius: 5,
    backgroundColor: 'black',
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: 'white',
    fontFamily: 'Nunito',
  },
  rowSpacer: {
    flexGrow: 1,
  },
  removeButton: {
    fontSize: 18,
    color: 'red',
  },
  noEventsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  signOutButton: {
    backgroundColor: '#7B62A9',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 110,
    width: '80%',
  },
  signOutText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito',
    fontWeight: '3000',
  },
    textStyle: {
      fontWeight: 'bold',
      fontSize: 18,
      padding: 10,
      color: '#fff'
    },
    buttonContainer: {
      alignSelf: 'center',
      backgroundColor: 'blue',
      paddingHorizontal: 100,
      paddingLeft: 65,
    },
    buttonText: { color: 'white', padding: 16, fontSize: 18 }
});