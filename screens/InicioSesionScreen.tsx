import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Image, View,Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Ajusta la ruta si es necesario
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Menu: undefined;
  Registro: undefined;
};

const InicioSesionScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('¡Inicio de Sesion !', 'El Inicio de Sesion fue Exitoso');
      navigation.replace('Menu');
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error.message);
    }
  };

  return (
    <View className="flex-1 bg-blue-500 items-center justify-center px-5">
      <Text className="text-white text-3xl font-bold mb-5">Bienvenido de nuevo</Text>

      <Image
        source={require('../assets/logo.png')}
        className="w-24 h-24 mb-5"
        resizeMode="contain"
      />

      <TextInput
        className="w-full h-12 bg-white border-2 border-black rounded-md px-3 mb-4 text-black"
        placeholder="Tu dirección de email"
        placeholderTextColor="#000"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="w-full h-12 bg-white border-2 border-black rounded-md px-3 mb-4 text-black"
        placeholder="Introduce tu contraseña"
        placeholderTextColor="#000"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-red-400 w-full py-3 rounded-md mb-4 items-center"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-base">Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
        <Text className="text-white text-sm">
          Nuevo Usuario? <Text className="underline">Regístrate</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default InicioSesionScreen;
