import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import ChangeNameModal from './ChangeNameModal';
import { database, ref, onValue, update } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const avatars = [
    { id: '1', image: require('../assets/ProfileImages/yellowMan.png') },
    { id: '2', image: require('../assets/ProfileImages/pinkMan.png') },
];

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function SettingsScreen() {
    const navigation = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    navigation.navigate('SetNameScreen');
                    return;
                }

                const userRef = ref(database, `users/${userId}`);
                onValue(userRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setUserData(data);
                    }
                    setIsLoading(false);
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Error', 'Failed to load user data');
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [navigation]);

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

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.navigate('AuthScreen');
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A081C3" />
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Failed to load user data</Text>
            </View>
        );
    }

    const avatarImage = avatars[userData.avatarId || 0].image;

    return (
        <View style={styles.container}>
            <Text style={styles.settingsText}>Settings Screen</Text>

            {/* Profile Button */}
            <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => setIsModalVisible(true)}
            >
                <View style={styles.imageAndName}>
                    <Image source={avatarImage} style={styles.profileImage} />
                    <Text style={styles.nameText}>{userData.name || 'User'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="grey" />
            </TouchableOpacity>

            {/* Dark Mode Button */}
            <View style={styles.profileButton}>
                <Text style={styles.otherText}>Dark Mode</Text>
            </View>

            {/* Privacy Policy & Terms of use */}
            <View style={styles.privacyTermsContainer}>
                <TouchableOpacity style={styles.privacyContainer}>
                    <Text style={styles.otherText}>Privacy Policy</Text>
                    <Ionicons name="chevron-forward" size={20} color="grey" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.privacyContainer}>
                    <Text style={styles.otherText}>Terms of use</Text>
                    <Ionicons name="chevron-forward" size={20} color="grey" />
                </TouchableOpacity>
            </View>

            {/* Change password & Delete account */}
            <View style={styles.privacyTermsContainer}>
                <TouchableOpacity style={styles.privacyContainer} onPress={handleLogout}>
                    <Text style={styles.otherText}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.privacyContainer}>
                    <Text style={styles.otherText}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={20} color="grey" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.privacyContainer}>
                    <Text style={styles.deleteAccountText}>Delete Account</Text>
                    <Ionicons name="chevron-forward" size={20} color="grey" />
                </TouchableOpacity>
            </View>

            {/* Bottom Icons */}
            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.replace('HomeScreen')}>
                    <FontAwesome5 name="home" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.replace('AddMoodScreen')}>
                    <FontAwesome name="plus" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.activeIcon} onPress={() => navigation.replace('SettingsScreen')}>
                    <Ionicons name="settings" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {/* Modal */}
            <ChangeNameModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveName}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f7ea'
    }, 
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000'
    },
    settingsText: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginTop: '12%',
        marginBottom: 20,
        marginLeft: 5
    },
    profileButton: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#e1e1e1',
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        padding: 20,
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    imageAndName: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
    },
    profileImage: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: 999,
        borderWidth: 3,
        borderColor: '#A699B6',
    },
    privacyTermsContainer: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#e1e1e1',
        backgroundColor: 'white',
        gap: 10,
        marginVertical: 10,
        padding: 20,
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    privacyContainer: {
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: '#e1e1e1',
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    iconContainer: {
        position: 'absolute',
        bottom: '4%',
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
    otherText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000'
    },
    deleteAccountText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'red'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f7ea'
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center'
    }
});