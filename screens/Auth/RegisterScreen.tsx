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
import { Film, Lock, Mail, User, UserCheck } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerThunk, clearError } from '../../store/slices/userSlice';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.user);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!email.trim() || !username.trim() || !password.trim()) return;
    dispatch(
      registerThunk({
        email: email.trim(),
        username: username.trim(),
        name: name.trim() || username.trim(),
        password: password.trim(),
      })
    );
  };

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
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 64, height: 64, backgroundColor: '#1C1B17', borderWidth: 2, borderColor: '#CBBD93', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Film color="#CBBD93" size={32} />
          </View>
          <Text style={{ color: '#F5F2E9', fontSize: 24, fontWeight: 'bold' }}>Join CineFriends Chat</Text>
          <Text style={{ color: '#A39B8A', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Create an account to join and discuss movie topics in real-time
          </Text>
        </View>

        {error ? (
          <View style={{ backgroundColor: 'rgba(248, 113, 113, 0.2)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.4)', padding: 12, borderRadius: 12, marginBottom: 24 }}>
            <Text style={{ color: '#F87171', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: '#1C1B17', borderWidth: 1, borderColor: '#2D2B24', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Mail color="#80775C" size={20} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#706D63"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) dispatch(clearError());
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{ flex: 1, marginLeft: 12, color: '#F5F2E9', fontSize: 16 }}
            />
          </View>

          <View style={{ backgroundColor: '#1C1B17', borderWidth: 1, borderColor: '#2D2B24', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <User color="#80775C" size={20} />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#706D63"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (error) dispatch(clearError());
              }}
              autoCapitalize="none"
              style={{ flex: 1, marginLeft: 12, color: '#F5F2E9', fontSize: 16 }}
            />
          </View>

          <View style={{ backgroundColor: '#1C1B17', borderWidth: 1, borderColor: '#2D2B24', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <UserCheck color="#80775C" size={20} />
            <TextInput
              placeholder="Display Name (Optional)"
              placeholderTextColor="#706D63"
              value={name}
              onChangeText={setName}
              style={{ flex: 1, marginLeft: 12, color: '#F5F2E9', fontSize: 16 }}
            />
          </View>

          <View style={{ backgroundColor: '#1C1B17', borderWidth: 1, borderColor: '#2D2B24', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Lock color="#80775C" size={20} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#706D63"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) dispatch(clearError());
              }}
              style={{ flex: 1, marginLeft: 12, color: '#F5F2E9', fontSize: 16 }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={isLoading}
            style={{ backgroundColor: '#CBBD93', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 16 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#0F0E0B" />
            ) : (
              <Text style={{ color: '#0F0E0B', fontWeight: 'bold', fontSize: 18 }}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
          <Text style={{ color: '#A39B8A', fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: '#CBBD93', fontWeight: 'bold', fontSize: 14 }}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
