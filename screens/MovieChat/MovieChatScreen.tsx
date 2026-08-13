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
  RefreshControl,
  Pressable,
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
  fetchOlderMessagesThunk,
  fetchReplyContextThunk,
  addRealtimeMessage,
  ChatMessage,
  leaveTopicThunk,
  clearActiveTopic,
  setActiveSubTopic,
  markSubTopicAsRead,
} from '../../store/slices/topicSlice';
import socketClient from '../../services/socketClient';
import { ChatMessageBubble } from '../../components/ChatMessageBubble';
import { MovieInfoModal } from '../../components/MovieInfoModal';
import { ParentMessageModal } from '../../components/ParentMessageModal';

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

  const contentHeightRef = useRef(0);
  const prevHeightRef = useRef(0);
  const currentScrollOffsetRef = useRef(0);
  const shouldAdjustScrollRef = useRef(false);
  const ignoreScrollTriggerRef = useRef(false);

  const currentUser = useAppSelector((state) => state.user.user);
  const { activeMessages, activeTopic, isMessagesLoading, myTopics } = useAppSelector((state) => state.topic);
  const currentTopicInList = myTopics.find((t) => t.tmdbId === Number(tmdbId));

  const [inputMessage, setInputMessage] = useState('');
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [subTopic, setSubTopic] = useState('general');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // States for context loading and parent preview modal
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [parentModalVisible, setParentModalVisible] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<ChatMessage | null>(null);

  const handlePressParent = async (replyToId: string) => {
    // Prevent triggering handleLoadMore when scrolling programmatically
    ignoreScrollTriggerRef.current = true;

    // 1. Check if the parent message is already loaded locally
    const index = activeMessages.findIndex((m) => m.id === replyToId);
    if (index !== -1) {
      setHighlightedMessageId(replyToId);
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
      setTimeout(() => {
        ignoreScrollTriggerRef.current = false;
      }, 1000);
      return;
    }

    // 2. Fetch context slice from backend
    if (isContextLoading) {
      ignoreScrollTriggerRef.current = false;
      return;
    }
    setIsContextLoading(true);

    try {
      const oldestMessage = activeMessages[0];
      const resultAction = await dispatch(
        fetchReplyContextThunk({
          tmdbId: Number(tmdbId),
          replyToId,
          before: oldestMessage?.createdAt,
          subTopic,
          isSpoiler,
        })
      );

      if (fetchReplyContextThunk.fulfilled.match(resultAction)) {
        const { messages, tooFar, parentMessage } = resultAction.payload;
        if (!tooFar && messages && messages.length > 0) {
          const indexInPrepended = messages.findIndex((m: ChatMessage) => m.id === replyToId);
          if (indexInPrepended !== -1) {
            setHighlightedMessageId(replyToId);
            // Give FlatList a frame to register layout update
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: indexInPrepended,
                animated: true,
                viewPosition: 0.5,
              });
              setTimeout(() => {
                ignoreScrollTriggerRef.current = false;
              }, 1000);
            }, 100);
          } else {
            ignoreScrollTriggerRef.current = false;
          }
        } else {
          // If too far or no messages, open the parent preview modal
          setPreviewMessage(parentMessage);
          setParentModalVisible(true);
          ignoreScrollTriggerRef.current = false;
        }
      } else {
        ignoreScrollTriggerRef.current = false;
      }
    } catch (err) {
      console.error('Failed to load parent message context:', err);
      ignoreScrollTriggerRef.current = false;
    } finally {
      setIsContextLoading(false);
    }
  };

  // Scroll to bottom once after initial messages finish loading
  useEffect(() => {
    if (!isMessagesLoading && activeMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }
  }, [isMessagesLoading]);

  useEffect(() => {
    // Reset paging state on channel/topic filter change
    setHasMore(true);

    // Update active subtopic in Redux and reset locally
    dispatch(setActiveSubTopic(subTopic));
    dispatch(markSubTopicAsRead({ tmdbId: Number(tmdbId), subTopic }));

    // 1. Fetch initial message history
    const fetchInitial = async () => {
      const resultAction = await dispatch(fetchTopicMessagesThunk({ tmdbId, subTopic, isSpoiler }));
      if (fetchTopicMessagesThunk.fulfilled.match(resultAction)) {
        setHasMore(resultAction.payload.hasMore ?? false);
      }
    };
    fetchInitial();

    // 2. Connect Socket.io & Join room
    const socket = socketClient.connect();
    if (currentUser) {
      socketClient.joinTopicRoom(tmdbId, currentUser.id, subTopic);
    }

    // 3. Listen for incoming real-time messages
    socketClient.onReceiveMessage((newMsg: ChatMessage) => {
      if (newMsg.senderId === currentUser?.id) {
        setIsSending(false);
      }

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

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || activeMessages.length === 0) return;

    setIsLoadingMore(true);
    const oldestMessage = activeMessages[0];
    if (oldestMessage) {
      // Record current content height before adding new messages
      prevHeightRef.current = contentHeightRef.current;
      shouldAdjustScrollRef.current = true;

      try {
        const resultAction = await dispatch(
          fetchOlderMessagesThunk({
            tmdbId: Number(tmdbId),
            subTopic,
            isSpoiler,
            before: oldestMessage.createdAt,
          })
        );

        if (fetchOlderMessagesThunk.fulfilled.match(resultAction)) {
          const apiHasMore = resultAction.payload.hasMore;
          setHasMore(apiHasMore ?? false);
        } else {
          shouldAdjustScrollRef.current = false;
        }
      } catch (error) {
        console.error('Failed to load older messages:', error);
        shouldAdjustScrollRef.current = false;
      }
    } else {
      shouldAdjustScrollRef.current = false;
    }
    setIsLoadingMore(false);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentUser || isSending) return;

    setIsSending(true);

    console.log('DEBUG: handleSendMessage called', {
      inputMessage,
      replyingTo,
      replyToId: replyingTo?.id || null,
      replyToUser: replyingTo?.sender?.username || null,
      replyToContent: replyingTo?.content || null,
    });

    const messageData = {
      tmdbId: Number(tmdbId),
      senderId: currentUser.id,
      content: inputMessage.trim(),
      messageType: 'TEXT',
      subTopic,
      isSpoiler,
      replyToId: replyingTo?.id || null,
      replyToUser: replyingTo?.sender?.username || null,
      replyToContent: replyingTo?.content || null,
    };

    socketClient.sendTopicMessage(messageData);
    setInputMessage('');
    setReplyingTo(null);

    // Fallback timeout to reset sending state
    setTimeout(() => {
      setIsSending(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-darkBg"
    >
      <Pressable
        onPress={() => {
          if (highlightedMessageId) {
            setHighlightedMessageId(null);
          }
        }}
        className="flex-1"
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
          extraData={highlightedMessageId}
          contentContainerStyle={{ paddingVertical: 12 }}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingMore}
              onRefresh={handleLoadMore}
              colors={['#CBBD93']}
              tintColor="#CBBD93"
            />
          }
          ListHeaderComponent={
            isLoadingMore ? (
              <View className="py-4 items-center justify-center">
                <ActivityIndicator size="small" color="#CBBD93" />
              </View>
            ) : null
          }
          onScroll={(event) => {
            const { contentOffset } = event.nativeEvent;
            currentScrollOffsetRef.current = contentOffset.y;

            if (ignoreScrollTriggerRef.current) {
              return;
            }

            if (
              contentOffset.y <= 10 &&
              !isLoadingMore &&
              hasMore &&
              !isMessagesLoading &&
              activeMessages.length >= 10
            ) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={16}
          onContentSizeChange={(w, h) => {
            const prevHeight = contentHeightRef.current;
            contentHeightRef.current = h;

            if (shouldAdjustScrollRef.current && prevHeight > 0) {
              const diff = h - prevHeight;
              if (diff > 0) {
                flatListRef.current?.scrollToOffset({
                  offset: currentScrollOffsetRef.current + diff,
                  animated: false,
                });
              }
              shouldAdjustScrollRef.current = false;
            }
          }}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 50));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.5,
              });
            });
          }}
          renderItem={({ item }) => (
            <ChatMessageBubble
              message={item}
              isSelf={item.senderId === currentUser?.id}
              onLongPress={() => setReplyingTo(item)}
              onPressParent={handlePressParent}
              highlighted={highlightedMessageId === item.id}
            />
          )}
        />
      )}

      {/* WhatsApp Message Input Bar Container */}
      <View className="bg-darkSurface border-t border-border">
        {/* Reply Preview Bar */}
        {replyingTo && (
          <View className="flex-row items-center justify-between px-4 py-2.5 bg-[#1C1A16] border-b border-[#2E2C26]">
            <View className="border-l-2 border-[#CBBD93] pl-2.5 flex-1 pr-4">
              <Text className="text-[#CBBD93] font-bold text-[10px] uppercase tracking-wider">
                Replying to @{replyingTo.sender?.username || 'CineFriend'}
              </Text>
              <Text className="text-[#9C988F] text-xs mt-0.5" numberOfLines={1}>
                {replyingTo.content}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setReplyingTo(null)}
              className="p-1 rounded-full bg-darkElevated border border-border"
            >
              <X color="#F5F2E9" size={12} />
            </TouchableOpacity>
          </View>
        )}
 
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 12, paddingHorizontal: 12 }}
          className="flex-row items-center"
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
          disabled={!inputMessage.trim() || isSending}
          className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg ${
            inputMessage.trim() && !isSending ? 'bg-khaki' : 'bg-darkElevated border border-border'
          }`}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#0F0E0B" />
          ) : (
            <Send color={inputMessage.trim() ? '#0F0E0B' : '#706D63'} size={20} />
          )}
        </TouchableOpacity>
      </View>
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

            <View className="flex-row items-center justify-end mb-4">
              <TouchableOpacity
                onPress={() => setFilterDrawerVisible(false)}
                className="bg-darkElevated p-2 rounded-full border border-border"
              >
                <X color="#F5F2E9" size={16} />
              </TouchableOpacity>
            </View>

            {/* Spoiler Toggles */}
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
            <View className="w-full">
              {SUB_TOPICS.map((topic) => {
                const isSelected = subTopic === topic.id;
                const IconComponent = topic.icon;
                const unreadField = 
                  topic.id === 'general' ? currentTopicInList?.unreadGeneral :
                  topic.id === 'acting' ? currentTopicInList?.unreadActing :
                  topic.id === 'cinematography' ? currentTopicInList?.unreadCinematography :
                  topic.id === 'plot' ? currentTopicInList?.unreadPlot :
                  topic.id === 'music' ? currentTopicInList?.unreadMusic :
                  topic.id === 'vfx' ? currentTopicInList?.unreadVfx : 0;
                return (
                  <TouchableOpacity
                    key={topic.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSubTopic(topic.id);
                      setFilterDrawerVisible(false);
                      dispatch(setActiveSubTopic(topic.id));
                      dispatch(markSubTopicAsRead({ tmdbId: Number(tmdbId), subTopic: topic.id }));
                    }}
                    className={`py-3.5 px-4 rounded-xl mb-2 border flex-row items-center justify-between ${
                      isSelected
                        ? 'bg-[#CBBD93]/10 border-[#CBBD93]'
                        : 'bg-[#1C1A16] border-[#2E2C26]'
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <IconComponent
                        size={18}
                        color={isSelected ? '#CBBD93' : '#8A867C'}
                        style={{ marginRight: 12 }}
                      />
                      <Text
                        className={`text-sm font-semibold tracking-wide ${
                          isSelected ? 'text-[#CBBD93] font-bold' : 'text-[#AFAAA0]'
                        }`}
                      >
                        {topic.label}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      {!isSelected && unreadField && unreadField > 0 ? (
                        <View className="bg-[#CBBD93] px-2 py-0.5 rounded-full items-center justify-center min-w-[20px] mr-2">
                          <Text className="text-[#0F0E0B] text-[10px] font-bold">
                            {unreadField}
                          </Text>
                        </View>
                      ) : null}
                      
                      {isSelected && (
                        <View className="w-2.5 h-2.5 rounded-full bg-[#CBBD93]" />
                      )}
                    </View>
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

      {/* Parent Message Preview Popup Modal */}
      <ParentMessageModal
        visible={parentModalVisible}
        message={previewMessage}
        onClose={() => {
          setParentModalVisible(false);
          setPreviewMessage(null);
        }}
      />

      {/* Context Loading Overlay Spinner */}
      {isContextLoading && (
        <View 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 10 }}
          className="bg-black/60 items-center justify-center"
        >
          <View className="bg-darkSurface border border-border p-5 rounded-2xl flex-row items-center">
            <ActivityIndicator size="small" color="#CBBD93" />
            <Text className="text-offWhite font-semibold text-sm ml-3.5">Locating original message...</Text>
          </View>
        </View>
      )}
      </Pressable>
    </KeyboardAvoidingView>
  );
};
