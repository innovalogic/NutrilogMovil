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
  CategoriasEjercicioFisico: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-row justify-evenly items-center bg-black py-4 border-t border-black">
      <TouchableOpacity
        className="flex-1 items-center justify-center"
        onPress={() => navigation.navigate('Seguimiento')}
      >
        <Image
          source={require('../assets/Seguimiento.png')}
          className="w-6 h-6 mb-1"
          resizeMode="contain"
        />
        <Text className="text-white text-xs font-extrabold">Seguimiento</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 items-center justify-center"
        onPress={() => navigation.navigate('Habitos')}
      >
        <Image
          source={require('../assets/Habitos.png')}
          className="w-6 h-6 mb-1"
          resizeMode="contain"
        />
        <Text className="text-white text-xs font-extrabold">Hábitos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 items-center justify-center"
        onPress={() => navigation.navigate('Perfil')}
      >
        <Image
          source={require('../assets/Perfil.png')}
          className="w-6 h-6 mb-1"
          resizeMode="contain"
        />
        <Text className="text-white text-xs font-extrabold">Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavBar;