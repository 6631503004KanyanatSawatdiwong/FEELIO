import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Image, 
    Dimensions, Alert, StatusBar, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { database, ref, set, get, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const templateImage = require('../assets/MoodBadges/template.png');

const emotionColors = {
    'Happy': '#FCC803',
    'Ecstatic': '#DF7D7D',
    'Calm': '#B9D671',
    'Sad': '#477AA9',
    'Angry': '#D84950',
    'Anxious': '#EBA443',
    'Exhausted': '#928D8D',
    'Stressed': '#C69FDD'
};

const avatars = [
    { id: '1', image: require('../assets/ProfileImages/yellowMan.png') },
    { id: '2', image: require('../assets/ProfileImages/pinkMan.png') },
];

const emotions = [
    { id: 1, name: 'Happy', image: require('../assets/MoodBadges/happyMood.png') },
    { id: 2, name: 'Ecstatic', image: require('../assets/MoodBadges/ecstaticMood.png') },
    { id: 3, name: 'Stressed', image: require('../assets/MoodBadges/stressfulMood.png') },
    { id: 4, name: 'Calm', image: require('../assets/MoodBadges/calmMood.png') },
    { id: 6, name: 'Exhausted', image: require('../assets/MoodBadges/exhaustedMood.png') },
    { id: 7, name: 'Anxious', image: require('../assets/MoodBadges/anxiousMood.png') },
    { id: 8, name: 'Sad', image: require('../assets/MoodBadges/sadMood.png') },
    { id: 9, name: 'Angry', image: require('../assets/MoodBadges/angryMood.png') },
];

export default function AddMoodScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const styles = createStyles(theme);
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [existingMood, setExistingMood] = useState(null);
    const [userData, setUserData] = useState(null);
    const { date = moment().format('YYYY-MM-DD'), isToday = true } = route?.params || {};
    const dateObj = moment(date);
    const [moodsData, setMoodsData] = useState({});

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
        checkExistingMood();
    }, []);

    const checkExistingMood = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const moodRef = ref(database, `users/${userId}/moods/${dateObj.format('YYYY')}/${dateObj.format('MM')}/${dateObj.format('DD')}`);
            const snapshot = await get(moodRef);
            if (snapshot.exists()) {
                setExistingMood(snapshot.val());
            }
        } catch (error) {
            console.error('Error checking existing mood:', error);
        }
    };

    const handleEmotionPress = async (emotion) => {
        if (selectedEmotion?.id === emotion.id) {
            // Second click - save the emotion
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    Alert.alert('Error', 'User not found');
                    return;
                }

                const moodRef = ref(database, `users/${userId}/moods/${dateObj.format('YYYY')}/${dateObj.format('MM')}/${dateObj.format('DD')}`);
                await set(moodRef, emotion.name);
                
                navigation.navigate('HomeScreen');
            } catch (error) {
                console.error('Error saving mood:', error);
                Alert.alert('Error', 'Failed to save mood');
            }
        } else {
            // First click - select the emotion
            setSelectedEmotion(emotion);
        }
    };

    const getEmotionPosition = (index, totalEmotions) => {
        const radius = width * 0.35;
        const angle = (index * 2 * Math.PI / totalEmotions) - Math.PI/2;
        return {
            left: radius * Math.cos(angle) + width * 0.5 - width * 0.1,
            top: radius * Math.sin(angle) + height * 0.5 - width * 0.1
        };
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <TouchableOpacity 
                style={[
                    styles.profileButton,
                    { backgroundColor: theme.navbar },
                    isDarkMode && {
                        shadowColor: undefined,
                        shadowOffset: undefined,
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                    }
                ]}
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

            <Text style={[styles.questionText, { color: theme.text }]}>
                {isToday ? "How are you feeling today?" : "What was your mood this day?"}
            </Text>

            {existingMood && (
                <Text style={[styles.existingMoodText, { color: theme.secondary }]}>
                    Current mood: {existingMood}
                </Text>
            )}

            <View style={styles.emotionsContainer}>
                {emotions.map((emotion, index) => {
                    const position = getEmotionPosition(index, emotions.length);
                    return (
                        <TouchableOpacity
                            key={emotion.id}
                            style={[
                                styles.emotionButton,
                                { left: position.left, top: position.top },
                                selectedEmotion?.id === emotion.id && styles.selectedEmotion
                            ]}
                            onPress={() => handleEmotionPress(emotion)}
                        >
                            {selectedEmotion?.id === emotion.id && (
                                <Image 
                                    source={templateImage} 
                                    style={[
                                        styles.templateBorder,
                                        { tintColor: isDarkMode ? '#fff' : emotionColors[emotion.name] }
                                    ]} 
                                />
                            )}
                            <Image 
                                source={emotion.image} 
                                style={[
                                    styles.emotionImage,
                                    selectedEmotion?.id === emotion.id && styles.selectedEmotionImage
                                ]} 
                            />
                            {selectedEmotion?.id === emotion.id && (
                                <Text style={[styles.emotionName, { color: theme.text }]}>{emotion.name}</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={[
                styles.iconContainer,
                isDarkMode && {
                    shadowColor: undefined,
                    shadowOffset: undefined,
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    elevation: 0,
                }
            ]}>
                <TouchableOpacity 
                    style={[
                        styles.icon, 
                        { backgroundColor: theme.navbar },
                        isDarkMode && {
                            shadowColor: undefined,
                            shadowOffset: undefined,
                            shadowOpacity: 0,
                            shadowRadius: 0,
                            elevation: 0,
                        }
                    ]} 
                    onPress={() => navigation.replace('HomeScreen')}
                >
                    <Octicons name="home" size={28} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[
                    styles.activeIcon, 
                    { backgroundColor: theme.primary },
                    isDarkMode && {
                        shadowColor: undefined,
                        shadowOffset: undefined,
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                    }
                ]}>
                    <FontAwesome name="plus" size={28} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.icon, 
                        { backgroundColor: theme.navbar },
                        isDarkMode && {
                            shadowColor: undefined,
                            shadowOffset: undefined,
                            shadowOpacity: 0,
                            shadowRadius: 0,
                            elevation: 0,
                        }
                    ]} 
                    onPress={() => navigation.replace('SettingsScreen')}
                >
                    <Ionicons name="settings" size={28} color={theme.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    emotionsContainer: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'absolute',
        width: '50%',
        top: height * 0.49,
        zIndex: 1,
        alignSelf: 'center'
    },
    existingMoodText: {
        fontSize: 16,
        textAlign: 'center',
        position: 'absolute',
        width: '100%',
        top: height * 0.23,
        zIndex: 1
    },
    emotionButton: {
        position: 'absolute',
        width: width * 0.2,
        height: width * 0.2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectedEmotion: {
        backgroundColor: 'trasnparent'
    },
    emotionImage: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain'
    },
    emotionName: {
        fontSize: 12,
        marginTop: 5,
        fontWeight: '600'
    },
    iconContainer: {
        position: 'absolute',
        bottom: width * 0.075,
        alignSelf: 'center',
        flexDirection: 'row',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        backgroundColor: 'transparent',
    },
    icon: {
        width: width * 0.15,
        height: width * 0.15,
        backgroundColor: theme.card,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: {
                shadowColor: 'grey',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 5,
            }
        })
    },
    activeIcon: {
        width: width * 0.15,
        height: width * 0.15,
        backgroundColor: theme.primary,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: {
                shadowColor: 'grey',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 5,
            }
        })
    },
    profileButton: {
        position: 'absolute',
        top: Platform.select({
            ios: width * 0.175,
            android: width * 0.1
        }),
        left: width * 0.045,
        borderRadius: 15,
        borderWidth: 0.5,
        borderColor: theme.border,
        backgroundColor: theme.card,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 15,
        paddingVertical: 5,
        paddingHorizontal: 15,
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 2,
    },
    profileImageContainer: {
        width: width * 0.1,
        height: width * 0.1,
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
        color: 'black'
    },
    templateBorder: {
        position: 'absolute',
        width: '95%',
        height: '95%',
        resizeMode: 'contain',
        transform: [{ translateY: -10 }],
        zIndex: 1
    },
});