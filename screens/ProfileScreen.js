import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Image, 
    Dimensions, Alert, StatusBar, Platform
} from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';
import { database, ref, set, get, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import moment from 'moment';
import Svg, { Circle, Path, G } from 'react-native-svg';
import ChangeNameModal from './ChangeNameModal';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

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

const emotionColors = {
    'Happy': '#ffdd50',
    'Ecstatic': '#ff9797',
    'Calm': '#cfe59a',
    'Sad': '#5a9ad5',
    'Angry': '#ff6168',
    'Anxious': '#ffbb5d',
    'Exhausted': '#aaaaaa',
    'Stressed': '#e4b7ff'
};

const CircularProgress = ({ stats, size }) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const radius = size * 0.3;
    const strokeWidth = size * 0.1;
    const center = size / 2;
    
    let startAngle = -90; // Start from top
    const paths = [];
    
    // Filter out emotions with 0%
    const activeEmotions = Object.entries(stats)
        .filter(([_, percentage]) => percentage > 0)
        .sort((a, b) => b[1] - a[1]); // Sort by percentage descending

    // If no active emotions, show grey circle
    if (activeEmotions.length === 0) {
        return (
            <Svg width={size} height={size}>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill={theme.emptyState}
                />
                <Circle
                    cx={center}
                    cy={center}
                    r={radius - strokeWidth / 2}
                    fill={theme.background}
                />
            </Svg>
        );
    }

    // Draw the segments
    activeEmotions.forEach(([mood, percentage], index) => {
        const angle = (percentage / 100) * 360;
        const endAngle = startAngle + angle;
        
        // Calculate path
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);
        
        // For single mood with 100%, use a complete circle path
        if (activeEmotions.length === 1 && percentage === 100) {
            paths.push(
                <Circle
                    key={mood}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill={emotionColors[mood]}
                />
            );
        } else {
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `
                M ${center} ${center}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                L ${center} ${center}
                ${index === activeEmotions.length - 1 ? 'Z' : ''}
            `;
            
            paths.push(
                <Path
                    key={mood}
                    d={pathData}
                    fill={emotionColors[mood]}
                />
            );
        }
        
        startAngle = endAngle;
    });

    return (
        <Svg width={size} height={size}>
            <G>
                {paths}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius - strokeWidth / 2}
                    fill={theme.background}
                />
            </G>
        </Svg>
    );
};

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const styles = createStyles(theme);
    const [userData, setUserData] = useState(null);
    const [moodStats, setMoodStats] = useState({});
    const [selectedDate, setSelectedDate] = useState(moment());
    const [totalMoods, setTotalMoods] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);

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

                // Fetch moods for the selected month
                const moodsRef = ref(database, `users/${userId}/moods/${selectedDate.format('YYYY')}/${selectedDate.format('MM')}`);
                onValue(moodsRef, (snapshot) => {
                    const data = snapshot.val() || {};
                    calculateMoodStats(data);
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, [selectedDate]);

    const calculateMoodStats = (monthData) => {
        const stats = {};
        let total = 0;

        // Initialize stats for all emotions
        emotions.forEach(emotion => {
            stats[emotion.name] = 0;
        });

        // Count occurrences of each mood
        Object.values(monthData).forEach(mood => {
            if (mood && stats.hasOwnProperty(mood)) {
                stats[mood]++;
                total++;
            }
        });

        // If there's at least one mood entry, calculate percentages
        if (total > 0) {
            Object.keys(stats).forEach(mood => {
                // For a single mood entry, set its percentage to 100 and others to 0
                if (total === 1) {
                    stats[mood] = stats[mood] > 0 ? 100 : 0;
                } else {
                    // For multiple entries, calculate exact percentages
                    stats[mood] = Math.round((stats[mood] / total) * 100);
                }
            });
        }

        setMoodStats(stats);
        setTotalMoods(total);
    };

    const handleSaveName = async (newName) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User not found');
                return;
            }

            const userRef = ref(database, `users/${userId}`);
            await update(userRef, {
                name: newName
            });
            
            setUserData(prev => ({ ...prev, name: newName }));
        } catch (error) {
            console.error("Error updating name:", error);
            Alert.alert('Error', 'Failed to update name. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={styles.headerContainer}>
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
                            { backgroundColor: theme.card },
                            isDarkMode && {
                                shadowColor: undefined,
                                shadowOffset: undefined,
                                shadowOpacity: 0,
                                shadowRadius: 0,
                                elevation: 0,
                            }
                        ]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Octicons name="chevron-left" size={28} color={theme.text} />
                    </TouchableOpacity>
                </View>

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
                    onPress={() => setIsModalVisible(true)}
                >
                    <View style={styles.profileImageContainer}>
                        <Image 
                            source={userData?.avatarId !== undefined ? avatars[userData.avatarId].image : avatars[0].image} 
                            style={styles.profileImage} 
                        />
                    </View>
                    <Text style={styles.nameText}>{userData?.name || 'User'}</Text>
                    <Feather name="edit-3" size={14} color={theme.secondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.monthContainer}>
                <Text style={[styles.monthText, { color: theme.text }]}>{selectedDate.format('MMMM YYYY')}</Text>
            </View>

            <View style={styles.circleContainer}>
                <View style={[
                    styles.outerCircle,
                    isDarkMode && {
                        shadowColor: undefined,
                        shadowOffset: undefined,
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                    }
                ]}>
                    <CircularProgress stats={moodStats} size={width * 0.9} />
                    <View style={styles.innerCircleContent}>
                        <Text style={[styles.percentageText, { color: theme.text }]}>{totalMoods}</Text>
                        <Text style={[styles.totalText, { color: theme.secondary }]}>Total Moods</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                {Array.from({ length: Math.ceil(emotions.length / 2) }).map((_, rowIndex) => (
                    <View key={rowIndex} style={styles.statRowContainer}>
                        {emotions.slice(rowIndex * 2, rowIndex * 2 + 2).map(emotion => (
                            <View 
                                key={emotion.id} 
                                style={[
                                    styles.statRow,
                                    { backgroundColor: theme.card },
                                    isDarkMode && {
                                        shadowColor: undefined,
                                        shadowOffset: undefined,
                                        shadowOpacity: 0,
                                        shadowRadius: 0,
                                        elevation: 0,
                                    }
                                ]}
                            >
                                <Image source={emotion.image} style={styles.statIcon} />
                                <Text style={[styles.statText, { color: theme.text }]}>{emotion.name}</Text>
                                <Text style={[
                                    styles.statPercentage,
                                    { color: emotionColors[emotion.name] }
                                ]}>{moodStats[emotion.name] || 0}%</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            {/* Modals */}
            <ChangeNameModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveName}
                currentName={userData?.name}
                currentAvatarId={userData?.avatarId || '0'}
            />
            
        </View>
    )
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        padding: 20
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    icon: {
        backgroundColor: theme.card,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        width: width * 0.1,
        height: width * 0.1,
        elevation: 5,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Platform.select({
            ios: height * 0.05,
            android: height * 0.01
        }),
        marginBottom: 10,
        paddingVertical: 10,
    },
    profileButton: {
        alignSelf: 'flex-start',
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
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000'
    },
    monthContainer: {
        alignItems: 'center',
        marginTop: height * 0.03,
    },
    monthText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    circleContainer: {
        alignItems: 'center',
        marginTop: height * 0.05,
    },
    outerCircle: {
        width: width * 0.5,
        height: width * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    innerCircleContent: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: Platform.select({
            android: 50,
            ios: 60
        })
    },
    percentageText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
    },
    totalText: {
        fontSize: 16,
        color: '#666',
    },
    statsContainer: {
        marginTop: 50,
        // paddingHorizontal: 10,
    },
    statRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        width: '48%',
    },
    statIcon: {
        width: 25,
        height: 25,
        marginRight: 8,
    },
    statText: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    statPercentage: {
        fontSize: 14,
        fontWeight: 'bold',
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
});