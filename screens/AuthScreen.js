import React, { useState } from "react";
import {View,TextInput,Text,Alert,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,Image,Modal,ScrollView,StatusBar,SafeAreaView} from "react-native";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { database, ref, set, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
import PrivacyPolicyModal from './PrivacyPolicyScreen';
import TermsOfUseModal from './TermsOfUseScreen';

const { width, height } = Dimensions.get('window');
const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  const handleAuth = async () => {
    try {
      // Check for empty fields
      if (!email.trim()) {
        Alert.alert("Warning", "Please enter your email address");
        return;
      }
      if (!password.trim()) {
        Alert.alert("Warning", "Please enter your password");
        return;
      }

      if (!isLogin && !isChecked) {
        setTermsError(true);
        return;
      }
      setTermsError(false);
      setLoading(true);
      const auth = getAuth();

      if (isLogin) {
        // Login logic
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          
          // Check if user has completed character setup
          const userRef = ref(database, 'users/' + userCredential.user.uid);
          onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.avatarId !== undefined && userData.name !== undefined) {
              // User has completed character setup, go to HomeScreen
              AsyncStorage.setItem('userId', userCredential.user.uid);
              navigation.navigate("HomeScreen");
            } else {
              // User hasn't completed character setup, go to CharacterScreen
              navigation.navigate("SetNameScreen");
            }
          }, {
            onlyOnce: true // Only check once
          });
        } catch (error) {
          if (error.code === 'auth/invalid-credential' || 
              error.code === 'auth/invalid-email' || 
              error.code === 'auth/user-not-found' ||
              error.code === 'auth/wrong-password') {
            Alert.alert("Login Failed", "Incorrect email or password");
          } else {
            console.error("Login Error:", error);
            Alert.alert("Login Error", "An error occurred during login. Please try again.");
          }
          return;
        }
      } else {
        // Register logic
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        console.log("UserCredential", userCredential);

        // Save user info to Realtime Database
        const user = userCredential.user;
        const userRef = ref(database, 'users/' + user.uid);
        await set(userRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
        });
        navigation.navigate("SetNameScreen");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      Alert.alert("Authentication Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      return Alert.alert("Error", "Please enter your email first.");
    }
  
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Reset Email Sent", "Check your email to reset your password.");
    } catch (error) {
      console.error("Reset Password Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar 
        backgroundColor={theme.background}
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{isLogin ? "Login" : "Register"}</Text>
        </View>

        <Image source={require('../assets/FEELIO-splash.png')} style={styles.splashImage} />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { color: theme.text }]}
            placeholderTextColor={theme.secondary}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { color: theme.text }]}
            placeholderTextColor={theme.secondary}
          />

          {isLogin ? (
            <View style={styles.termsContainer}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={[styles.forgotPassword, { color: theme.secondary }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.termsContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, isChecked && styles.checkedBox]} 
                onPress={() => {
                  setIsChecked(!isChecked);
                  setTermsError(false);
                }}
              >
                {isChecked && <FontAwesomeIcon icon={faCheck} size={12} color="white" />}
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: theme.secondary }]}>
                By signing up, you agree to our{" "}
                <Text 
                  style={[styles.termsLink, { color: theme.text }]}
                  onPress={() => setIsTermsModalVisible(true)}
                >
                  Terms of Service
                </Text>
                {" "}and{" "}
                <Text 
                  style={[styles.termsLink, { color: theme.text }]}
                  onPress={() => setIsPrivacyModalVisible(true)}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          )}

          {!isLogin && termsError && (
            <Text style={styles.errorText}>
              Please accept the Terms of Service and Privacy Policy
            </Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchTextContainer}>
          <Text style={[styles.switchText, { color: theme.text }]}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchLink}>
              {isLogin ? "Register" : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
};

const createStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.background
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: theme.text,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    marginBottom: 15,
    padding: 15,
    fontSize: 16,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.card,
    color: theme.text,
  },
  button: {
    backgroundColor: "#A081C3",
    paddingVertical: 10,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 8,
    alignItems: "center",
    width: '100%',
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchText: {
    textAlign: 'center',
    color: theme.text,
    fontSize: 16,
  },
  switchLink: {
    color: '#A081C3',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  forgotPassword: {
    color: theme.secondary,
    fontSize: 14,
  },
  termsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#A081C3',
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#A081C3',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: theme.secondary,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: theme.card,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
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
  modalScrollView: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoints: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  termsLink: {
    color: theme.text,
    textDecorationLine: 'underline',
  },
  astronaut: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 30,
  },
  smallstar: {
    width: 20,
    height: 20,
    position: "absolute",
    top: '25%',
    left: '25%',
  },
  bigstar: {
    width: 50,
    height: 50,
    position: "absolute",
    top: '35%',
    right: '20%',
  },
  alienleft: {
    width: 60,
    height: 60,
    position: "absolute",
    top: '40%',
    left: '25%',
  },
  alienright: {
    width: 60,
    height: 60,
    position: "absolute",
    top: '20%',
    right: '30%',
  },
  splashImage: {
    width: width*0.5,
    height: width*0.5,
    marginVertical: 10,
  }
});

export default AuthScreen; 