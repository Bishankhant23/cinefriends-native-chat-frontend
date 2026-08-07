import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, LogOut, Film, ShieldCheck } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutThunk } from '../../store/slices/userSlice';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  return (
    <View
      style={{ paddingTop: Math.max(insets.top + 16, 24) }}
      className="flex-1 bg-darkBg px-6"
    >
      {/* User Header Card */}
      <View className="items-center bg-darkSurface border border-border p-6 rounded-3xl mb-8 shadow-xl">
        <Image
          source={{
            uri:
              user?.profilePic ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || user?.username || 'User'
              )}&background=CBBD93&color=0F0E0B`,
          }}
          className="w-24 h-24 rounded-full border-2 border-khaki mb-4"
        />
        <Text className="text-offWhite font-bold text-2xl">{user?.name || user?.username}</Text>
        <Text className="text-khaki text-sm mt-0.5 font-semibold">@{user?.username}</Text>
        <Text className="text-gray500 text-xs mt-1">{user?.email}</Text>

        <View className="mt-4 bg-darkElevated px-3 py-1.5 rounded-full border border-khaki/30 flex-row items-center">
          <ShieldCheck size={14} color="#CBBD93" />
          <Text className="text-khaki font-semibold text-xs ml-1.5">CineFriends Account Connected</Text>
        </View>
      </View>

      {/* Account Info Stats */}
      <View className="bg-darkSurface border border-border rounded-2xl p-4 mb-8 space-y-4">
        <View className="flex-row items-center justify-between border-b border-border/50 pb-3">
          <View className="flex-row items-center">
            <Film color="#80775C" size={20} />
            <Text className="text-gray400 text-sm ml-3">Platform</Text>
          </View>
          <Text className="text-offWhite font-semibold text-sm">CineFriends Chat</Text>
        </View>

        <View className="flex-row items-center justify-between pt-1">
          <View className="flex-row items-center">
            <User color="#80775C" size={20} />
            <Text className="text-gray400 text-sm ml-3">Account Type</Text>
          </View>
          <Text className="text-khaki font-semibold text-sm">Movie Topic Member</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={() => dispatch(logoutThunk())}
        className="bg-danger/20 border border-danger/40 py-4 rounded-xl items-center flex-row justify-center shadow-lg"
      >
        <LogOut color="#F87171" size={20} />
        <Text className="text-danger font-bold text-base ml-2">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};
