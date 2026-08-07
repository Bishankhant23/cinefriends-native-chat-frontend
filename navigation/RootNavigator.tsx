import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/hooks';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { MovieChatScreen } from '../screens/MovieChat/MovieChatScreen';
import { ExploreTopicsScreen } from '../screens/Explore/ExploreTopicsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated } = useAppSelector((state) => state.user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="MovieChat" component={MovieChatScreen} />
          <Stack.Screen name="ExploreTopics" component={ExploreTopicsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
