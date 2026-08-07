import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Avatar from './Avatar';

interface UserItemProps {
  userId?: string;
  name: string;
  username: string;
  profilePic?: string;
  onPress?: () => void;
}

export default function UserItem({
  userId,
  name,
  username,
  profilePic,
  onPress,
}: UserItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1A14',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Avatar name={name || username} uri={profilePic} size={44} />

      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ color: '#F5F0E8', fontWeight: '600', fontSize: 16 }} numberOfLines={1}>
          {name || username}
        </Text>
        <Text style={{ color: '#706D63', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          @{username}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
