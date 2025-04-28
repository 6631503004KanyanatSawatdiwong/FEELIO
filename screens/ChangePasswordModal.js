import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Dimensions, Modal } from 'react-native';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function ChangePasswordModal({ visible, onClose }) {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const styles = createStyles(theme);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            setIsLoading(true);
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
            onClose();
        } catch (error) {
            console.error("Error sending reset email:", error);
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
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
                        <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Change Password</Text>
                    </View>

                    <Text style={styles.description}>
                        Enter your email address to receive a password reset link
                    </Text>

                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.secondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
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
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            <Text style={styles.saveButtonText}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Text>
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
        width: width * 0.85,
        backgroundColor: theme.card,
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
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
    },
    description: {
        fontSize: 14,
        color: theme.text,
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        color: theme.text,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        // paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#A081C3',
    },
    cancelButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        alignSelf: 'flex-end',
    }
}); 