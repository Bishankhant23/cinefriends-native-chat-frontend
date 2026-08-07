import React from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: number;
  borderRadius?: number;
  containerStyle?: ViewStyle;
  height?: number;
  width?: number;
}

const Avatar = ({ name, uri, size = 48, borderRadius, containerStyle, height, width }: AvatarProps) => {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const fontSize = size * 0.35;
  const radius = borderRadius ?? size / 2;
  const w = width || size;
  const h = height || size;

  return (
    <View
      style={[
        {
          borderWidth: 2,
          borderColor: '#CBBD93',
          padding: 2,
          backgroundColor: '#1C1A14',
          alignItems: 'center',
          justifyContent: 'center',
          width: w,
          height: h,
          borderRadius: radius,
        },
        containerStyle,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%', borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            backgroundColor: '#2A2820',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius,
          }}
        >
          <Text
            style={{
              fontWeight: 'bold',
              color: '#CBBD93',
              fontSize,
            }}
          >
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Avatar;
