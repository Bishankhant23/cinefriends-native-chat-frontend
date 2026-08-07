import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Users, Film } from 'lucide-react-native';
import { Topic } from '../store/slices/topicSlice';
import { formatDistanceToNow } from 'date-fns';

interface TopicCardProps {
  topic: Topic;
  onPress: () => void;
  onJoinPress?: () => void;
  isExplore?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onPress,
  onJoinPress,
  isExplore = false,
}) => {
  const formattedTime = topic.lastMessageAt
    ? formatDistanceToNow(new Date(topic.lastMessageAt), { addSuffix: true })
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center p-3.5 mb-2 bg-darkSurface rounded-xl border border-border/40"
    >
      {/* Movie Poster Avatar */}
      <View className="relative">
        {topic.poster ? (
          <Image
            source={{
              uri: topic.poster.startsWith('http')
                ? topic.poster
                : `https://image.tmdb.org/t/p/w500${topic.poster}`
            }}
            className="w-14 h-14 rounded-lg bg-darkElevated"
            resizeMode="cover"
          />
        ) : (
          <View className="w-14 h-14 rounded-lg bg-darkElevated items-center justify-center border border-khaki/30">
            <Film color="#CBBD93" size={24} />
          </View>
        )}
        <View className="absolute -bottom-1 -right-1 bg-khaki px-1.5 py-0.5 rounded-full flex-row items-center">
          <Users size={10} color="#0F0E0B" />
          <Text className="text-[10px] font-bold text-darkBg ml-0.5">
            {topic.memberCount || 1}
          </Text>
        </View>
      </View>

      {/* Movie Topic Info */}
      <View className="flex-1 ml-3.5 justify-center">
        <View className="flex-row items-center justify-between">
          <Text className="text-offWhite font-semibold text-base flex-1 pr-2" numberOfLines={1}>
            {topic.title}
          </Text>
          {!isExplore && formattedTime ? (
            <Text className="text-gray500 text-xs">{formattedTime}</Text>
          ) : null}
        </View>

        <Text className="text-gray400 text-xs mt-0.5" numberOfLines={1}>
          {topic.lastMessage || topic.overview || 'Join the movie topic discussion...'}
        </Text>
      </View>

      {/* Join Action for Explore Tab */}
      {isExplore && (
        <TouchableOpacity
          onPress={onJoinPress}
          className={`px-3 py-1.5 rounded-lg ml-2 ${
            topic.isJoined ? 'bg-darkElevated border border-khaki/40' : 'bg-khaki'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              topic.isJoined ? 'text-khaki' : 'text-darkBg'
            }`}
          >
            {topic.isJoined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
