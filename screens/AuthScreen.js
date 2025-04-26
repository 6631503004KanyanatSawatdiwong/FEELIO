import React, { useState } from "react";
import {View,TextInput,Text,Alert,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,Image,Modal,ScrollView} from "react-native";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { database, ref, set, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const { width, height } = Dimensions.get('window');
const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsError, setTermsError] = useState(false);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>{isLogin ? "Login" : "Register"}</Text>

          <Image source={require('../assets/FEELIO-splash.png')} style={styles.splashImage} />

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            {isLogin ? (
              <View style={styles.termsContainer}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
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
                <Text style={styles.termsText}>
                  By signing up, you agree to our{" "}
                  <Text 
                    style={styles.termsLink}
                    onPress={() => setShowTermsModal(true)}
                  >
                    Terms of Service and Privacy Policy
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
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchLink}>
                {isLogin ? "Register" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <ScrollView style={styles.termsScrollView}>
              <Text style={styles.termsTitle}>Terms of Service and Privacy Policy</Text>
              <Text style={styles.termsBody}>
              <Text style={styles.termsTopic}>1. Introduction</Text>
                {"\n"}Zody Focus is a space-themed focus timer app designed to help users stay productive by accumulating focus hours and unlocking new planets and companions. We are committed to respecting your privacy and ensuring transparency in how we handle your data.
                {"\n\n"}
                <Text style={styles.termsTopic}>2. Data Collection</Text>
                {"\n"}Users must sign in using their email address and set their own username and password. We collect and store your login credentials and focus statistics, such as accumulated focus time and progress (e.g., unlocked planets or achievements).
                {"\n\n"}
                <Text style={styles.termsTopic}>3. Data Usage</Text>
                {"\n"}The data we collect is used solely for saving your progress and enhancing your experience within the app (e.g., displaying your stats, progress, unlocked companions, and character customization). We do not sell, share, or use your data for third-party marketing purposes.
                {"\n\n"}
                <Text style={styles.termsTopic}>4. Data Storage</Text>
                {"\n"}All user data is securely stored using Firebase. If you wish to delete your data, please contact our team directly.
                {"\n\n"}
                <Text style={styles.termsTopic}>5. Third-Party Services</Text>
                {"\n"}Zody Focus does not use any third-party services that collect user data.
                {"\n\n"}
                <Text style={styles.termsTopic}>6. Core Features</Text>
                {"\n"}Users can start and customize their own focus timer sessions. A statistics page allows users to view their data by year, month, or day. Access to the app is restricted to logged-in users only.
                {"\n\n"}
                <Text style={styles.termsTopic}>7. Progress System</Text>
                {"\n"}Users unlock smaller planets and eventually larger ones based on accumulated focus time. Unlocking a large planet also grants users a floating space companion to accompany them during focus sessions. Additionally, users can collect achievements and customize their personal character within the app.
                {"\n\n"}
                <Text style={styles.termsTopic}>8. Notifications</Text>
                {"\n"}Zody Focus does not currently use any notification system.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: "#f8f7ea",
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  contentWrapper: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#393939",
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
    borderColor: "#ccc",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#A081C3",
    paddingVertical: 10,
    // paddingHorizontal: 25,
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
    color: '#393939',
    fontSize: 16,
  },
  switchLink: {
    color: '#A081C3',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  forgotPassword: {
    color: "#929292",
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
    color: '#575757',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  termsScrollView: {
    marginTop: 10,
  },
  termsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    color: '#151B54',
    fontSize: 16,
  },
  termsBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsTopic: {
    fontWeight: 'bold',
  },
  termsLink: {
    color: '#393939',
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