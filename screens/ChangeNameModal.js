import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Dimensions, FlatList, Image, Alert } from 'react-native';
import { database, ref, update } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
const { width, height } = Dimensions.get('window');

const avatars = [
    { id: '0', image: require('../assets/ProfileImages/yellowMan.png') },
    { id: '1', image: require('../assets/ProfileImages/pinkMan.png') },
];

export default function ChangeNameModal({ visible, onClose, onSave, currentName, currentAvatarId }) {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const styles = createStyles(theme);
    const [name, setName] = useState(currentName || '');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId || '0');

    useEffect(() => {
        setName(currentName || '');
        setSelectedAvatarId(currentAvatarId || '0');
    }, [currentName, currentAvatarId]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const updates = {};
            if (name !== currentName) {
                updates['name'] = name;
            }
            if (selectedAvatarId !== currentAvatarId) {
                updates['avatarId'] = selectedAvatarId;
            }

            if (Object.keys(updates).length > 0) {
                const userRef = ref(database, `users/${userId}`);
                await update(userRef, updates);
            }

            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const renderAvatar = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.avatarContainer,
                selectedAvatarId === item.id && styles.selectedAvatar
            ]}
            onPress={() => setSelectedAvatarId(item.id)}
        >
            <Image source={item.image} style={styles.avatarImage} />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.avatarSection}>
                        <FlatList
                            data={avatars}
                            renderItem={renderAvatar}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.avatarList}
                        />
                    </View>

                    <View style={styles.nameSection}>
                        {isEditing ? (
                            <TextInput
                                style={[
                                    styles.input,
                                    { 
                                        color: theme.text,
                                    }
                                ]}
                                value={name}
                                onChangeText={setName}
                                placeholder={currentName}
                                autoFocus={true}
                            />
                        ) : (
                            <View style={styles.nameContainer}>
                                <Text style={[styles.nameText, { color: theme.text }]}>{name}</Text>
                                <TouchableOpacity 
                                    onPress={() => setIsEditing(true)}
                                    style={[styles.editButton, { color: theme.text }]}
                                >
                                    <Feather name="edit-3" size={16} color="#666" style={{ bottom: -3 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.saveButton]} 
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const createStyles = (theme) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 25,
        width: width * 0.9,
        maxHeight: height * 0.8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    avatarSection: {
        marginBottom: 20,
    },
    avatarList: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        width: '100%',
    },
    avatarContainer: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginHorizontal: 10,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    selectedAvatar: {
        borderColor: '#A081C3',
    },
    avatarImage: {
        width: width * 0.3,
        height: width * 0.3,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: width * 0.125,
        borderWidth: 3,
        borderColor: 'transparent',
        padding: 10,
    },
    nameSection: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'center',
        minWidth: 100,
        marginVertical: 5,
        marginLeft: 10,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '500',
        textAlign: 'center',
    },
    editButton: {
        // // padding: 8,
        // borderRadius: 20,
        // backgroundColor: 'red',
    },
    input: {
        fontSize: 22,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginVertical: 5,
        // backgroundColor: '#f8f7ea',
        borderRadius: 20,
        minWidth: 100,
        textAlign: 'center',
        fontWeight: '500',
        color: theme.text,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
    },
    button: {
        paddingVertical: 10,
        // paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '45%',
    },
    cancelButton: {
        backgroundColor: '#929292',
    },
    saveButton: {
        backgroundColor: '#A081C3',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
