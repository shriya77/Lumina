import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const CalendarEventCarouselTwo = ({ items }) => {
    const navigation = useNavigation();
    return (
        <ScrollView vertical={true} contentContainerStyle={{justifyContent: 'space-evenly', gap: 30, paddingHorizontal: 20}}>
            {items.map((item, index) => (
                <Pressable onPress={() => 
                    navigation.navigate('eventDetailsScreen', {trip: item})
                  }>
                <View key={index} style={styles.itemContainer}>
                    <View>
                        <Image style={styles.imageContainer} source={{ uri: `https://images.weserv.nl/?url=${encodeURIComponent(item.image)}` }}/>
                    </View>
                    <View style={styles.textContainer}>
                        <View>
                            <Text style={styles.eventNameText}>{item.title}</Text>
                        </View>
                        <View>
                            <Text style={styles.dateText}>{item.content}</Text>
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

export default CalendarEventCarouselTwo;
