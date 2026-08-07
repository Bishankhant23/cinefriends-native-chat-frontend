import React from 'react';
import { View, Text } from 'react-native';
import { ChatMessage } from '../store/slices/topicSlice';
import { format } from 'date-fns';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, isSelf }) => {
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
    <View className={`flex-row my-1.5 px-3.5 ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
          isSelf
            ? 'bg-khaki/20 border border-khaki/40 rounded-br-xs'
            : 'bg-darkElevated border border-border rounded-bl-xs'
        }`}
      >
        {!isSelf && (
          <Text className="text-khaki font-bold text-xs mb-1">
            @{message.sender?.username || 'CineFriend'}
          </Text>
        )}

        <Text className="text-offWhite text-sm leading-5">{message.content}</Text>

        <Text className={`text-[10px] mt-1 text-right ${isSelf ? 'text-khaki/80' : 'text-gray500'}`}>
          {timeFormatted}
        </Text>
      </View>
    </View>
  );
};
