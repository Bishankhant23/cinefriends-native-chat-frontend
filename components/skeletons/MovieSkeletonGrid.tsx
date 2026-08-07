import React from 'react';
import { View } from 'react-native';
import Skeleton from './Skeleton';

export const MovieSkeletonGrid = () => {
  const items = Array.from({ length: 9 });
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {items.map((_, i) => (
        <View key={i} style={{ width: '31%', marginBottom: 16 }}>
          <Skeleton width="100%" height={140} borderRadius={12} style={{ marginBottom: 6 }} />
          <Skeleton width="80%" height={12} borderRadius={4} />
        </View>
      ))}
    </View>
  );
};

export default MovieSkeletonGrid;
