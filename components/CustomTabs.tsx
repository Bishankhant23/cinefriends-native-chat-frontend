import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export interface TabItem {
  id: string;
  label: string;
}

interface CustomTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  containerClassName?: string;
  textClassName?: string;
  activeTextClassName?: string;
}

const STATIC_HEIGHT = 42;

export default function CustomTabs({
  tabs,
  activeTabId,
  onTabChange,
  containerClassName = '',
  textClassName = 'text-xs',
  activeTextClassName = 'text-khaki',
}: CustomTabsProps) {
  return (
    <View
      className={containerClassName}
      style={{ height: STATIC_HEIGHT, maxHeight: STATIC_HEIGHT }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: STATIC_HEIGHT }}
        contentContainerStyle={{ height: STATIC_HEIGHT }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.1)',
            height: '100%',
            width: '100%',
            gap: 28,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.7}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  borderBottomWidth: isActive ? 2 : 0,
                  borderBottomColor: isActive ? '#CBBD93' : 'transparent',
                  paddingHorizontal: 8,
                  paddingBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    fontSize: 12,
                    color: isActive ? '#CBBD93' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
