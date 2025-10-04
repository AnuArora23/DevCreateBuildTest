import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import UserLoginScreen from  "./screens/auth/user/UserLoginScreen"

import UserregisterScreen from './screens/auth/user/UserregisterScreen';
import PractitionerRegisterScreen from "./screens/auth/practitioner/PractitionerRegisterScreen"
import PractitionerLoginScreen from "./screens/auth/practitioner/PractitionerLoginScreen"
import SplashScreen from "./screens/auth/SplashScreen"
import PractitionerHomeScreen from './screens/auth/practitioner/PractitionerHomeScreen';
import UserHomeScreen from './screens/auth/user/UserHomeScreen';
import UserBottomBar from './screens/auth/user/UserBottomBar/UserBottomBar';
import CollectUserDetails from './screens/auth/user/CollectUserDetails';
import UserTherapyState from "./screens/auth/user/UserTherapyState";
// import UserProgressScreen from './screens/auth/user/UserBottomBar/UserProgressScreen';
import UserProfileScreen from './screens/auth/user/UserBottomBar/UserProfileScreen';
import PractitionerUserProfile from './screens/auth/practitioner/PractitionerUserProfile';
import PrePostUserDetails from './screens/auth/practitioner/PrePostUserDetails';
import UserChatScreen from './screens/auth/user/UserBottomBar/UserChatScreen'



const Stack = createNativeStackNavigator()


const AppNavigation = () => {
  return (
    <Stack.Navigator initialRouteName= "PatientLoginPage" screenOptions={{
      headerShown: false
    }}>

        {/* Common Screens */}
        <Stack.Screen name='SplashScreen' component={SplashScreen} />

        {/* ========== PATIENT/USER FLOW ========== */}
        <Stack.Screen name='PatientLoginPage' component={UserLoginScreen} />
        <Stack.Screen name='PatientRegisterPage' component={UserregisterScreen} />
        <Stack.Screen name='PatientHomePage' component={UserHomeScreen} />
        <Stack.Screen name='CollectUserDetailsPage' component={CollectUserDetails} />
        <Stack.Screen name="UserTherapyStatusPage" component={UserTherapyState} />
        <Stack.Screen name='UserProfilePage' component={UserProfileScreen} />
        {/* <Stack.Screen name='UserProgressPage' component={UserProgressScreen} /> */}
        <Stack.Screen name='UserBottomPage' component={UserBottomBar} />
        <Stack.Screen name='UserChatPage' component={UserChatScreen} options={{headerShown:true,
          headerTitle:"Ojas AI",
          headerStyle:{backgroundColor:"#fff"},
          headerTintColor:"#000",
          headerTitleStyle:{fontWeight:"bold"}
        }}/>
        

        {/* ========== PRACTITIONER FLOW ========== */}
        <Stack.Screen name='PractitionerLoginPage' component={PractitionerLoginScreen} />
        <Stack.Screen 
          name='PractitionerRegisterPage' 
          component={PractitionerRegisterScreen}/>
        <Stack.Screen name='PractitionerHomePage' component={PractitionerHomeScreen} />
        <Stack.Screen name='PractitionerUserProfilePage' component={PractitionerUserProfile} />
        <Stack.Screen name='PrePostUserDetailsPage' component={PrePostUserDetails} />

        {/* ========== AI FEATURES ========== */}
        

    </Stack.Navigator>
  )
}

export default AppNavigation

const styles = StyleSheet.create({})