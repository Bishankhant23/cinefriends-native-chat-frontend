import React from 'react';
import { View } from 'react-native';
import Skeleton from './Skeleton';

export const DiscussionSkeletonList = () => {
  const items = Array.from({ length: 5 });
  return (
    <View style={{ flexDirection: 'column' }}>
      {items.map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            marginBottom: 8,
            backgroundColor: '#1C1B17',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(45,43,36,0.6)',
          }}
        >
          <Skeleton width={56} height={56} borderRadius={8} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="65%" height={15} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width="90%" height={12} borderRadius={4} />
          </View>
          <Skeleton width={48} height={24} borderRadius={8} style={{ marginLeft: 8 }} />
        </View>
      ))}
    </View>
  );
};

export default DiscussionSkeletonList;
