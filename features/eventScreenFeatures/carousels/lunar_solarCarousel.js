import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import eventPhotos from '../../../assets/eventScreenData/eventPhotos';
const unfilledHeart = require('../../../assets/eventScreenImages/icons8-heart-48 (1).png');
const filledHeart = require('../../../assets/eventScreenImages/icons8-heart-48.png');
import AsyncStorage from '@react-native-async-storage/async-storage';

const CARD_WIDTH = 275;
const CARD_HEIGHT = 200;

const monthStrings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const abbMonthStrings = (monthString) => monthString?.slice(0, 3) || "";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LunarSolarCarousel = ({ list }) => {
  const navigation = useNavigation();
  const [expandedItem, setExpandedItem] = useState(null); // Track the expanded item
  const [expandedIndex, setExpandedIndex] = useState(null); 
  const [isPinned, setIsPinned] = useState(false);

  const calculatePosition = (index) => index * (CARD_WIDTH + 40); // Card width + gap

  const getImage = (stateAbr) => {
    return (
      eventPhotos.get(stateAbr)?.photo ||
      'https://images.pexels.com/photos/3801458/pexels-photo-3801458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    );
  };

  const toggleExpand = (item, index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItem(expandedItem === item ? null : item); // Toggle expanded state
    setExpandedIndex(expandedIndex == index ? null : index);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
};

const updateLikedEvents = async (eventTitle) => {
  try {
    await AsyncStorage.setItem('LikedEvent', eventTitle);
    console.log('Date saved successfully:', eventTitle);
  } catch (error) {
    console.error('Failed to save the date:', eventTitle);
  }
};

  return (
    <View>
      <FlatList
        horizontal
        style={{
          width: '100%', // Ensure the FlatList fills the screen width
          left: 20,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          paddingVertical: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 40, paddingHorizontal: 20 }}
        data={list}
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item, index}) => (
          <TouchableOpacity
            style={[
              styles.card,
              expandedItem === item && styles.expandedCard,
            ]}
            onPress={() => toggleExpand(item, index)}
          >
            {console.log(item)}
            <View style={styles.imageBox}>
              <Image source={{ uri: getImage(item.state) }} style={styles.image} />
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dayText}>
                {item.date[8]}
                {item.date[9]}
              </Text>
              <Text style={styles.monthText}>
                {abbMonthStrings(monthStrings[new Date(item.date).getMonth()])}
              </Text>
            </View>
            <View style={styles.titleBox}>
              <Text style={styles.title}>{item.eventTitle}</Text>
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Expanded Content Overlay */}
      {expandedItem && (
        <View
        style={[
          styles.expandedOverlay,
        ]}
      >
          <View style={styles.expandedContent}>
            <Image style={{height: '60%', width: '100%', padding: 20, borderRadius: 20}} source={{uri: getImage(expandedItem.state) }}/>
            <TouchableOpacity style={{position: 'absolute', right: 30, top: 30 }} onPress={() => toggleExpand(expandedItem, expandedIndex)}>
              <Image style={{height: 30, width: 30}} source={require('../../../assets/newAssets/universalAssets/return (1).png')}/>
            </TouchableOpacity>
            <Pressable style={{backgroundColor: 'transparent', top: 5, height: 30, width: 30, right: 10,borderRadius: 30, alignSelf: ''}} onPress={togglePin}>
                <Image
                source={isPinned ? unfilledHeart : filledHeart}
                style={{top: 12, alignSelf: 'center', height: 30, width: 30}}
                />
                {isPinned ? updateLikedEvents(expandedItem.eventTitle) : null}
            </Pressable>
            <Text style={[styles.description, {marginTop: 20,}]}>{expandedItem.eventTitle}</Text>
            <Text style={{top: 10,fontSize: 16, fontWeight: '500', color: 'white'}}>{expandedItem.location}</Text>
            <Text style={[styles.locationText, {top: 15, fontSize: '14'}]}>{expandedItem.address}, {expandedItem.city} {expandedItem.state} </Text>

            <TouchableOpacity
              style={[styles.detailsButton, {top: 20}]}
              onPress={() => {
                const url = expandedItem?.eventURL; // Replace with the actual property containing the link
                if (url) {
                  Linking.openURL(url).catch((err) =>
                    console.error('Failed to open URL:', err)
                  );
                } else {
                  console.warn('No URL found for this item.');
                }
              }}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
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
    color: 'white',
    letterSpacing: 2,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'white',
    position: 'absolute',
    right: 10,
    top: 10,
  },
  dayText: {
    top: 5,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 30,
    color: '#8C70B6',
    position: 'relative',
  },
  monthText: {
    textAlign: 'center',
    color: '#8C70B6',
  },
  expandedCard: {
    zIndex: 100, // Ensure card appears above others
    elevation: 10, // For Android
  },
  expandedOverlay: {
    position: 'absolute',
    height: 500,
    top: CARD_HEIGHT-200, // Position below card
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000, // Ensure it overlays everything
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
    alignSelf: 'center',
  },
  expandedContent: {
    padding: 10,
  },
  description: {
    fontSize: 20,
    color: 'white',
  },
  detailsButton: {
    marginTop: 10,
    backgroundColor: '#8C70B6',
    padding: 10,
    borderRadius: 5,
  },
  detailsButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});


