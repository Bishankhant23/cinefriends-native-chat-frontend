import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Send,
  Info,
  Users,
  Film,
  SlidersHorizontal,
  X,
  MessageSquare,
  Clapperboard,
  Video,
  BookOpen,
  Music,
  Sparkles,
  AlertTriangle,
  Eye,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchTopicMessagesThunk,
  addRealtimeMessage,
  ChatMessage,
  leaveTopicThunk,
  clearActiveTopic,
} from '../../store/slices/topicSlice';
import socketClient from '../../services/socketClient';
import { ChatMessageBubble } from '../../components/ChatMessageBubble';
import { MovieInfoModal } from '../../components/MovieInfoModal';

const SUB_TOPICS = [
  { id: 'general', label: 'General', icon: MessageSquare },
  { id: 'acting', label: 'Acting', icon: Clapperboard },
  { id: 'cinematography', label: 'Cinematography', icon: Video },
  { id: 'plot', label: 'Plot & Story', icon: BookOpen },
  { id: 'music', label: 'Music & Sound', icon: Music },
  { id: 'vfx', label: 'VFX & Design', icon: Sparkles },
];

export const MovieChatScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { tmdbId, title } = route.params;
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);

  const currentUser = useAppSelector((state) => state.user.user);
  const { activeMessages, activeTopic, isMessagesLoading } = useAppSelector((state) => state.topic);

  const [inputMessage, setInputMessage] = useState('');
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [subTopic, setSubTopic] = useState('general');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    // 1. Fetch initial message history
    dispatch(fetchTopicMessagesThunk({ tmdbId, subTopic, isSpoiler }));

    // 2. Connect Socket.io & Join room
    const socket = socketClient.connect();
    if (currentUser) {
      socketClient.joinTopicRoom(tmdbId, currentUser.id);
    }

    // 3. Listen for incoming real-time messages
    socketClient.onReceiveMessage((newMsg: ChatMessage) => {
      // Only append message if it matches active filter!
      if (
        (newMsg.subTopic || 'general') === subTopic &&
        Boolean(newMsg.isSpoiler) === isSpoiler
      ) {
        dispatch(addRealtimeMessage(newMsg));
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      if (currentUser) {
        socketClient.leaveTopicRoom(tmdbId, currentUser.id);
      }
      socketClient.offReceiveMessage();
      dispatch(clearActiveTopic());
    };
  }, [tmdbId, currentUser, dispatch, subTopic, isSpoiler]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentUser) return;

    const messageData = {
      tmdbId: Number(tmdbId),
      senderId: currentUser.id,
      content: inputMessage.trim(),
      messageType: 'TEXT',
      subTopic,
      isSpoiler,
    };

    socketClient.sendTopicMessage(messageData);
    setInputMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-darkBg"
    >
      {/* WhatsApp Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }}
        className="px-3 bg-darkSurface border-b border-border flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1 pr-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-xl bg-darkElevated mr-2"
          >
            <ArrowLeft color="#F5F2E9" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setInfoModalVisible(true)}
            className="flex-row items-center flex-1"
          >
            {activeTopic?.poster ? (
              <Image
                source={{
                  uri: activeTopic.poster.startsWith('http')
                    ? activeTopic.poster
                    : `https://image.tmdb.org/t/p/w500${activeTopic.poster}`
                }}
                className="w-10 h-10 rounded-full border border-khaki/40 bg-darkElevated"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-darkElevated items-center justify-center border border-khaki/40">
                <Film color="#CBBD93" size={20} />
              </View>
            )}

            <View className="ml-3 flex-1">
              <Text className="text-offWhite font-bold text-base pr-2" numberOfLines={1}>
                {title || activeTopic?.title || 'Movie Topic Room'}
              </Text>
              <View className="flex-row items-center flex-wrap">
                <View className="flex-row items-center mr-2.5">
                  <Users size={11} color="#CBBD93" />
                  <Text className="text-gray400 text-xs ml-1">
                    {activeTopic?.memberCount || 1}
                  </Text>
                </View>
                <View className="flex-row items-center bg-darkElevated border border-khaki/20 px-1.5 py-0.5 rounded-md">
                  <Text className="text-[10px] font-bold text-khaki uppercase">
                    {SUB_TOPICS.find((t) => t.id === subTopic)?.label || 'General'}
                  </Text>
                  <Text className={`text-[10px] font-bold ml-1.5 ${isSpoiler ? 'text-[#EF4444]' : 'text-gray400'}`}>
                    {isSpoiler ? 'Spoiler' : 'Safe'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setInfoModalVisible(true)}
          className="p-2.5 rounded-xl bg-darkElevated border border-border"
        >
          <Info color="#CBBD93" size={20} />
        </TouchableOpacity>
      </View>

      {/* Messages Feed */}
      {isMessagesLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#CBBD93" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={activeMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => (
            <ChatMessageBubble message={item} isSelf={item.senderId === currentUser?.id} />
          )}
        />
      )}

      {/* WhatsApp Message Input Bar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 12, paddingHorizontal: 12 }}
        className="bg-darkSurface border-t border-border flex-row items-center"
      >
        <View
          style={
            isInputFocused
              ? {
                  shadowColor: '#CBBD93',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  elevation: 2,
                  borderColor: '#CBBD93',
                }
              : { borderColor: '#2D2B24' }
          }
          className="flex-1 bg-darkElevated border rounded-2xl flex-row items-center px-4 py-2 mr-2"
        >
          <TextInput
            placeholder={`Msg ${isSpoiler ? '[Spoilers]' : '[Spoiler-Free]'} in #${
              SUB_TOPICS.find((t) => t.id === subTopic)?.label || 'General'
            }...`}
            placeholderTextColor="#706D63"
            value={inputMessage}
            onChangeText={setInputMessage}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            multiline
            style={{ outline: 'none', color: '#F5F2E9' } as any}
            className="flex-1 text-offWhite text-base max-h-24"
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setFilterDrawerVisible(true)}
          className={`w-12 h-12 rounded-2xl items-center justify-center bg-darkElevated border mr-2 transition-all ${
            isInputFocused ? 'border-border' : 'border-border/60'
          }`}
        >
          <SlidersHorizontal color="#CBBD93" size={20} />
        </TouchableOpacity>

        {/* Send Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSendMessage}
          disabled={!inputMessage.trim()}
          className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg ${
            inputMessage.trim() ? 'bg-khaki' : 'bg-darkElevated border border-border'
          }`}
        >
          <Send color={inputMessage.trim() ? '#0F0E0B' : '#706D63'} size={20} />
        </TouchableOpacity>
      </View>

      {/* Filter Drawer Modal (Bottom Sheet style) */}
      <Modal
        visible={filterDrawerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterDrawerVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFilterDrawerVisible(false)}
          className="flex-1 bg-black/75 justify-end"
        >
          {/* Prevent taps inside drawer from closing the modal */}
          <TouchableOpacity
            activeOpacity={1}
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="bg-darkSurface border-t border-border rounded-t-3xl px-5 pt-5"
          >
            {/* Handle Bar */}
            <View className="w-12 h-1 bg-border rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-offWhite font-bold text-lg">Movie Chat Filters</Text>
              <TouchableOpacity
                onPress={() => setFilterDrawerVisible(false)}
                className="bg-darkElevated p-2 rounded-full border border-border"
              >
                <X color="#F5F2E9" size={16} />
              </TouchableOpacity>
            </View>

            {/* Spoiler Toggles */}
            <Text className="text-[#CBBD93] text-xs font-bold uppercase tracking-wider mb-2.5">Spoiler Filter</Text>
            <View className="flex-row bg-darkBg border border-border p-1 rounded-xl mb-6">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsSpoiler(false)}
                className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${!isSpoiler ? 'bg-khaki' : ''}`}
              >
                <Eye
                  size={14}
                  color={!isSpoiler ? '#0F0E0B' : '#706D63'}
                  style={{ marginRight: 6 }}
                />
                <Text className={`text-sm font-bold ${!isSpoiler ? 'text-darkBg' : 'text-gray500'}`}>
                  Spoiler-Free
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsSpoiler(true)}
                className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${isSpoiler ? 'bg-danger' : ''}`}
              >
                <AlertTriangle
                  size={14}
                  color={isSpoiler ? 'white' : '#706D63'}
                  style={{ marginRight: 6 }}
                />
                <Text className={`text-sm font-bold ${isSpoiler ? 'text-white' : 'text-gray500'}`}>
                  Spoilers
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sub-Topics Selector */}
            <Text className="text-[#CBBD93] text-xs font-bold uppercase tracking-wider mb-2.5">Topic Channels</Text>
            <View className="flex-row flex-wrap justify-between">
              {SUB_TOPICS.map((topic) => {
                const isSelected = subTopic === topic.id;
                const IconComponent = topic.icon;
                return (
                  <TouchableOpacity
                    key={topic.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSubTopic(topic.id);
                      setFilterDrawerVisible(false);
                    }}
                    style={{ width: '48%' }}
                    className={`py-3 px-4 rounded-xl mb-3 border flex-row items-center justify-between ${
                      isSelected
                        ? 'bg-khaki/10 border-khaki'
                        : 'bg-darkElevated border-border/60'
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <IconComponent
                        size={16}
                        color={isSelected ? '#CBBD93' : '#706D63'}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected ? 'text-khaki font-bold' : 'text-gray400'
                        }`}
                      >
                        {topic.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="w-2 h-2 rounded-full bg-khaki" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Movie Details Modal */}
      <MovieInfoModal
        visible={infoModalVisible}
        topic={activeTopic}
        onClose={() => setInfoModalVisible(false)}
        onLeaveTopic={async () => {
          setInfoModalVisible(false);
          await dispatch(leaveTopicThunk(tmdbId));
          navigation.goBack();
        }}
      />
    </KeyboardAvoidingView>
  );
};
