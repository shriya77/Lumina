import React, {useState, useEffect} from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Image, TouchableOpacity, Text, ImageBackground, Pressable} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import EventDetailButton from '../buttons/EventDetailButtons';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import eventPhotos from '../../../assets/eventScreenData/eventPhotos';
import { Imagebuilder } from 'aws-sdk';
const unfilledHeart = require('../../../assets/eventScreenImages/icons8-heart-48 (1).png');
const filledHeart = require('../../../assets/eventScreenImages/icons8-heart-48.png');
import { updateUserAttribute } from 'aws-amplify/auth';

async function updateLikedEvents(attributeKey, value) {
    try {
      const output = await updateUserAttribute({
        userAttribute: {
          attributeKey,
          value
        }
      });
      console.log("Liked events updated successfully");
    } catch (error) {
      console.log(error);
    }
}
  
// const updateLikedEvents = async (likedEvents) => {
//   try {
//     const likedEventsString = JSON.stringify(likedEvents); // Convert to a JSON string
//     console.log(likedEventsString);
//     await Auth.updateUserAttributes(await Auth.currentAuthenticatedUser(), {
//       'custom:liked_events': likedEventsString,
//     });
//     console.log("Liked events updated successfully");
//   } catch (error) {
//     console.error("Error updating liked events:", error);
//   }
// };

const EventDetailsScreenTwo = ({navigation, route}) => {
    const {trip} = route.params;
    const [isPinned, setIsPinned] = useState(false);
    const [eventImage, setEventImage] = useState("");

    useEffect(() => {
        getImage(trip.state); // Call getImage with trip.state
    }, [trip.state]); 

    const getImage = (stateAbr) => {
        const imageUri = stateAbr ? eventPhotos.get(trip.state).photo : 'https://images.pexels.com/photos/3801458/pexels-photo-3801458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
        setEventImage(imageUri);
    }

    const togglePin = () => {
        setIsPinned(!isPinned);
    };


    return (
        <GestureHandlerRootView>
        <ImageBackground source={require("/Users/thebenzsecrets/lumina4.0/assets/eventScreenImages/EventBackground.jpeg")} style={styles.container}>
            <SafeAreaView>
                {/* <View>
                    <View style={styles.searchContainer}>
                        <Image style={styles.usernameIcon} source={require('/Users/thebenzsecrets/lumina4.0/assets/icons8-search-30.png')}/>
                        <TextInput style={styles.textInput} placeholderTextColor="#0F1630"/>
                    </View>
                </View> */}
                <ScrollView>
                    {}
                    <View style={[styles.imageBox, {backgroundColor: 'transparent'}]}>
                        <Image source={{uri: eventImage}} style={[StyleSheet.absoluteFillObject, styles.image]}/>
                        <EventDetailButton onPress={() => navigation.navigate("eventScreen")}/>
                    </View>
                    <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.infoBox}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.title}>{trip.title}</Text>
                            <Pressable style={{backgroundColor: 'transparent', top: 5, height: 30, width: 30, right: 10,borderRadius: 30, alignSelf: ''}} onPress={togglePin}>
                                <Image
                                source={isPinned ? unfilledHeart : filledHeart}
                                style={{top: 12, alignSelf: 'center', height: 30, width: 30}}
                                />
                                {isPinned ? updateLikedEvents("custom:likedEvents", trip.eventTitle) : null}
                            </Pressable>
                        </View>
                        <Text style={styles.date}>{trip.date}</Text>
                        <Text style={styles.addressStyle}>{trip.location}</Text>
                        <Text style={styles.addressStyle}>{trip.address}, {trip.state} {trip.zip}</Text>
                        <Text style={styles.aboutStyle}>For more information</Text>
                        <Text style={styles.descriptionStyle}>{trip.eventURL}</Text>
                    </LinearGradient>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    testTrial: {
        fontSize: 20,
    },
    container: {
        paddingVertical: 24,
        paddingHorizontal: 0,
        flex: 1,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis:0,
    },
    usernameIcon: {
        marginLeft: 10,
        opacity: 1,
        tintColor: 'black',
      },
    searchContainer: {
        marginTop: 10,
        backgroundColor: '#D8D8D8',
        flexDirection: 'row',
        borderRadius: 50,
        marginHorizontal: 20,
        marginRight: 75,
        elevation: 10,
        marginaVertical: 20,
        alignItems: 'center',
        height: 40,
        marginBottom: 20,
      },
    //INFO BOX
    infoBox: {
        backgroundColor: '#0B112B',
        height: 800,
    },
    title: {
        fontSize: 25,
        fontWeight: '700',
        color: "white",
        letterSpacing: 2,
        marginTop: 15,
        marginLeft: 10,
    },
    date: {
        fontSize: 20,
        fontWeight: '500',
        color: "white",
        letterSpacing: 1,
        marginTop: 10,
        marginLeft: 10,
    },
    addressStyle: {
        color: "gray",
        fontSize: 15,
        marginLeft: 10,
    },
    aboutStyle: {
        fontSize: 20,
        fontWeight: '700',
        color: "white",
        letterSpacing: 1,
        marginTop: 10,
        marginLeft: 10,
    },
    descriptionStyle: {
        fontSize: 20,
        fontWeight: '400',
        color: "white",
        letterSpacing: 1,
        marginTop: 10,
        marginLeft: 10,
    },
    imageBox: {
        width: 395,
        height: 400,
    },
    image: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: 395,
        height: 400,
    },
});

export default EventDetailsScreenTwo;