// const LunarSolarCarousel = ({ list }) => {
//   const navigation = useNavigation();
//   const [expandedItem, setExpandedItem] = useState(null); // Track the expanded item

//   const getImage = (stateAbr) => {
//     return eventPhotos.get(stateAbr)?.photo || 'https://images.pexels.com/photos/3801458/pexels-photo-3801458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
//   };

//   const toggleExpand = (item) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setExpandedItem(expandedItem === item ? null : item); // Toggle expanded state
//   };

//   return (
//     <FlatList
//       horizontal
//       style={{
//         left: 20,
//         borderTopLeftRadius: 20,
//         borderBottomLeftRadius: 20,
//         paddingVertical: 20,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       }}
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={{ gap: 40, paddingHorizontal: 20 }}
//       data={list}
//       keyExtractor={(item, idx) => item + idx}
//       renderItem={({ item }) => (
//         <View>
//           <TouchableOpacity
//             style={[
//               styles.card,
//               expandedItem === item && styles.expandedCard,
//             ]}
//             onPress={() => toggleExpand(item)}
//           >
//             <View style={styles.imageBox}>
//               <Image source={{ uri: getImage(item.state) }} style={styles.image} />
//             </View>
//             <View style={styles.dateBox}>
//               <Text style={styles.dayText}>
//                 {item.date[8]}
//                 {item.date[9]}
//               </Text>
//               <Text style={styles.monthText}>
//                 {abbMonthStrings(monthStrings[new Date(item.date).getMonth()])}
//               </Text>
//             </View>
//             <View style={styles.titleBox}>
//               <Text style={styles.title}>{item.eventTitle}</Text>
//               <Text style={styles.locationText}>{item.location}</Text>
//             </View>
//           </TouchableOpacity>

//           {/* Expanded Content Overlay */}
//           {expandedItem === item && (
//             <View style={styles.expandedOverlay}>
//               <View style={styles.expandedContent}>
//                 <Text style={styles.description}>{item.description}</Text>
//                 <TouchableOpacity
//                   style={styles.detailsButton}
//                   onPress={() =>
//                     navigation.navigate('eventDetailsScreen', { trip: item })
//                   }
//                 >
//                   <Text style={styles.detailsButtonText}>View Details</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         </View>
//       )}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     width: CARD_WIDTH,
//     height: CARD_HEIGHT,
//     borderRadius: 20,
//     overflow: 'hidden',
//     backgroundColor: 'white',
//   },
//   expandedCard: {
//     // Regular card styles remain the same for FlatList
    
//   },
//   imageBox: {
//     width: CARD_WIDTH,
//     height: CARD_HEIGHT,
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   image: {
//     height: CARD_HEIGHT,
//     width: CARD_WIDTH,
//     resizeMode: 'cover',
//   },
//   titleBox: {
//     position: 'absolute',
//     bottom: 20,
//     left: 10,
//   },
//   title: {
//     fontSize: 25,
//     fontWeight: '700',
//     color: 'white',
//     letterSpacing: 2,
//   },
//   locationText: {
//     fontSize: 10,
//     fontWeight: '900',
//     color: 'white',
//     letterSpacing: 2,
//   },
//   dateBox: {
//     width: 60,
//     height: 60,
//     borderRadius: 10,
//     backgroundColor: 'white',
//     position: 'absolute',
//     right: 10,
//     top: 10,
//   },
//   dayText: {
//     top: 5,
//     textAlign: 'center',
//     fontWeight: '700',
//     fontSize: 30,
//     color: '#8C70B6',
//     position: 'relative',
//   },
//   monthText: {
//     textAlign: 'center',
//     color: '#8C70B6',
//   },
//   expandedOverlay: {
//     position: 'absolute',
//     top: CARD_HEIGHT,
//     left: 0,
//     width: CARD_WIDTH,
//     backgroundColor: 'white',
//     zIndex: 100, // Ensures it appears above the FlatList
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5, // For Android shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,

//   },
//   expandedContent: {
//     padding: 10,
//   },
//   description: {
//     fontSize: 14,
//     color: '#333',
//   },
//   detailsButton: {
//     marginTop: 10,
//     backgroundColor: '#8C70B6',
//     padding: 10,
//     borderRadius: 5,
//   },
//   detailsButtonText: {
//     color: 'white',
//     textAlign: 'center',
//   },
// });

export default LunarSolarCarousel;
