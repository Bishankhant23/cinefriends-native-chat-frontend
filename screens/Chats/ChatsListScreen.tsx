import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Film, MessageSquare } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyTopicsThunk, setActiveTopic } from '../../store/slices/topicSlice';
import { TopicCard } from '../../components/TopicCard';

export const ChatsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { myTopics, isLoading } = useAppSelector((state) => state.topic);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    dispatch(fetchMyTopicsThunk());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyTopicsThunk());
    setRefreshing(false);
  };

  const filteredTopics = myTopics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-darkBg">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
        className="px-5 bg-darkSurface border-b border-border flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-darkElevated border border-khaki/40 rounded-xl items-center justify-center mr-3">
            <Film color="#CBBD93" size={22} />
          </View>
          <View>
            <Text className="text-offWhite font-bold text-xl">CineChat</Text>
            <Text className="text-khaki text-xs font-semibold">CineFriends Chat</Text>
          </View>
        </View>
      </View>

      {/* Search Input Filter */}
      <View className="px-4 py-3 bg-darkBg">
        <View
          style={{
            borderColor: isSearchFocused ? '#CBBD93' : '#2D2B24',
            shadowColor: '#CBBD93',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isSearchFocused ? 0.12 : 0,
            shadowRadius: 6,
            elevation: isSearchFocused ? 2 : 0,
          }}
          className="bg-darkSurface border rounded-xl flex-row items-center px-3.5 py-2.5"
        >
          <Search color={isSearchFocused ? '#CBBD93' : '#706D63'} size={18} />
          <TextInput
            placeholder="Search joined movie topics..."
            placeholderTextColor="#706D63"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{ outlineStyle: 'none' } as any}
            className="flex-1 ml-2.5 text-offWhite text-sm"
          />
        </View>
      </View>

      {/* Movie Topic List (WhatsApp Chat List Style) */}
      {isLoading && myTopics.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#CBBD93" />
        </View>
      ) : filteredTopics.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 bg-darkSurface border border-khaki/20 rounded-full items-center justify-center mb-4">
            <MessageSquare color="#80775C" size={32} />
          </View>
          <Text className="text-offWhite font-bold text-lg text-center">No Movie Topics Joined</Text>
          <Text className="text-gray500 text-xs text-center mt-2 leading-5">
            Search any movie to join its dedicated public chat topic and start discussing with other movie lovers!
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ExploreTopics')}
            className="bg-khaki px-5 py-3 rounded-xl mt-6 shadow-md"
          >
            <Text className="text-darkBg font-bold text-sm">Explore Movie Topics</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTopics}
          keyExtractor={(item) => item.tmdbId.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CBBD93" />
          }
          renderItem={({ item }) => (
            <TopicCard
              topic={item}
              onPress={() => {
                dispatch(setActiveTopic(item));
                navigation.navigate('MovieChat', { tmdbId: item.tmdbId, title: item.title });
              }}
            />
          )}
        />
      )}
    </View>
  );
};
