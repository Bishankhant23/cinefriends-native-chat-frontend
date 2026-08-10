import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Film, Lock, User, LogIn, Sparkles } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginThunk, loginWithCineFriendsThunk, clearError } from '../../store/slices/userSlice';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.user);

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = () => {
    if (!loginIdentifier.trim() || !password.trim()) {
      setLocalError('Please enter both Username/Email and Password.');
      return;
    }
    setLocalError(null);
    dispatch(loginThunk({ loginIdentifier: loginIdentifier.trim(), password: password.trim() }));
  };

  const handleCineFriendsLogin = () => {
    if (!loginIdentifier.trim() || !password.trim()) {
      setLocalError('Please enter both Username/Email and Password.');
      return;
    }
    setLocalError(null);
    dispatch(loginWithCineFriendsThunk({ loginIdentifier: loginIdentifier.trim(), password: password.trim() }));
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={Platform.OS !== 'web'}
      style={{ flex: 1, backgroundColor: '#0F0E0B' }}
      className="flex-1 bg-darkBg"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ width: 80, height: 80, backgroundColor: '#1C1B17', borderWidth: 2, borderColor: '#CBBD93', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Film color="#CBBD93" size={42} />
          </View>
          <Text style={{ color: '#F5F2E9', fontSize: 30, fontWeight: '800', letterSpacing: -0.5 }}>CineFriends</Text>
          <Text style={{ color: '#CBBD93', fontWeight: '600', fontSize: 16, letterSpacing: 2, marginTop: 4 }}>
            MOVIE CHAT TOPICS
          </Text>
          <Text style={{ color: '#A39B8A', fontSize: 13, textAlign: 'center', marginTop: 8, paddingHorizontal: 16 }}>
            Log in with your existing CineFriends credentials to join movie topic groups!
          </Text>
        </View>

        {/* Error Alert */}
        {displayError ? (
          <View style={{ backgroundColor: 'rgba(248, 113, 113, 0.2)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.4)', padding: 12, borderRadius: 12, marginBottom: 24 }}>
            <Text style={{ color: '#F87171', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{displayError}</Text>
          </View>
        ) : null}

        {/* Form Inputs */}
        <View style={{ gap: 16 }}>
          <View
            style={{
              backgroundColor: '#1C1B17',
              borderWidth: 1,
              borderColor: isUsernameFocused ? '#CBBD93' : '#2D2B24',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              shadowColor: '#CBBD93',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isUsernameFocused ? 0.15 : 0,
              shadowRadius: 6,
              elevation: isUsernameFocused ? 2 : 0,
            }}
          >
            <User color={isUsernameFocused ? '#CBBD93' : '#80775C'} size={20} />
            <TextInput
              placeholder="Username or Email"
              placeholderTextColor="#706D63"
              value={loginIdentifier}
              onChangeText={(text) => {
                setLoginIdentifier(text);
                if (localError) setLocalError(null);
                if (error) dispatch(clearError());
              }}
              autoCapitalize="none"
              style={{ flex: 1, marginLeft: 12, color: '#F5F2E9', fontSize: 16, outlineStyle: 'none' } as any}
              onFocus={() => setIsUsernameFocused(true)}
              onBlur={() => setIsUsernameFocused(false)}
            />
          </View>

          <View
            style={{
              backgroundColor: '#1C1B17',
              borderWidth: 1,
              borderColor: isPasswordFocused ? '#CBBD93' : '#2D2B24',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              shadowColor: '#CBBD93',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isPasswordFocused ? 0.15 : 0,
              shadowRadius: 6,
              elevation: isPasswordFocused ? 2 : 0,
            }}
          >
            <Lock color={isPasswordFocused ? '#CBBD93' : '#80775C'} size={20} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#706D63"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (localError) setLocalError(null);
                if (error) dispatch(clearError());
              }}
              style={{ flex: 1, marginLeft: 12, color: '#F5F2E9', fontSize: 16, outlineStyle: 'none' } as any}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
          </View>

          {/* Standard Login */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={isLoading}
            style={{ backgroundColor: '#CBBD93', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 8 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#0F0E0B" />
            ) : (
              <>
                <LogIn color="#0F0E0B" size={20} />
                <Text style={{ color: '#0F0E0B', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Log In</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2D2B24' }} />
            <Text style={{ color: '#706D63', marginHorizontal: 12, fontSize: 12, textTransform: 'uppercase' }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2D2B24' }} />
          </View>

          {/* CineFriends OAuth / SSO Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCineFriendsLogin}
            disabled={isLoading}
            style={{ backgroundColor: '#1C1B17', borderWidth: 1.5, borderColor: '#CBBD93', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
          >
            {isLoading ? (
              <ActivityIndicator color="#CBBD93" />
            ) : (
              <>
                <Sparkles color="#CBBD93" size={20} />
                <Text style={{ color: '#CBBD93', fontWeight: 'bold', fontSize: 17, marginLeft: 8 }}>Log in with CineFriends</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
          <Text style={{ color: '#A39B8A', fontSize: 14 }}>Don't have a CineFriends account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: '#CBBD93', fontWeight: 'bold', fontSize: 14 }}>Create One</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
