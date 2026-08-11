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
import socketClient from './services/socketClient';
import { updateTopicLastMessage } from './store/slices/topicSlice';

const queryClient = new QueryClient();

function AppInner() {
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, user } = useAppSelector((state) => state.user);
  const { activeTopic, activeSubTopic } = useAppSelector((state) => state.topic);

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = socketClient.connect();
      socketClient.registerUser(user.id);

      socket.on('topic_updated', (data: {
        tmdbId: number;
        lastMessage: string;
        lastMessageAt: string;
        senderId: string;
        subTopic?: string;
      }) => {
        dispatch(
          updateTopicLastMessage({
            tmdbId: data.tmdbId,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt,
            senderId: data.senderId,
            currentUserId: user.id,
            isActiveTopic: activeTopic?.tmdbId === data.tmdbId,
            subTopic: data.subTopic,
            activeSubTopic: activeSubTopic,
          })
        );
      });

      return () => {
        socket.off('topic_updated');
      };
    }
  }, [isAuthenticated, user, activeTopic, activeSubTopic, dispatch]);

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
