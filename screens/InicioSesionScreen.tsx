import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

export default function InicioSesionScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 items-center justify-center bg-[#FF6464]">
      <Text className="text-white text-2xl font-bold mb-8">Pantalla de Inicio de Sesión</Text>
      <TouchableOpacity
        className="bg-blue-500 px-24 py-3 rounded-[30px]"
        onPress={() => navigation.navigate('HomePerfil')}
      >
        <Text className="text-white text-lg font-semibold">Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}