import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function TermsOfUseModal({ visible, onClose }) {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={[styles.closeButtonText, { color: theme.modalbutton }]}>Close</Text>
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Terms of Use</Text>
        </View>

                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollView}
                    >
                        <Text style={[styles.date, { color: theme.secondary }]}>Effective Date: April 26, 2025</Text>
                        
                        <Text style={[styles.welcome, { color: theme.text }]}>Welcome to FEELIO!</Text>
                        <Text style={[styles.introText, { color: theme.text }]}>
                            By using our app, you agree to these Terms of Use. Please read them carefully.
                        </Text>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance of Terms</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                By accessing or using FEELIO, you agree to be bound by these Terms of Use.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>2. User Accounts</Text>
                            <View style={styles.bulletPoints}>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• To use FEELIO, you must register with a valid email address and password.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• You are responsible for maintaining the confidentiality of your account credentials.</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>3. App Usage</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                When using FEELIO, you can:
                            </Text>
                            <View style={styles.bulletPoints}>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Select an avatar and username.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Add and edit moods linked to specific calendar days.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• View monthly mood statistics.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Manage profile settings (edit profile, enable/disable dark mode, change password, delete account).</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>4. User Content</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                You are responsible for all information you upload or input into FEELIO, including mood entries and profile information.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Account Termination</Text>
                            <View style={styles.bulletPoints}>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• You may delete your account at any time from within the app.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Deleting your account will permanently erase all associated data from our database.</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Limitation of Liability</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                FEELIO is provided "as is" without any warranties. We are not liable for any damages arising from your use of the app.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Changes to Terms</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                We may modify these Terms of Use at any time. Updated terms will become effective once posted.
                            </Text>
                        </View>

                        <View style={[styles.section, styles.lastSection]}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Contact Us</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                For any questions regarding these Terms, please contact us at sugus.kanyanat@gmail.com
                            </Text>
                        </View>
                    </ScrollView>
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
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        maxHeight: '80%',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 10,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    date: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center'
    },
    welcome: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10
    },
    introText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20
    },
    section: {
        marginBottom: 24
    },
    lastSection: {
        marginBottom: 40
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 8
    },
    bulletPoints: {
        marginLeft: 8
    },
    bulletPoint: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 4
    }
});