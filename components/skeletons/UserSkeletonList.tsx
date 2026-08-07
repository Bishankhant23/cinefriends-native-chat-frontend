import React from 'react';
import { View } from 'react-native';
import Skeleton from './Skeleton';

export const UserSkeletonList = () => {
  const items = Array.from({ length: 6 });
  return (
    <View style={{ flexDirection: 'column' }}>
      {items.map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            marginBottom: 8,
            backgroundColor: '#1C1B17',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#2D2B24',
          }}
        >
          <Skeleton width={44} height={44} borderRadius={22} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="50%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
            <Skeleton width="30%" height={11} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default UserSkeletonList;
