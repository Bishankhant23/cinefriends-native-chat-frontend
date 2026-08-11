import React, { useState } from 'react';
import { View, TextInput, TextInputProps, ViewStyle, TextStyle, Platform } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  style?: TextStyle;
}

export default function SearchInput({ containerStyle, style, onFocus, onBlur, ...props }: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`flex-row bg-darkElevated h-11 rounded-xl px-3.5 items-center border transition-colors ${
        isFocused ? 'border-primary' : 'border-border'
      }`}
      style={[
        {
          backgroundColor: '#2A2922',
          height: 44,
          borderRadius: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isFocused ? '#CBBD93' : '#2D2B24',
        },
        containerStyle,
      ]}
    >
      <Search size={18} color={isFocused ? '#CBBD93' : '#706D63'} />
      <TextInput
        className="flex-1 ml-2.5 text-textPrimary text-sm py-0"
        placeholderTextColor="#706D63"
        style={[
          {
            flex: 1,
            marginLeft: 10,
            color: '#F5F2E9',
            fontSize: 14,
            paddingVertical: 0,
            outlineStyle: 'none',
          } as any,
          style,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}
