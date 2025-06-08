import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert,Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
//import { useGoogleSignIn } from '../Componentes/googleAuth'; // o el path correcto

type RootStackParamList = {
  RegistroPerfil: undefined;
  InicioSesion: undefined;
};

const RegistroScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  //const { promptAsync, request } = useGoogleSignIn();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Éxito', 'Usuario registrado correctamente 🎉');
      navigation.navigate('RegistroPerfil');
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-5">
      <Text className="text-3xl font-bold text-black mb-8">Bienvenidos a Nutrilog</Text>
      <Text className="text-3xl font-bold text-black mb-8">Inicia con el Registro</Text>
      <Image
              source={require('../assets/logosinfondo2.png')}
              className="w-44 h-44 mb-5"
              resizeMode="contain"
            />

      <TextInput
        className="bg-white w-full h-12 border border-gray-300 mb-5 px-3 rounded"
        placeholder="Tu dirección de email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="bg-white w-full h-12 border border-gray-300 mb-5 px-3 rounded"
        placeholder="Tu contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity className="bg-blue-700 py-3 px-5 mb-5 rounded w-full items-center" onPress={handleRegister}>
        <Text className="text-white font-bold">Registrar</Text>
      </TouchableOpacity>
      {/*
      <TouchableOpacity
      className="bg-red-600 py-3 px-5 mb-5 rounded w-full items-center"
      </View>disabled={!request}
      onPress={() => promptAsync()}
    >
      <Text className="text-white font-bold">Registro con Google</Text>
    </TouchableOpacity>
    */}
      <TouchableOpacity onPress={() => navigation.navigate('InicioSesion')}>
        <Text className="text-black mt-5 underline">¿Tienes cuenta? Inicia Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegistroScreen;