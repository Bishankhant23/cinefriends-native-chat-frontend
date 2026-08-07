import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import { X, Film, Users, Calendar, Star } from 'lucide-react-native';
import { Topic } from '../store/slices/topicSlice';

interface MovieInfoModalProps {
  visible: boolean;
  topic: Topic | null;
  onClose: () => void;
  onLeaveTopic?: () => void;
}

export const MovieInfoModal: React.FC<MovieInfoModalProps> = ({
  visible,
  topic,
  onClose,
  onLeaveTopic,
}) => {
  if (!topic) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-darkSurface border-t border-border rounded-t-3xl h-[80%] overflow-hidden">
          {/* Header Backdrop */}
          <View className="relative h-44 w-full bg-darkElevated">
            {topic.backdrop ? (
              <Image
                source={{
                  uri: topic.backdrop.startsWith('http')
                    ? topic.backdrop
                    : `https://image.tmdb.org/t/p/w1280${topic.backdrop}`
                }}
                className="w-full h-full opacity-60"
              />
            ) : null}
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 bg-darkBg/80 p-2 rounded-full border border-khaki/30"
            >
              <X color="#F5F2E9" size={20} />
            </TouchableOpacity>

            <View className="absolute -bottom-6 left-4 flex-row items-end">
              {topic.poster ? (
                <Image
                  source={{
                    uri: topic.poster.startsWith('http')
                      ? topic.poster
                      : `https://image.tmdb.org/t/p/w500${topic.poster}`
                  }}
                  className="w-20 h-28 rounded-xl border-2 border-khaki shadow-lg bg-darkElevated"
                />
              ) : (
                <View className="w-20 h-28 rounded-xl border-2 border-khaki bg-darkElevated items-center justify-center">
                  <Film color="#CBBD93" size={32} />
                </View>
              )}
            </View>
          </View>

          {/* Details Scroll */}
          <ScrollView className="flex-1 pt-8 px-5">
            <Text className="text-offWhite font-bold text-2xl">{topic.title}</Text>

            <View className="flex-row items-center mt-2 space-x-4">
              {topic.releaseYear ? (
                <View className="flex-row items-center bg-darkElevated px-2.5 py-1 rounded-full border border-border">
                  <Calendar size={12} color="#CBBD93" />
                  <Text className="text-gray400 text-xs ml-1">{topic.releaseYear}</Text>
                </View>
              ) : null}

              <View className="flex-row items-center bg-darkElevated px-2.5 py-1 rounded-full border border-border ml-2">
                <Users size={12} color="#CBBD93" />
                <Text className="text-gray400 text-xs ml-1">
                  {topic.memberCount || 1} CineFriends Joined
                </Text>
              </View>
            </View>

            <Text className="text-khaki font-semibold text-base mt-6 mb-2">Movie Overview</Text>
            <Text className="text-gray400 text-sm leading-6">
              {topic.overview || 'No overview available for this movie topic.'}
            </Text>

            <View className="mt-8 mb-10">
              {onLeaveTopic && (
                <TouchableOpacity
                  onPress={onLeaveTopic}
                  className="bg-danger/20 border border-danger/40 py-3 rounded-xl items-center"
                >
                  <Text className="text-danger font-bold text-base">Leave Movie Topic</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
