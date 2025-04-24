import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function HomeScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.profileButton} onPress={() => navigation.replace('ProfileScreen')}>
                <Image source={require('../assets/ProfileImages/profileImage.jpg')} style={styles.profileImage} />
                <Text style={styles.nameText}>username</Text>
            </TouchableOpacity>

            <Text>Home Screen</Text>


            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.activeIcon} onPress={() => navigation.replace('HomeScreen')}>
                    <FontAwesome5 name="home" size={28} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.replace('AddMoodScreen')}>
                    <FontAwesome name="plus" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.replace('SettingsScreen')}>
                    <Ionicons name="settings" size={28} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f7ea'
    }, 
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000'
    },
    profileButton: {
        position: 'absolute',
        top: '10%',
        left: '5%',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#e1e1e1',
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    profileImage: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: 999
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
    }
});