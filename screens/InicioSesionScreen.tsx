import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Image, View, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Ajusta la ruta si es necesario
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Seguimiento: undefined;
  Registro: undefined;
};

const InicioSesionScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('¡Inicio de Sesión!', 'El Inicio de Sesión fue Exitoso');
      navigation.replace('Seguimiento');
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error.message);
    }
  };

  return (
    <View className="flex-1 bg-blue-500 items-center justify-center px-5">
      <Text className="text-white text-3xl font-bold mb-5">Bienvenido de nuevo</Text>
      <Text className="text-white text-3xl font-bold mb-5">A NutriLog</Text>

      <Image
        source={require('../assets/logosinfondo7.png')}
        className="w-56 h-56 mb-5"
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
        className="bg-green-500 w-full py-3 rounded-md mb-4 items-center"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-base">Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-red-600 py-3 px-5 mb-5 rounded w-full items-center"
        /*disabled={!request}
        onPress={() => promptAsync()}*/
      >
        <Text className="text-white font-bold">Registro con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
        <Text className="text-white mt-5 underline">
          Nuevo Usuario? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default InicioSesionScreen;