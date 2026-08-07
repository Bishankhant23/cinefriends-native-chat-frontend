import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  FlatListProps,
} from 'react-native';
import apiInstance from '../services/apiInstance';

interface CustomFlatListPagePaginationProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  apiUrl?: string;
  serviceFn?: (params: any) => Promise<any>;
  dataKey?: string;

  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;

  queryParams?: Record<string, any>;
  pageSize?: number;

  onDataFetched?: (data: T[]) => void;

  externalData?: T[];

  ListEmptyComponent?: React.ReactElement | React.ComponentType<any> | null;
  ListHeaderComponent?: React.ReactElement | React.ComponentType<any> | null;
  contentContainerStyle?: any;
  renderSkeletonItem?: (index: number) => React.ReactNode;
}

const getValueFromPath = (obj: any, path: string) => {
  if (!path) return obj;
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

function CustomFlatListPagePagination<T>({
  apiUrl,
  serviceFn,
  dataKey = '',
  renderItem,
  keyExtractor = (_, index) => index.toString(),
  queryParams = {},
  pageSize = 20,
  onDataFetched,
  externalData,
  ListEmptyComponent,
  ListHeaderComponent,
  contentContainerStyle,
  renderSkeletonItem,
  ...flatListProps
}: CustomFlatListPagePaginationProps<T>) {
  const isControlled = !!externalData;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  const queryParamsString = JSON.stringify(queryParams);

  useEffect(() => {
    if (!isControlled) {
      setData([]);
      setPage(1);
      setHasMore(true);
      setError(null);
    }
  }, [queryParamsString, isControlled]);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isFetchingRef.current || isControlled) return;
      if (!isRefresh && !hasMore) return;

      isFetchingRef.current = true;
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      try {
        const currentPage = isRefresh ? 1 : page;
        const params = {
          page: currentPage,
          limit: pageSize,
          ...queryParams,
        };

        let response;
        if (serviceFn) {
          response = await serviceFn(params);
        } else if (apiUrl) {
          const res = await apiInstance.get(apiUrl, { params });
          response = res.data;
        } else {
          throw new Error('Either apiUrl or serviceFn must be provided.');
        }

        const newData: T[] = dataKey ? getValueFromPath(response, dataKey) || [] : (Array.isArray(response) ? response : (response.results || response.topics || response.items || []));

        setData((prev) => {
          const updated = isRefresh ? newData : [...prev, ...newData];
          onDataFetched?.(updated);
          return updated;
        });

        setHasMore(newData.length >= pageSize);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [apiUrl, serviceFn, page, queryParamsString, hasMore, isControlled, dataKey, pageSize, onDataFetched]
  );

  useEffect(() => {
    if (!isControlled) {
      fetchData();
    }
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore && !isControlled && !isFetchingRef.current) {
      setPage((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    if (isControlled) return;
    setHasMore(true);
    setPage(1);
    fetchData(true);
  };

  const handleRetry = () => {
    fetchData();
  };

  const renderFooter = useMemo(() => {
    if (!loading || isControlled || data.length === 0) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#CBBD93" />
      </View>
    );
  }, [loading, isControlled, data.length]);

  const renderEmpty = useMemo(() => {
    if (loading || refreshing) return null;

    if (error) {
      return (
        <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
          <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 12 }}>{error}</Text>
          <TouchableOpacity
            onPress={handleRetry}
            style={{ backgroundColor: '#CBBD93', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 }}
          >
            <Text style={{ color: '#0F0E0B', fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      ListEmptyComponent || (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: '#706D63' }}>No Data Found</Text>
        </View>
      )
    );
  }, [loading, refreshing, error, ListEmptyComponent]);

  const showSkeleton = loading && data.length === 0 && !!renderSkeletonItem;

  return (
    <FlatList
      data={showSkeleton ? ([...Array(6)] as any) : (isControlled ? externalData : data)}
      renderItem={({ item, index }) => {
        if (showSkeleton) {
          return renderSkeletonItem!(index) as any;
        }
        return renderItem({ item, index });
      }}
      keyExtractor={(item, index) => {
        if (showSkeleton) return `skeleton-${index}`;
        return keyExtractor(item, index);
      }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={contentContainerStyle}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      {...flatListProps}
    />
  );
}

export default React.memo(CustomFlatListPagePagination) as typeof CustomFlatListPagePagination;
