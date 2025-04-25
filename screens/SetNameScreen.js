import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ImageBackground, TextInput, FlatList, 
  StyleSheet, Dimensions, Animated, TouchableOpacity, Alert, Image
} from 'react-native';
import { database, ref, set } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const avatars = [
    { id: '1', image: require('../assets/ProfileImages/yellowMan.png') },
    { id: '2', image: require('../assets/ProfileImages/pinkMan.png') },
];

export default function SetNameScreen({ navigation }) {
    const [avatarId, setAvatarId] = useState(0);
    const [username, setUsername] = useState('');
    const scrollX = useRef(new Animated.Value(0)).current;
    const bannerOpacity = useRef(new Animated.Value(0)).current;

    const handleStart = async () => {
        if (!username.trim()) {
            Alert.alert('Name Required', 'Please enter your name before proceeding.');
            return;
        }

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                Alert.alert('Error', 'No authenticated user found. Please login first.');
                return;
            }

            // Save user data to Firebase
            const userRef = ref(database, `users/${currentUser.uid}`);
            await set(userRef, {
                avatarId: avatarId,
                email: currentUser.email,
                name: username.trim(),
            });

            // Save user ID to AsyncStorage
            await AsyncStorage.setItem('userId', currentUser.uid);

            // Navigate to HomeScreen with the selected character and username
            navigation.navigate('HomeScreen', { 
                avatarImage: avatars[avatarId].image,   
                userName: username.trim() 
            });

        } catch (error) {
            console.error("Error saving user data:", error);
            Alert.alert('Error', 'Failed to save user data. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                    <Text style={styles.text}>Choose Your Avatar</Text>
            </View>

            <View style={styles.avatarContainer}>
                <FlatList
                    data={avatars}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / width);
                        setAvatarId(index);
                    }}
                    renderItem={({ item, index }) => {
                        const scale = scrollX.interpolate({
                            inputRange: [
                                (index - 1) * width,
                                index * width,
                                (index + 1) * width
                            ],
                            outputRange: [0.8, 1, 0.8],
                            extrapolate: 'clamp'
                        });

                        return (
                            <View style={styles.characterWrapper}>
                                <Animated.Image 
                                    source={item.image} 
                                    style={[styles.characterImage, { transform: [{ scale }] }]} 
                                />
                            </View>
                        );
                    }}
                />
            </View>

            <TextInput 
                style={styles.input} 
                placeholder="Enter your name" 
                placeholderTextColor="grey" 
                value={username} 
                onChangeText={setUsername}
            />

            <TouchableOpacity 
                style={[styles.startButton, username.trim() ? {} : styles.disabledButton]} 
                onPress={handleStart}
                disabled={!username.trim()}
            >
                <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f7ea'
    }, 
    textContainer: {
        alignItems: 'center',
        paddingTop: 10,
        marginVertical: 20,
        position: 'absolute',
        top: '10%'
    },    
    text: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'black',
    },
    characterWrapper: {
        width: width, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    characterImage: {
        width: width * 0.8,
        height: width * 0.8,
        resizeMode: 'contain'
    },
    input: {
        width: '50%',
        color: 'black',
        fontSize: 16,
        paddingVertical: 10,
        textAlign: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 10,
    },
    startButton: {
        position: 'absolute',
        bottom: '10%',
        backgroundColor: '#A081C3',
        paddingHorizontal: 30,
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#A081C3',
        marginVertical: 10,
    },
    startButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    },
    disabledButton: {
        backgroundColor: 'grey',
        borderColor: 'grey'
    },
    avatarContainer: {
        width: '100%',
        height: '50%',
    }
});