import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function PrivacyPolicyModal({ visible, onClose }) {
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
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Policy</Text>
                    </View>

                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollView}
                    >
                        <Text style={[styles.date, { color: theme.secondary }]}>Effective Date: April 26, 2025</Text>
                        
                        <Text style={[styles.welcome, { color: theme.text }]}>Welcome to FEELIO!</Text>
                        <Text style={[styles.introText, { color: theme.text }]}>
                            Your privacy is important to us. This Privacy Policy explains how FEELIO ("we", "our", or "us") 
                            collects, uses, and protects your information.
                        </Text>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Information We Collect</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                We collect the following types of information when you use FEELIO:
                            </Text>
                            <View style={styles.bulletPoints}>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Email address and password (for account creation, login, and password reset).</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Username and selected avatar.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Mood entries added via the app calendar.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• App preferences such as dark mode settings.</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>2. How We Use Your Information</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                We use your information to:
                            </Text>
                            <View style={styles.bulletPoints}>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Create and manage your FEELIO account.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Allow you to track, edit, and view your mood entries.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Display your chosen username and avatar within the app.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Provide personalized monthly mood statistics.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Improve and optimize the app experience.</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Data Storage and Security</Text>
                            <View style={styles.bulletPoints}>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Your data is securely stored using Firebase Realtime Database, managed by Google Firebase.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• We implement industry-standard security measures to protect your personal data.</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Sharing of Information</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                FEELIO does not sell, trade, or rent your personal information to third parties.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Your Rights</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                Within FEELIO, you can:
                            </Text>
                            <View style={styles.bulletPoints}>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Edit your profile (username and avatar).</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Update your password.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Delete your account at any time.</Text>
                                <Text style={[styles.bulletPoint, { color: theme.text }]}>• Enable or disable dark mode.</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Changes to This Privacy Policy</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                We may update this Privacy Policy from time to time. Changes will be reflected by an updated "Effective Date."
                            </Text>
                        </View>

                        <View style={[styles.section, styles.lastSection]}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Contact Us</Text>
                            <Text style={[styles.sectionText, { color: theme.text }]}>
                                If you have questions about this Privacy Policy, please contact us at sugus.kanyanat@gmail.com
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