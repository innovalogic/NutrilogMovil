import React from 'react';
import { View, Text,TouchableOpacity } from 'react-native';
import BottomNavBar from '../../Componentes/BottomNavBar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

export default function Cardio() {

  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 bg-[#5F75E4]">
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-2xl font-bold">Pantalla de Hábitos</Text>

        <TouchableOpacity
                className="bg-white px-20 py-3 rounded-[30px] mb-4 "
              >
                <Text className="text-black text-2xl font-bold">Cardio</Text>
                <Text className="text-black text-lg font-semibold">Salud cardiovascular y</Text>
                <Text className="text-black text-lg font-semibold">perdida de peso</Text>
              </TouchableOpacity>

      </View>
      <BottomNavBar />
    </View>
  );
}