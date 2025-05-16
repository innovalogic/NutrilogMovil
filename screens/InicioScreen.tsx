import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define los tipos para las rutas de navegación
type RootStackParamList = {
  Inicio: undefined;
  Registro: undefined;
  InicioSesion: undefined;
  HomePerfil: undefined;
  Menu: undefined;
  Seguimiento: undefined;
  Habitos: undefined;
  Perfil: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function InicioScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 items-center justify-center bg-[#374151]">
      <Image
        source={require('../assets/logosinfondo6.png')}
        className="w-56 h-56 mb-4"
        resizeMode="contain"
      />
      <Text className="text-white text-4xl font-extrabold mb-8">NUTRILOG</Text>
      <TouchableOpacity
        className="bg-red-500 px-20 py-3 rounded-[30px] mb-4"
        onPress={() => navigation.navigate('InicioSesion')}
      >
        <Text className="text-white text-lg font-semibold">Inicio de Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-blue-500 px-24 py-3 rounded-[30px]"
        onPress={() => navigation.navigate('Registro')}
      >
        <Text className="text-white text-lg font-semibold">Registrarse</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}