import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { POSTER_PREFIX } from '../constants/api';

interface MovieItemProps {
  title: string;
  poster: string;
  username?: string;
  variant?: 'vertical' | 'horizontal';
  onPress?: () => void;
  overlayCount?: number;
}

const MovieItem: React.FC<MovieItemProps> = ({
  title,
  poster,
  username,
  variant = 'vertical',
  onPress,
  overlayCount,
}) => {
  const imageUrl = poster
    ? poster.startsWith('http')
      ? poster
      : `${POSTER_PREFIX}${poster}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300&auto=format&fit=crop';

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          backgroundColor: '#1C1B17',
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#2D2B24',
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 96, aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: '#2A2922' }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#F5F2E9', fontWeight: 'bold', fontSize: 18 }} numberOfLines={2}>
              {title}
            </Text>
            {username && (
              <Text style={{ color: '#A39B8A', fontSize: 14, marginTop: 4 }}>
                @{username}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ width: '100%', padding: 4, marginBottom: 12 }}
    >
      <View
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#2A2922',
          aspectRatio: 2 / 3,
          position: 'relative',
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%', borderRadius: 12 }}
          resizeMode="cover"
        />
        {overlayCount !== undefined && overlayCount > 0 && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 20 }}>+{overlayCount}</Text>
          </View>
        )}
      </View>
      {!!title && (
        <Text style={{ color: '#F5F2E9', fontSize: 12, fontWeight: 'bold', marginTop: 8 }} numberOfLines={1}>
          {title}
        </Text>
      )}
      {username && (
        <Text style={{ color: '#706D63', fontSize: 10, marginTop: 2 }} numberOfLines={1}>
          @{username}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default MovieItem;
