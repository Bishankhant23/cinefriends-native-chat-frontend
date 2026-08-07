import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuthThunk } from './store/slices/userSlice';
import { RootNavigator } from './navigation/RootNavigator';

const queryClient = new QueryClient();

function AppInner() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0E0B', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#CBBD93" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0F0E0B" />
      <View style={{ flex: 1, backgroundColor: '#0F0E0B' }}>
        <RootNavigator />
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppInner />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}
