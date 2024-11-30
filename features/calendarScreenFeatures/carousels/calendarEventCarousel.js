import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const CalendarEventCarousel = ({ items }) => {
    const navigation = useNavigation();

    const getImage = (imageUrl) => {
        const placeholderUrl = "https://images.weserv.nl/?url=" + encodeURIComponent("https://c02.purpledshub.com/uploads/sites/41/2024/10/Meteor-shower.jpg?w=1029&webp=1");
        return imageUrl && imageUrl !== "default-image-url" ? imageUrl : placeholderUrl;
    };

    return (
        <ScrollView vertical={true} contentContainerStyle={{justifyContent: 'space-evenly', gap: 30, paddingHorizontal: 20}}>
            {items.map((item, index) => (
                <Pressable onPress={() => 
                    navigation.navigate('eventDetailsScreen', {trip: item})
                  }>
                <View key={index} style={styles.itemContainer}>
                    <View>
                        <Image style={styles.imageContainer} source={{uri: getImage(item.img)}}/>
                    </View>
                    <View style={styles.textContainer}>
                        <View style={{height: '20%'}}>
                            <Text style={styles.eventNameText}>{item.eventTitle}</Text>
                        </View>
                        {/* <View>
                            <Text style={styles.dateText}>{item.date}</Text>
                        </View> */}
                        <View>
                            <Text style={styles.timeText}>{item.location}</Text>
                        </View>
                        <View>
                            <Text style={styles.locationText}>{item.eventURL}</Text>
                        </View>
                    </View>
                </View>
                </Pressable>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        height: 140,
        flex: 1,
    },
    textContainer: {
        height: 140,
        width: 180,
        paddingVertical: 18,
        alignItems: 'stretch',
    },
    eventNameText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    dateText: {
        color: 'white',
    },
    timeText: {
        color: 'white',
    },
    locationText: {
        color: 'white',
    },
    imageContainer: {
        flexGrow: 1,
        height: 120,
        width: 120,
        marginHorizontal: 15,
        marginVertical: 10,
        borderRadius: 20,
    },
});

export default CalendarEventCarousel;
