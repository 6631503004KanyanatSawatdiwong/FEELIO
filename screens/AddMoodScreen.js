import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Image, 
    Dimensions, Alert, Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { database, ref, set, get, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

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

export default function AddMoodScreen({ navigation, route }) {
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [existingMood, setExistingMood] = useState(null);
    const { date = moment().format('YYYY-MM-DD'), isToday = true } = route?.params || {};
    const dateObj = moment(date);
    const [userData, setUserData] = useState(null);
    const [moodsData, setMoodsData] = useState({});

    useEffect(() => {
        checkExistingMood();
    }, []);

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

            <Text style={styles.questionText}>
                {isToday ? "How are you feeling today?" : "What was your mood this day?"}
            </Text>

            {existingMood && (
                <Text style={styles.existingMoodText}>
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
                            <Image source={emotion.image} style={styles.emotionImage} />
                            {selectedEmotion?.id === emotion.id && (
                                <Text style={styles.emotionName}>{emotion.name}</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.iconContainer}>
                <TouchableOpacity 
                    style={styles.icon} 
                    onPress={() => navigation.replace('HomeScreen')}
                >
                    <Octicons name="home" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.activeIcon}>
                    <FontAwesome name="plus" size={28} color="white" />
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
        backgroundColor: '#f8f7ea',
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
        color: '#666',
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
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: width * 0.1,
        backgroundColor: 'rgba(255,255,255,0.2)'
    },
    emotionImage: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain'
    },
    emotionName: {
        fontSize: 12,
        color: '#000',
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
});