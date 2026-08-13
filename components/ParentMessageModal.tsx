import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity } from 'react-native';
import { X, MessageSquare, User } from 'lucide-react-native';
import { ChatMessage } from '../store/slices/topicSlice';
import { format } from 'date-fns';

interface ParentMessageModalProps {
  visible: boolean;
  message: ChatMessage | null;
  onClose: () => void;
}

export const ParentMessageModal: React.FC<ParentMessageModalProps> = ({
  visible,
  message,
  onClose,
}) => {
  if (!message) return null;

  const timeFormatted = message.createdAt
    ? format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')
    : '';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/75 justify-center items-center px-5"
      >
        {/* Prevent taps inside card from closing modal */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-darkSurface border border-border rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <View className="px-4 py-3 bg-darkElevated border-b border-border flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MessageSquare size={16} color="#CBBD93" />
              <Text className="text-khaki font-bold text-xs uppercase tracking-wider ml-2">
                Original Message Context
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-1 rounded-full"
            >
              <X color="#F5F2E9" size={16} />
            </TouchableOpacity>
          </View>

          {/* Message Content Body */}
          <View className="p-5">
            {/* Sender Meta info */}
            <View className="flex-row items-center mb-3">
              {message.sender?.profilePic ? (
                <Image
                  source={{ uri: message.sender.profilePic }}
                  className="w-8 h-8 rounded-full border border-khaki/30 mr-2.5"
                />
              ) : (
                <View className="w-8 h-8 rounded-full bg-darkElevated border border-khaki/30 items-center justify-center mr-2.5">
                  <User size={14} color="#CBBD93" />
                </View>
              )}
              <View>
                <Text className="text-offWhite font-bold text-sm">
                  @{message.sender?.username || 'CineFriend'}
                </Text>
                <Text className="text-gray500 text-[10px]">{timeFormatted}</Text>
              </View>
            </View>

            {/* Quoted parent message box if this message was also a reply */}
            {message.replyToUser && (
              <View className="bg-darkBg/40 border-l-2 border-[#CBBD93]/60 px-3 py-1.5 rounded-r-lg mb-3">
                <Text className="text-[#CBBD93]/80 font-bold text-[9px] uppercase tracking-wider">
                  @{message.replyToUser}
                </Text>
                <Text className="text-gray500 text-xs mt-0.5" numberOfLines={1}>
                  {message.replyToContent}
                </Text>
              </View>
            )}

            {/* Content text */}
            <View className="bg-darkBg/60 border border-border/40 p-4 rounded-xl">
              <Text className="text-offWhite text-sm leading-6">
                {message.content}
              </Text>
            </View>
          </View>

          {/* Action button */}
          <View className="px-5 pb-5">
            <TouchableOpacity
              onPress={onClose}
              className="bg-khaki py-2.5 rounded-xl items-center"
            >
              <Text className="text-darkBg font-bold text-sm">Close Context Preview</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
