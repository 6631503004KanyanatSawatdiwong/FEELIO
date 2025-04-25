import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { database, ref, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const avatars = [
    { id: '1', image: require('../assets/ProfileImages/yellowMan.png') },
    { id: '2', image: require('../assets/ProfileImages/pinkMan.png') },
];

const templateImage = require('../assets/MoodBadges/template.png');
const moodImages = {
    'Happy': require('../assets/MoodBadges/happyMood.png'),
    'Ecstatic': require('../assets/MoodBadges/ecstaticMood.png'),
    'Stressed': require('../assets/MoodBadges/stressfulMood.png'),
    'Calm': require('../assets/MoodBadges/calmMood.png'),
    'Exhausted': require('../assets/MoodBadges/exhaustedMood.png'),
    'Anxious': require('../assets/MoodBadges/anxiousMood.png'),
    'Sad': require('../assets/MoodBadges/sadMood.png'),
    'Angry': require('../assets/MoodBadges/angryMood.png'),
};

export default function HomeScreen({ navigation }) {
    const [userData, setUserData] = useState(null);
    const [currentDate, setCurrentDate] = useState(moment());
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [monthsData, setMonthsData] = useState([]);
    const [moodsData, setMoodsData] = useState({});
    const flatListRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    navigation.navigate('SetNameScreen');
                    return;
                }

                // Fetch user profile data
                const userRef = ref(database, `users/${userId}`);
                onValue(userRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setUserData(data);
                    }
                });

                // Fetch moods data
                const moodsRef = ref(database, `users/${userId}/moods`);
                onValue(moodsRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setMoodsData(data);
                    }
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, [navigation]);

    useEffect(() => {
        // Generate months data for the current year
        const months = [];
        const now = moment();
        const currentYear = selectedYear;
        
        for (let i = 0; i < 12; i++) {
            const monthDate = moment([currentYear, i, 1]);
            // Only include months up to current month if it's the current year
            if (currentYear < now.year() || 
                (currentYear === now.year() && monthDate.isSameOrBefore(now, 'month'))) {
                months.push(monthDate.clone());
            }
        }
        setMonthsData(months);
        
        // Add a small delay to ensure FlatList is ready
        const timer = setTimeout(() => {
            if (currentYear === now.year() && flatListRef.current && months.length > 0) {
                const currentMonthIndex = months.findIndex(month => 
                    month.month() === now.month()
                );
                if (currentMonthIndex !== -1) {
                    try {
                        flatListRef.current.scrollToIndex({
                            index: currentMonthIndex,
                            animated: false
                        });
                    } catch (error) {
                        console.log('Error scrolling to index:', error);
                    }
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedYear]);

    const getMoodForDate = (date) => {
        const year = date.format('YYYY');
        const month = date.format('MM');
        const day = date.format('DD');
        return moodsData?.[year]?.[month]?.[day];
    };

    const renderDay = ({ item, index }) => {
        const isToday = item.isSame(moment(), 'day');
        const isPast = item.isBefore(moment(), 'day');
        const isFuture = item.isAfter(moment(), 'day');
        const mood = getMoodForDate(item);

        // Don't render future dates
        if (isFuture) return <View style={styles.dayPlaceholder} />;

        const handleDayPress = () => {
            navigation.navigate('AddMoodScreen', {
                date: item.format('YYYY-MM-DD'),
                isToday: isToday
            });
        };

        return (
            <TouchableOpacity 
                style={[
                    styles.dayContainer,
                    isFuture && styles.disabledDay
                ]}
                disabled={isFuture}
                onPress={handleDayPress}
            >
                <Image 
                    source={mood ? moodImages[mood] : templateImage} 
                    style={[
                        styles.templateImage,
                        isToday && !mood && styles.todayImage
                    ]} 
                />
                {!mood && (
                    <Text style={[
                        styles.dayText,
                        isToday && styles.todayText
                    ]}>
                        {item.date()}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderMonth = ({ item }) => {
        const daysInMonth = item.daysInMonth();
        const firstDayOfMonth = item.clone().startOf('month');
        const days = [];

        for (let i = 0; i < daysInMonth; i++) {
            days.push(firstDayOfMonth.clone().add(i, 'days'));
        }

        return (
            <View style={styles.monthContainer}>
                <View style={styles.monthHeader}>
                    <Text style={styles.monthText}>
                        {item.format('MMMM')}
                    </Text>
                </View>
                <View style={styles.daysGrid}>
                    {days.map((day, index) => (
                        <View key={index} style={{ width: '18%' }}>
                            {renderDay({ item: day })}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const onMonthChange = (event) => {
        const xOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(xOffset / width);
        setCurrentDate(monthsData[index]);
    };

    const handlePreviousYear = () => {
        const newYear = selectedYear - 1;
        if (newYear >= 2024) { // Assuming 2024 is your app's starting year
            setSelectedYear(newYear);
        }
    };

    const handleNextYear = () => {
        const currentYear = moment().year();
        if (selectedYear < currentYear) {
            setSelectedYear(selectedYear + 1);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => navigation.navigate('ProfileScreen')}
            >
                <View style={styles.profileImageContainer}>
                    <Image 
                        source={userData?.avatarId !== undefined ? avatars[userData.avatarId].image : avatars[0].image} 
                        style={styles.profileImage} 
                    />
                </View>
                <Text style={styles.nameText}>{userData?.name || 'User'}</Text>
            </TouchableOpacity>
            
            <View style={styles.calendarContainer}>
                <View style={styles.yearNavigation}>
                    <TouchableOpacity 
                        onPress={handlePreviousYear}
                        style={styles.yearButton}
                    >
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.yearText}>{selectedYear}</Text>
                    <TouchableOpacity 
                        onPress={handleNextYear}
                        style={[
                            styles.yearButton,
                            selectedYear === moment().year() && styles.disabledYearButton
                        ]}
                        disabled={selectedYear === moment().year()}
                    >
                        <Ionicons name="chevron-forward" size={24} color={selectedYear === moment().year() ? "#ccc" : "black"} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={monthsData}
                    renderItem={renderMonth}
                    keyExtractor={(item) => item.format('YYYY-MM')}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onMonthChange}
                    ref={flatListRef}
                    getItemLayout={(data, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                />
            </View>

            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.activeIcon}>
                    <Octicons name="home" size={28} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.icon} 
                    onPress={() => navigation.navigate('AddMoodScreen', {
                        date: moment().format('YYYY-MM-DD'),
                        isToday: true
                    })}
                >
                    <FontAwesome name="plus" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.icon} 
                    onPress={() => navigation.replace('SettingsScreen')}
                >
                    <Ionicons name="settings" size={28} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f7ea',
    },
    calendarContainer: {
        flex: 1,
        width: '100%',
        top: height * 0.165,
    },
    monthContainer: {
        width: width,
        paddingHorizontal: 20,
        // paddingTop: 5,
    },
    monthHeader: {
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 15,
    },
    monthText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 8,
    },
    dayContainer: {
        width: width * 0.15,
        height: width * 0.15,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        alignSelf: 'center',
    },
    templateImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        resizeMode: 'contain'
    },
    todayImage: {
        tintColor: '#A081C3'
    },
    dayText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#928E80',
        zIndex: 1
    },
    todayText: {
        color: 'black'
    },
    disabledDay: {
        opacity: 0.5
    },
    dayPlaceholder: {
        width: width * 0.15,
        height: width * 0.15,
        margin: 5,
    },
    profileButton: {
        position: 'absolute',
        top: width * 0.175,
        left: width * 0.045,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#e1e1e1',
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 15,
        paddingVertical: 10,
        paddingHorizontal: 15,
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 2,
    },
    profileImageContainer: {
        width: width * 0.13,
        height: width * 0.13,
        borderRadius: 999,
        borderWidth: 3,
        borderColor: '#CCC1DA',
        backgroundColor: '#EDE8F3',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileImage: {
        width: '110%',
        height: '110%',
        resizeMode: 'cover',
        transform: [{ translateY: 10 }],
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000'
    },
    iconContainer: {
        position: 'absolute',
        bottom: width * 0.075,
        flexDirection: 'row',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    icon: {
        width: width * 0.17,
        height: width * 0.17,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIcon: {
        width: width * 0.17,
        height: width * 0.17,
        padding: 15,
        backgroundColor: 'black',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    yearNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    yearButton: {
        padding: 10,
    },
    disabledYearButton: {
        opacity: 0.5,
    },
    yearText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 20,
    },
});