import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Film, Flame, MessageSquare } from 'lucide-react-native';
import { useAppDispatch } from '../../store/hooks';
import {
  joinTopicThunk,
  setActiveTopic,
  Topic,
} from '../../store/slices/topicSlice';
import SearchInput from '../../components/SearchInput';
import CustomTabs, { TabItem } from '../../components/CustomTabs';
import MovieItem from '../../components/MovieItem';
import UserItem from '../../components/UserItem';
import { TopicCard } from '../../components/TopicCard';
import CustomFlatListPagePagination from '../../components/CustomFlatListPagePagination';
import Skeleton from '../../components/skeletons/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { UserItemData } from '../../services/userService';

const SEARCH_TABS: TabItem[] = [
  { id: 'movies', label: 'MOVIES' },
  { id: 'users', label: 'USERS' },
  { id: 'discussions', label: 'DISCUSSIONS' },
];

export const ExploreTopicsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('movies');

  const debouncedQuery = useDebounce(searchQuery, 400);

  const handleJoinAndEnter = async (rawTopic: any) => {
    const topic: Topic = {
      tmdbId: rawTopic.tmdbId || rawTopic.id,
      title: rawTopic.title,
      poster: rawTopic.poster || (rawTopic.poster_path ? `https://image.tmdb.org/t/p/w500${rawTopic.poster_path}` : undefined),
      backdrop: rawTopic.backdrop || (rawTopic.backdrop_path ? `https://image.tmdb.org/t/p/w1280${rawTopic.backdrop_path}` : undefined),
      overview: rawTopic.overview,
      releaseYear: rawTopic.releaseYear || (rawTopic.release_date ? rawTopic.release_date.split('-')[0] : ''),
    };

    await dispatch(joinTopicThunk(topic));
    dispatch(setActiveTopic(topic));
    navigation.navigate('MovieChat', { tmdbId: topic.tmdbId, title: topic.title });
  };

  const getPlaceholder = () => {
    if (activeTab === 'movies') return 'Search any movie to join topic...';
    if (activeTab === 'users') return 'Search cinephiles...';
    return 'Search discussions / movie topics...';
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0F0E0B',
        paddingTop: Platform.OS === 'web' ? 20 : Math.max(insets.top, 12),
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F0E0B" />

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Navigation & Search Bar Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                padding: 10,
                borderRadius: 12,
                backgroundColor: '#1C1B17',
                borderWidth: 1,
                borderColor: '#2D2B24',
                marginRight: 10,
              }}
            >
              <ArrowLeft color="#F5F2E9" size={20} />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }}>
            <SearchInput
              placeholder={getPlaceholder()}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Custom Tabs (MOVIES / USERS / DISCUSSIONS) */}
        <CustomTabs
          tabs={SEARCH_TABS}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          containerClassName="mb-3"
        />

        {/* Section Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Flame color="#CBBD93" size={18} />
            <Text style={{ color: '#F5F2E9', fontWeight: 'bold', fontSize: 14, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {debouncedQuery.trim()
                ? 'Search Results'
                : activeTab === 'movies'
                  ? 'Trending Movie Topics'
                  : activeTab === 'users'
                    ? 'Suggested Cinephiles'
                    : 'Trending Discussions'}
            </Text>
          </View>
        </View>

        {/* Tab Content using CustomFlatListPagePagination */}
        {activeTab === 'movies' ? (
          <CustomFlatListPagePagination<Topic>
            key={`movies-${debouncedQuery}`}
            apiUrl={debouncedQuery.trim() ? '/movies/search' : '/movies/trending'}
            queryParams={debouncedQuery.trim() ? { query: debouncedQuery.trim() } : {}}
            pageSize={20}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            keyExtractor={(item, idx) => (item.id || item.tmdbId.toString()) + `-${idx}`}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
                <Film color="#706D63" size={48} />
                <Text style={{ color: '#A39B8A', fontSize: 14, marginTop: 12, textAlign: 'center' }}>
                  No movies found for "{searchQuery}". Try searching another title!
                </Text>
              </View>
            }
            renderSkeletonItem={() => (
              <View style={{ width: '31%', marginBottom: 16 }}>
                <Skeleton width="100%" height={140} borderRadius={12} style={{ marginBottom: 6 }} />
                <Skeleton width="80%" height={12} borderRadius={4} />
              </View>
            )}
            renderItem={({ item }) => (
              <View style={{ width: '31%' }}>
                <MovieItem
                  title={item.title}
                  poster={item.poster || (item as any).poster_path || (item as any).posterPath || item.backdrop || (item as any).backdrop_path || ''}
                  onPress={() => handleJoinAndEnter(item)}
                />
              </View>
            )}
          />
        ) : activeTab === 'users' ? (
          <CustomFlatListPagePagination<UserItemData>
            key={`users-${debouncedQuery}`}
            apiUrl="/auth/users/search"
            queryParams={{ query: debouncedQuery.trim() }}
            dataKey="items"
            pageSize={20}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
                <Text style={{ color: '#A39B8A', fontSize: 14, textAlign: 'center' }}>
                  No cinephiles found matching "{searchQuery}".
                </Text>
              </View>
            }
            renderSkeletonItem={() => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  marginBottom: 8,
                  backgroundColor: '#1C1B17',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2D2B24',
                }}
              >
                <Skeleton width={44} height={44} borderRadius={22} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Skeleton width="50%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                  <Skeleton width="30%" height={11} borderRadius={4} />
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <UserItem
                userId={item.id}
                name={item.name || item.username}
                username={item.username}
                profilePic={item.profilePic}
              />
            )}
          />
        ) : (
          <CustomFlatListPagePagination<Topic>
            key={`discussions-${debouncedQuery}`}
            apiUrl="/topics/explore"
            queryParams={debouncedQuery.trim() ? { query: debouncedQuery.trim() } : {}}
            dataKey="topics"
            pageSize={20}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyExtractor={(item, idx) => (item.id || item.tmdbId.toString()) + `-${idx}`}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
                <MessageSquare color="#706D63" size={48} />
                <Text style={{ color: '#A39B8A', fontSize: 14, marginTop: 12, textAlign: 'center' }}>
                  {debouncedQuery.trim()
                    ? `No discussions found for "${searchQuery}".`
                    : 'No active backend discussions yet.'}
                </Text>
                <Text style={{ color: '#706D63', fontSize: 12, marginTop: 6, textAlign: 'center', paddingHorizontal: 32 }}>
                  Join a movie topic in the MOVIES tab to start the first discussion!
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveTab('movies')}
                  style={{
                    backgroundColor: '#CBBD93',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                    marginTop: 16,
                  }}
                >
                  <Text style={{ color: '#0F0E0B', fontWeight: 'bold', fontSize: 13 }}>
                    Browse Movie Topics
                  </Text>
                </TouchableOpacity>
              </View>
            }
            renderSkeletonItem={() => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  marginBottom: 8,
                  backgroundColor: '#1C1B17',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(45,43,36,0.6)',
                }}
              >
                <Skeleton width={56} height={56} borderRadius={8} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <Skeleton width="65%" height={15} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width="90%" height={12} borderRadius={4} />
                </View>
                <Skeleton width={48} height={24} borderRadius={8} style={{ marginLeft: 8 }} />
              </View>
            )}
            renderItem={({ item }) => (
              <TopicCard
                topic={item}
                isExplore={true}
                onPress={() => handleJoinAndEnter(item)}
                onJoinPress={() => handleJoinAndEnter(item)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};
