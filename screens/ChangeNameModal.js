import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Dimensions, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function ChangeNameModal({ visible, onClose, onSave }) {
    const [newName, setNewName] = useState('');

    const handleSave = () => {
        if (newName.trim()) {
            onSave(newName);
            setNewName('');
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <Image source={require('../assets/ProfileImages/profileImage.jpg')} style={styles.profileImage} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>username</Text>
                    </View>
                    <Text style={styles.emailTitle}>user@gmail.com</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter new username"
                        value={newName}
                        onChangeText={setNewName}
                        autoFocus={true}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.saveButton]} 
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        alignItems: 'center',
        // marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    emailTitle: {
        alignSelf: 'center',
        fontSize: 16,
        fontWeight: '500',
        color: '#6D6D6D',
        marginBottom: 20,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e1e1e1',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#000000',
    },
    cancelButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    profileImage: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: 999,
        alignSelf: 'center',
        marginBottom: 15
    },
    closeButton: {
        alignSelf: 'flex-end',
    }
});
