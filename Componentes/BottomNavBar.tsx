import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define los tipos para las rutas de navegación
type RootStackParamList = {
  Menu: undefined;
  Seguimiento: undefined;
  Habitos: undefined;
  Perfil: undefined;
  Inicio: undefined;
  Registro: undefined;
  InicioSesion: undefined;
  HomePerfil: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-row justify-around items-center bg-[#1D3A6D] py-4 border-t border-gray-300">
      <TouchableOpacity
        className="items-center"
        onPress={() => navigation.navigate('Menu')}
      >
        <Text className="text-white text-xs mt-1">Menú</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center"
        onPress={() => navigation.navigate('Seguimiento')}
      >
        <Text className="text-white text-xs mt-1">Seguimiento</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center"
        onPress={() => navigation.navigate('Habitos')}
      >
        <Text className="text-white text-xs mt-1">Hábitos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center"
        onPress={() => navigation.navigate('Perfil')}
      >
        <Text className="text-white text-xs mt-1">Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavBar;