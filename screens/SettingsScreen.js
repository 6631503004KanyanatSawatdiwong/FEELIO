import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator, Switch, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import ChangeNameModal from './ChangeNameModal';
import ChangePasswordModal from './ChangePasswordModal';
import PrivacyPolicyModal from './PrivacyPolicyScreen';
import TermsOfUseModal from './TermsOfUseScreen';
import { database, ref, onValue, update, set } from '../firebaseConfig';
import { getAuth, deleteUser } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
import moment from 'moment';

const avatars = [
    { id: '1', image: require('../assets/ProfileImages/yellowMan.png') },
    { id: '2', image: require('../assets/ProfileImages/pinkMan.png') },
];

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { isDarkMode, toggleTheme } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const styles = createStyles(theme);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
    const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth();

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

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const userId = await AsyncStorage.getItem('userId');
                            if (userId) {
                                // Delete user data from Firebase Realtime Database
                                const userRef = ref(database, `users/${userId}`);
                                await set(userRef, null); // This effectively removes the data
                            }

                            // Delete user from Firebase Authentication
                            const user = auth.currentUser;
                            if (user) {
                                await deleteUser(user);
                            }

                            // Clear AsyncStorage
                            await AsyncStorage.clear();

                            // Navigate to AuthScreen
                            navigation.replace('AuthScreen');
                        } catch (error) {
                            console.error("Error deleting account:", error);
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert(
                                    "Authentication Required",
                                    "Please sign in again to delete your account.",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => navigation.replace('AuthScreen')
                                        }
                                    ]
                                );
                            } else {
                                Alert.alert(
                                    "Error",
                                    "Failed to delete account. Please try again later."
                                );
                            }
                        }
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <Text style={styles.settingsText}>Settings</Text>

            {/* Profile Button */}
            <TouchableOpacity 
                style={[
                    styles.profileButton,
                    { 
                        backgroundColor: theme.card,
                        borderColor: theme.border 
                    },
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
                <View style={styles.imageAndName}>
                    <View style={styles.profileImageContainer}>
                        <Image 
                            source={userData?.avatarId !== undefined ? avatars[userData.avatarId].image : avatars[0].image} 
                            style={styles.profileImage} 
                        />
                    </View>
                    <Text style={[styles.nameText, { color: theme.text }]}>{userData?.name || 'User'}</Text>
                </View>
                <View style={styles.iconAndText}>
                    <Text style={styles.subText}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={24} color={theme.secondary} />
                </View>
            </TouchableOpacity>

            {/* Dark Mode Button */}
            <View 
                style={[
                    styles.profileButton,
                    { backgroundColor: theme.card },
                    isDarkMode && {
                        shadowColor: undefined,
                        shadowOffset: undefined,
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                    }
                ]}

                onPress={toggleTheme}>
                    <Text style={styles.otherText}>Dark Mode</Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#767577", true: "#A081C3" }}
                        thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
                        style={{ shadowColor: 'black', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 }}
                    />
            </View>

            {/* Privacy Policy & Terms of use */}
            <View style={[
                styles.privacyTermsContainer,
                { backgroundColor: theme.card },
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
                        styles.privacyContainer, 
                        { backgroundColor: theme.subcard },
                        isDarkMode && {
                            shadowColor: undefined,
                            shadowOffset: undefined,
                            shadowOpacity: 0,
                            shadowRadius: 0,
                            elevation: 0,
                        }
                    ]}
                    onPress={() => setIsPrivacyModalVisible(true)}
                >
                    <Text style={styles.otherText}>Privacy Policy</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.privacyContainer, { backgroundColor: theme.subcard }, 
                        isDarkMode && {
                            shadowColor: undefined,
                            shadowOffset: undefined,
                            shadowOpacity: 0,
                            shadowRadius: 0,
                            elevation: 0,
                        }
                    ]}
                    onPress={() => setIsTermsModalVisible(true)}
                >
                    <Text style={styles.otherText}>Terms of use</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
                </TouchableOpacity>
            </View>

            {/* Change password & Delete account */}
            <View style={[
                styles.privacyTermsContainer,
                { backgroundColor: theme.card },
                isDarkMode && {
                    shadowColor: undefined,
                    shadowOffset: undefined,
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    elevation: 0,
                }
            ]}>
                <TouchableOpacity style={[styles.privacyContainer, { backgroundColor: theme.subcard },
                    isDarkMode && {
                        shadowColor: undefined,
                        shadowOffset: undefined,
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                    }
                ]} onPress={handleLogout}>
                    <Text style={styles.otherText}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.privacyContainer, { backgroundColor: theme.subcard }, 
                        isDarkMode && {
                            shadowColor: undefined,
                            shadowOffset: undefined,
                            shadowOpacity: 0,
                            shadowRadius: 0,
                            elevation: 0,
                        }
                    ]} 
                    onPress={() => setIsPasswordModalVisible(true)}
                >
                    <Text style={styles.otherText}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.privacyContainer, { backgroundColor: theme.subcard },
                        isDarkMode && {
                            shadowColor: undefined,
                            shadowOffset: undefined,
                            shadowOpacity: 0,
                            shadowRadius: 0,
                            elevation: 0,
                        }
                    ]}
                    onPress={handleDeleteAccount}
                >
                    <Text style={styles.deleteAccountText}>Delete Account</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
                </TouchableOpacity>
            </View>

            {/* Bottom Icons */}
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
                    onPress={() => navigation.navigate('AddMoodScreen')}
                >
                    <FontAwesome name="plus" size={28} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.icon, 
                        { backgroundColor: theme.primary },
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
                    <Ionicons name="settings" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <ChangeNameModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveName}
                currentName={userData?.name}
                currentAvatarId={userData?.avatarId || '0'}
            />
            <ChangePasswordModal
                visible={isPasswordModalVisible}
                onClose={() => setIsPasswordModalVisible(false)}
            />
            <PrivacyPolicyModal
                visible={isPrivacyModalVisible}
                onClose={() => setIsPrivacyModalVisible(false)}
            />
            <TermsOfUseModal
                visible={isTermsModalVisible}
                onClose={() => setIsTermsModalVisible(false)}
            />
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.background
    },
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text
    },
    settingsText: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginTop: '12%',
        marginBottom: 20,
        marginLeft: 5,
        color: theme.text
    },
    profileButton: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: theme.border,
        backgroundColor: theme.card,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
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
    profileImageContainer: {
        width: width * 0.175,
        height: width * 0.175,
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
        transform: [{ translateY: 15 }],
    },
    privacyTermsContainer: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: theme.border,
        backgroundColor: theme.card,
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
        borderColor: theme.border,
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
        bottom: width * 0.075,
        flexDirection: 'row',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    icon: {
        width: width * 0.15,
        height: width * 0.15,
        padding: 15,
        backgroundColor: theme.card,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconAndText: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    subText: {
        fontSize: 14,
        color: theme.secondary,
        fontWeight: '400'
    },
    activeIcon: {
        width: width * 0.15,
        height: width * 0.15,
        padding: 15,
        backgroundColor: '#A081C3',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otherText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        marginLeft: 5
    },
    deleteAccountText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#D84950',
        marginLeft: 5
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center'
    }
});