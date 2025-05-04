import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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
        <Image
          source={require('../assets/Inicio.png')}
          className="w-6 h-6 mb-1"
          resizeMode="contain"
        />
        <Text className="text-white text-xs">Inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center"
        onPress={() => navigation.navigate('Seguimiento')}
      >
        <Image
          source={require('../assets/Seguimiento.png')}
          className="w-6 h-6 mb-1"
          resizeMode="contain"
        />
        <Text className="text-white text-xs">Seguimiento</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center"
        onPress={() => navigation.navigate('Habitos')}
      >
        <Image
          source={require('../assets/Habitos.png')}
          className="w-6 h-6 mb-1"
          resizeMode="contain"
        />
        <Text className="text-white text-xs">Hábitos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center"
        onPress={() => navigation.navigate('Perfil')}
      >
        <Image
          source={require('../assets/Perfil.png')}
          className="w-6 h-6 mb-1"
          resizeMode="contain"
        />
        <Text className="text-white text-xs">Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavBar;