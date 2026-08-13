import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CornerUpLeft } from 'lucide-react-native';
import { ChatMessage } from '../store/slices/topicSlice';
import { format } from 'date-fns';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
  onLongPress?: () => void;
  onPressParent?: (replyToId: string) => void;
  highlighted?: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isSelf,
  onLongPress,
  onPressParent,
  highlighted,
}) => {
  const timeFormatted = message.createdAt
    ? format(new Date(message.createdAt), 'h:mm a')
    : '';

  if (message.messageType === 'SYSTEM') {
    return (
      <View className="align-center items-center my-2 px-4">
        <View className="bg-darkElevated/80 px-3 py-1 rounded-full border border-khaki/20">
          <Text className="text-gray400 text-xs text-center">{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className={`flex-row py-2 px-3.5 items-center transition-all duration-300 ${
        isSelf ? 'justify-end' : 'justify-start'
      } ${
        highlighted
          ? 'bg-[#CBBD93]/15 border-y border-[#CBBD93]/35'
          : 'border-y border-transparent'
      }`}
    >
      {/* Reply Button on the left for own messages */}
      {isSelf && onLongPress && (
        <TouchableOpacity
          onPress={onLongPress}
          className="mr-2.5 p-1.5 rounded-full bg-darkElevated border border-border/60 hover:bg-[#CBBD93]/10"
        >
          <CornerUpLeft size={12} color="#CBBD93" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        activeOpacity={onLongPress ? 0.85 : 1}
        onLongPress={onLongPress}
        onPress={onLongPress} // Support single tap for reply on web/desktop too
        style={{ maxWidth: '75%' }}
        className={`px-3.5 py-2.5 rounded-2xl transition-all duration-300 ${
          highlighted
            ? isSelf
              ? 'bg-[#CBBD93]/35 border border-[#CBBD93] rounded-br-xs scale-[1.01]'
              : 'bg-[#CBBD93]/25 border border-[#CBBD93]/50 rounded-bl-xs scale-[1.01]'
            : isSelf
            ? 'bg-[#CBBD93]/10 border border-[#CBBD93]/30 rounded-br-xs'
            : 'bg-darkElevated border border-border rounded-bl-xs'
        }`}
      >
        {!isSelf && (
          <Text className="text-[#CBBD93] font-bold text-xs mb-1">
            @{message.sender?.username || 'CineFriend'}
          </Text>
        )}

        {/* Reply Quote Header */}
        {message.replyToUser && (
          <TouchableOpacity
            activeOpacity={onPressParent && message.replyToId ? 0.7 : 1}
            onPress={() => {
              if (onPressParent && message.replyToId) {
                onPressParent(message.replyToId);
              }
            }}
            className="bg-darkBg/60 border-l-2 border-[#CBBD93] px-2.5 py-1.5 rounded-lg mb-2"
          >
            <Text className="text-[#CBBD93] font-bold text-[10px] uppercase tracking-wider">
              @{message.replyToUser}
            </Text>
            <Text className="text-[#9C988F] text-xs mt-0.5" numberOfLines={2}>
              {message.replyToContent}
            </Text>
          </TouchableOpacity>
        )}

        <Text className="text-offWhite text-sm leading-5">{message.content}</Text>

        <Text className={`text-[10px] mt-1 text-right ${isSelf ? 'text-khaki/80' : 'text-gray500'}`}>
          {timeFormatted}
        </Text>
      </TouchableOpacity>

      {/* Reply Button on the right for others' messages */}
      {!isSelf && onLongPress && (
        <TouchableOpacity
          onPress={onLongPress}
          className="ml-2.5 p-1.5 rounded-full bg-darkElevated border border-border/60 hover:bg-[#CBBD93]/10"
        >
          <CornerUpLeft size={12} color="#CBBD93" />
        </TouchableOpacity>
      )}
    </View>
  );
};
