import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddMoodScreen from './screens/AddMoodScreen';
import SettingsScreen from './screens/SettingsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsOfUseScreen from './screens/TermsOfUseScreen';

const Stack = createStackNavigator();

const noAnimationConfig = {
  animation: 'none',
  config: {
    duration: 0,
  },
};

export default function App() {
  return (
    <NavigationContainer>
        {/* <StatusBar barStyle="light-content" backgroundColor="transparent" translucent /> */}
        <Stack.Navigator 
          initialRouteName="AuthScreen" 
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: false,
            transitionSpec: {
              open: noAnimationConfig,
              close: noAnimationConfig,
            },
            cardStyleInterpolator: () => ({
              cardStyle: {
                transform: [{ translateX: 0 }],
              },
            }),
          }}>
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="AddMoodScreen" component={AddMoodScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfUseScreen" component={TermsOfUseScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
