import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import ChangeNameModal from './ChangeNameModal';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function SettingsScreen() {
    const navigation = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState('username');

    const handleSaveName = (newName) => {
        setUsername(newName);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.settingsText}>Settings Screen</Text>

            {/* Profile Button */}
            <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => setIsModalVisible(true)}
            >
                <View style={styles.imageAndName}>
                    <Image source={require('../assets/ProfileImages/profileImage.jpg')} style={styles.profileImage} />
                    <Text style={styles.nameText}>{username}</Text>
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
        bottom: '5%',
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
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIcon: {
        width: width * 0.17,
        height: width * 0.17,
        padding: 15,
        backgroundColor: 'black',
        borderRadius: 15,
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
    }
});