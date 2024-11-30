import React, {useState, useEffect} from 'react';
import { FlatList, StyleSheet, Text, View, Button, SafeAreaView, Image, TouchableOpacity, TextInput, ImageBackground, ScrollView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import eventPhotos from '../../../assets/eventScreenData/eventPhotos';

const CARD_WIDTH = 275;
const CARD_HEIGHT = 200;

const monthStrings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayStrings = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const abbMonthStrings = (monthString) => {
  if (typeof monthString === 'string' && monthString.length > 0) {
    return monthString.slice(0, 3); // Return the first three characters
  } else {
    console.warn("Invalid month string:", monthString);
    return ""; // Return an empty string or a default value
  }
};

const StarGazingCarousel = ({list, celestialDays}) => {
    const navigation = useNavigation();
    const [eventImage, setEventImage] = useState("");

    // useEffect(() => {
    //   if (list?.item?.state) { // Check if list, list.item, and list.item.state exist
    //     getImage(list.item.state);
    //   }
    // }, [list.item]);

    const getImage = (eventTitle) => {
      if(eventTitle.includes("New Moon")) {
        return "https://hips.hearstapps.com/vidthumb/images/gettyimages-852475682-1595610427.jpg?crop=1.00xw:0.821xh;0,0.0837xh&resize=1200:*";
      }
      else if(eventTitle.includes("Jupiter")) {
        return "https://images.newscientist.com/wp-content/uploads/2019/05/21162807/pia21978.jpg";
      }
      else if(eventTitle.includes("Meteor")) {
        return "https://scitechdaily.com/images/Meteor-Shower-Art-Concept.jpg";
      }
      else if(eventTitle.includes("Full Moon")) {
        return "https://images.pexels.com/photos/975012/pexels-photo-975012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"; 
      }
      else if(eventTitle.includes("Mercury")) {
        return "https://ychef.files.bbci.co.uk/624x351/p0hq20x5.png";
      }
      else {
        return "https://images.pexels.com/photos/87009/earth-soil-creep-moon-lunar-surface-87009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"; 
      }


      // switch(eventTitle) {
      //   case eventTitle.includes("Moon"):
      //     return "https://images.pexels.com/photos/975012/pexels-photo-975012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
      //   default:
      //     return "https://images.pexels.com/photos/87009/earth-soil-creep-moon-lunar-surface-87009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
      // }
      // Ensure HTTPS for React Native compatibility
      // const secureUri = uriLink && uriLink.startsWith('http:') ? uriLink.replace('http:', 'https:') : uriLink;
      // return secureUri || 'https://images.pexels.com/photos/3801458/pexels-photo-3801458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    };
    

    return (
        <FlatList
            ListHeaderComponentStyle={{marginVertical: 10}}
            ListHeaderComponent={() => (
              <View>
                <FlatList
                  horizontal={true}
                  style={{ left: 20, borderTopLeftRadius: 20, borderBottomLeftRadius: 20,paddingVertical: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{gap: 40, paddingHorizontal: 20}}
                  data={list}
                  keyExtractor={(item, idx) => item + idx}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        backgroundColor: "white",
                        borderRadius: 20,
                      }}

                      onPress={() => 
                        navigation.navigate('eventDetailsScreen', {trip: item})
                      }
                    >
                      <View style={styles.card}>
                        <View style = {styles.imageBox}>
                          <Image source={{uri: getImage(item.title)}} style={styles.image}/>
                        </View>
                        <View style={styles.dateBox}>
                        <Text style={styles.dayText}>{item.day}</Text>
                          <Text style={styles.monthText}>{abbMonthStrings(monthStrings[new Date().getMonth()+1])}</Text>
                        </View>
                        <View style={styles.titleBox}>
                          {/* <Text style={styles.hostText}>{item.host}</Text> */}
                          <Text style={styles.title}>{item.title}</Text>
                          <Text style={styles.locationText}>{item.location}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    )}
                />
              </View>
            )}
          />
        );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  imageBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    resizeMode: 'cover',
  },
  titleBox: {
    position: 'absolute',
    bottom: 20,
    left: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: "white",
    letterSpacing: 2,
  },
  hostText: {
    fontSize: 13,
    fontWeight: '700',
    color: "white",
  },
  locationText: {
    fontSize: 10,
    fontWeight: '900',
    color: "white",
    letterSpacing: 2,
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "white",
    position: 'absolute',
    right: 10,
    top: 10,
  },
  dayText: {
    top: 5,
    textAlign: 'center',
    fontWeight:'700',
    fontSize: 30,
    color: '#8C70B6',
    position: 'relative',

  },
  monthText: {
    textAlign: 'center',
    color: '#8C70B6',
  },
});

export default StarGazingCarousel;
